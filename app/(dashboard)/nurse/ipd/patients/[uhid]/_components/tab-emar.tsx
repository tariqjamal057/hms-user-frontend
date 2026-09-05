// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-emar.tsx
"use client";
import { useMemo } from "react";
import { CheckCircle2, ClipboardList, PackageX, Pill, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { PillButton } from "@/components/forms/pill-button";
import { InfoTile } from "@/components/patient-detail/info-tile";
import type { EmarDose } from "@/types/nurse/ipd/nurse-ipd-types";
import { CURRENT_NURSE } from "@/lib/nurse/ipd/nurse-ipd-data";
import { UrgencyBadge } from "../../_components/nurse-ipd-badges";

export function TabEmar({ doses, onUpdateDose }: { doses: EmarDose[]; onUpdateDose: (dose: EmarDose) => void }) {
  const sorted = useMemo(() => [...doses].sort((a, b) => a.urgency === b.urgency ? 0 : a.urgency === "Urgent" ? -1 : 1), [doses]);
  const given = sorted.filter((d) => d.status === "Given");
  const pending = sorted.filter((d) => d.status === "Pending");
  const notGiven = sorted.filter((d) => d.status === "Not Given");
  const outOfStock = sorted.filter((d) => d.status === "Out of Stock");

  function markGiven(dose: EmarDose) {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    onUpdateDose({ ...dose, status: "Given", givenBy: CURRENT_NURSE.name, givenAt: stamp });
  }
  function markNotGiven(dose: EmarDose) {
    onUpdateDose({ ...dose, status: "Not Given" });
  }
  function undoGiven(dose: EmarDose) {
    onUpdateDose({ ...dose, status: "Pending", givenBy: undefined, givenAt: undefined });
  }

  const columns: DataColumn<EmarDose>[] = [
    {
      key: "medicine",
      label: "Medicine",
      render: (d) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800">{d.medicineName}</p>
            <UrgencyBadge urgency={d.urgency} />
          </div>
          <p className="text-xs text-slate-400">{d.strength} · {d.route} · {d.instructions}</p>
        </div>
      ),
    },
    {
      key: "slot",
      label: "Slot",
      render: (d) => (
        <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">{d.slot}</Badge>
      ),
    },
    {
      key: "scheduledTime",
      label: "Scheduled",
      render: (d) => <span className="text-sm text-slate-600">{d.scheduledTime}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (d) => (
        <div className="flex items-center gap-1.5">
          <StatusPill status={d.status} />
          {d.remarks && <span className="text-[11px] italic text-red-500">{d.remarks}</span>}
        </div>
      ),
    },
    {
      key: "given",
      label: "Given",
      render: (d) =>
        d.givenBy && d.givenAt ? (
          <span className="text-xs text-slate-500">{d.givenBy} · {d.givenAt}</span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (d) => {
        if (d.status === "Given") {
          return <PillButton size="sm" variant="outline" onClick={() => undoGiven(d)}>Undo</PillButton>;
        }
        if (d.status === "Out of Stock") {
          return <span className="text-[11px] font-semibold text-slate-400">Awaiting stock</span>;
        }
        return (
          <div className="flex items-center justify-end gap-1.5">
            <PillButton size="sm" variant="gradient" icon={CheckCircle2} onClick={() => markGiven(d)}>Mark Given</PillButton>
            {d.status === "Pending" && (
              <PillButton size="sm" variant="danger" icon={XCircle} onClick={() => markNotGiven(d)}>Not Given</PillButton>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">Today&apos;s Medicine Orders &amp; eMAR</p>
            <p className="text-xs text-slate-500">
              Medicines ordered multiple times a day appear as separate dose rows — mark each dose independently.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTile label="Given" value={String(given.length)} tone="emerald" />
        <InfoTile label="Pending" value={String(pending.length)} tone="amber" />
        <InfoTile label="Not Given" value={String(notGiven.length)} tone="red" />
        <InfoTile label="Out of Stock" value={String(outOfStock.length)} tone="slate" />
      </div>

      {/* Medicine administration table — unified DataTable */}
      <DataTable
        card
        title="Medicine Administration"
        titleIcon={<Pill className="h-4 w-4" />}
        rows={sorted}
        columns={columns}
        rowKey={(d) => d.id}
        countLabel="doses"
        emptyText="No medicine orders for today."
      />

      <p className="text-xs text-slate-400">
        Administrations are recorded as <span className="font-semibold text-slate-600">{CURRENT_NURSE.name}</span> ({CURRENT_NURSE.shift}).
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: EmarDose["status"] }) {
  if (status === "Given") return <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3 w-3" />Given</Badge>;
  if (status === "Not Given") return <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700"><XCircle className="h-3 w-3" />Not Given</Badge>;
  if (status === "Out of Stock") return <Badge variant="outline" className="gap-1 border-red-300 bg-red-100 text-red-800"><PackageX className="h-3 w-3" />Out of Stock</Badge>;
  return <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>;
}
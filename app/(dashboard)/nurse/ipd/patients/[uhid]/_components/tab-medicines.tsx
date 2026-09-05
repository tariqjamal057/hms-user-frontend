// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-medicines.tsx
"use client";

import { CheckCircle2, Clock, Pill, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { EmarDose } from "@/types/nurse/ipd/nurse-ipd-types";

function DoseStatusBadge({ status }: { status: EmarDose["status"] }) {
  const tone =
    status === "Given"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Out of Stock"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "Pending"
          ? "border-cyan-200 bg-cyan-50 text-cyan-700"
          : "border-amber-200 bg-amber-50 text-amber-700";
  return (
    <Badge variant="outline" className={tone}>
      {status === "Given" ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : status === "Out of Stock" ? (
        <XCircle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      {status}
    </Badge>
  );
}

/**
 * Read-only "Medicines" board — the doctor's medicine orders and their current
 * administration status. Executes the workflow (Administer / Record) in the
 * separate Medication Administration tab (View vs Execute split).
 */
export function TabMedicines({ doses }: { doses: EmarDose[] }) {
  const givenCount = doses.filter((d) => d.status === "Given").length;
  const outOfStockCount = doses.filter((d) => d.status === "Out of Stock").length;
  const pendingCount = doses.length - givenCount - outOfStockCount;

  const columns: DataColumn<EmarDose>[] = [
    {
      key: "medicineName",
      label: "Medicine",
      render: (d) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-800">{d.medicineName}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {d.strength} · {d.route} · {d.qtyRequired} dose
          </p>
          {d.instructions && (
            <p className="mt-0.5 text-xs italic text-slate-500">{d.instructions}</p>
          )}
        </div>
      ),
    },
    {
      key: "slot",
      label: "Slot",
      render: (d) => (
        <span className="text-xs text-slate-600">
          {d.slot} · {d.scheduledTime}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (d) => <DoseStatusBadge status={d.status} />,
    },
    {
      key: "given",
      label: "Given",
      render: (d) =>
        d.givenBy && d.givenAt ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {d.givenBy} · {d.givenAt}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
      hideOnMobile: true,
    },
    {
      key: "urgency",
      label: "Urgency",
      align: "right",
      render: (d) =>
        d.urgency === "Urgent" ? (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            Urgent
          </Badge>
        ) : (
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500">
            Routine
          </Badge>
        ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
            <Pill className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">Medicines</p>
            <p className="text-xs text-slate-500">
              Doctor-prescribed medicine orders · administration is actioned from the
              Medication Administration tab
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Ordered"
          icon={<Pill className="h-3.5 w-3.5" />}
          tone="blue"
          value={String(doses.length)}
          subtitle="Prescribed doses"
        />
        <InfoTileCard
          title="Administered"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          value={String(givenCount)}
          subtitle="Documented as given"
        />
        <InfoTileCard
          title="Pending"
          icon={<Clock className="h-3.5 w-3.5" />}
          tone="cyan"
          value={String(pendingCount)}
          subtitle="Awaiting administration"
        />
        <InfoTileCard
          title="Out of Stock"
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          tone={outOfStockCount > 0 ? "red" : "slate"}
          value={String(outOfStockCount)}
          subtitle={outOfStockCount > 0 ? "Pharmacy notified" : "All available"}
        />
      </div>

      {/* Orders table */}
      <DataTable
        card
        title="Medicine Orders"
        titleIcon={<Pill className="h-4 w-4" />}
        rows={doses}
        columns={columns}
        rowKey={(d) => d.id}
        countLabel="doses"
        emptyText="No medicine orders for this patient."
      />
    </div>
  );
}
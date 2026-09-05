// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-shift-handover.tsx
"use client";
import { ArrowRightLeft, UserRound } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { SectionHeader } from "./section-header";
import type { ShiftHandoverFull } from "@/types/nurse-admin/ipd/ward-detail-types";

export function SectionShiftHandover({ handovers }: { handovers: ShiftHandoverFull[] }) {
  const columns: DataColumn<ShiftHandoverFull>[] = [
    {
      key: "fromNurse",
      label: "Handover From",
      render: (e) => (
        <div>
          <p className="flex items-center gap-1 font-semibold text-slate-800"><UserRound className="h-3.5 w-3.5 text-slate-400" />{e.fromNurse}</p>
          <p className="text-xs text-slate-400">{e.fromShift}</p>
        </div>
      ),
    },
    {
      key: "toNurse",
      label: "Handover To",
      render: (e) => (
        <div>
          <p className="flex items-center gap-1 font-semibold text-slate-800"><UserRound className="h-3.5 w-3.5 text-slate-400" />{e.toNurse}</p>
          <p className="text-xs text-slate-400">{e.toShift}</p>
        </div>
      ),
    },
    {
      key: "handoverDateTime",
      label: "Handover Time",
      render: (e) => <span className="text-sm text-slate-600">{e.handoverDateTime}</span>,
    },
    {
      key: "notes",
      label: "Notes",
      render: (e) =>
        e.notes ? (
          <span className="max-w-[280px] whitespace-normal text-xs italic text-slate-600">&quot;{e.notes}&quot;</span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<ArrowRightLeft className="h-5 w-5" />}
        title="Shift Handover Logs"
        subtitle={`Every handover between nurses for this patient · ${handovers.length} recorded`}
      />

      <DataTable
        card
        title="Handover History"
        titleIcon={<UserRound className="h-4 w-4" />}
        rows={handovers}
        columns={columns}
        rowKey={(e) => e.id}
        countLabel="handovers"
        emptyText="No shift handovers recorded for this patient."
      />
    </div>
  );
}
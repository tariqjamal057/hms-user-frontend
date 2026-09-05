// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-intake-output.tsx
"use client";

import { ArrowDownToLine, ArrowUpFromLine, Scale } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { FluidBalanceEntry } from "@/types/nurse/ipd/nurse-ipd-types";
import { cn } from "@/lib/utils";

/**
 * "Intake & Output" tab — executive summary of fluid balance split into
 * intake vs output with a net balance and recent entries. Complements the
 * Fluid Balance tab (which adds/edits entries).
 */
export function TabIntakeOutput({ entries }: { entries: FluidBalanceEntry[] }) {
  const intake = entries
    .filter((e) => e.direction === "Intake")
    .reduce((sum, e) => sum + e.volumeMl, 0);
  const output = entries
    .filter((e) => e.direction === "Output")
    .reduce((sum, e) => sum + e.volumeMl, 0);
  const net = intake - output;
  const largest = Math.max(intake, output, 1);

  const columns: DataColumn<FluidBalanceEntry>[] = [
    {
      key: "dateTime",
      label: "Date / Time",
      render: (e) => <span className="font-semibold text-slate-700">{e.dateTime}</span>,
    },
    {
      key: "direction",
      label: "Direction",
      render: (e) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
            e.direction === "Intake"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700",
          )}
        >
          {e.direction === "Intake" ? (
            <ArrowDownToLine className="h-3 w-3" />
          ) : (
            <ArrowUpFromLine className="h-3 w-3" />
          )}
          {e.direction}
        </span>
      ),
    },
    {
      key: "route",
      label: "Route",
      render: (e) => <span className="text-slate-600">{e.route}</span>,
      hideOnMobile: true,
    },
    {
      key: "description",
      label: "Description",
      render: (e) => <span className="text-slate-600">{e.description}</span>,
    },
    {
      key: "volumeMl",
      label: "Volume",
      align: "right",
      render: (e) => (
        <span className="font-semibold text-slate-700">
          {e.volumeMl} <span className="text-[10px] font-normal text-slate-400">ml</span>
        </span>
      ),
    },
    {
      key: "recordedBy",
      label: "Recorded By",
      render: (e) => <span className="text-slate-500">{e.recordedBy}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">Intake &amp; Output</p>
            <p className="text-xs text-slate-500">
              Fluid balance summary · total intake vs output and the running net balance
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTileCard
          title="Total Intake"
          icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
          tone="emerald"
          value={`${intake} ml`}
          subtitle={`${entries.filter((e) => e.direction === "Intake").length} entries`}
        />
        <InfoTileCard
          title="Total Output"
          icon={<ArrowUpFromLine className="h-3.5 w-3.5" />}
          tone="rose"
          value={`${output} ml`}
          subtitle={`${entries.filter((e) => e.direction === "Output").length} entries`}
        />
        <InfoTileCard
          title="Net Balance"
          icon={<Scale className="h-3.5 w-3.5" />}
          tone={net > 0 ? "cyan" : net < 0 ? "amber" : "slate"}
          value={`${net >= 0 ? "+" : ""}${net} ml`}
          subtitle={net > 0 ? "Net positive" : net < 0 ? "Net negative" : "In balance"}
        />
      </div>

      {/* Ratio bars */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        {[
          {
            label: "Intake",
            value: intake,
            barClass: "bg-gradient-to-r from-emerald-400 to-teal-500",
          },
          {
            label: "Output",
            value: output,
            barClass: "bg-gradient-to-r from-rose-400 to-red-500",
          },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-500">{item.value} ml</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all", item.barClass)}
                style={{ width: `${Math.max(4, (item.value / largest) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent entries */}
      <DataTable
        card
        title="Recent Intake & Output Entries"
        titleIcon={<Scale className="h-4 w-4" />}
        rows={entries}
        columns={columns}
        rowKey={(e) => e.id}
        countLabel="entries"
        emptyText="No fluid entries recorded yet — add them from the Fluid Balance tab."
      />
    </div>
  );
}
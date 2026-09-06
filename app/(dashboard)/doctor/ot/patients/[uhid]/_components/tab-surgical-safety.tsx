// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-surgical-safety.tsx
"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { SurgicalCount, SurgicalSafetyItem } from "@/types/doctor/ot/ot-types";
import { cn } from "@/lib/utils";
import { OtSectionHeader } from "./ot-section-header";

type TabSurgicalSafetyProps = {
  safetyItems: SurgicalSafetyItem[];
  onToggleSafety: (item: SurgicalSafetyItem) => void;
  counts: SurgicalCount[];
  onResolveCount: (count: SurgicalCount) => void;
};

export function TabSurgicalSafety({
  safetyItems,
  onToggleSafety,
  counts,
  onResolveCount,
}: TabSurgicalSafetyProps) {
  const done = safetyItems.filter((s) => s.completed).length;
  const reconciliation = counts.filter((c) => c.status === "Reconciliation Required");

  const countColumns: DataColumn<SurgicalCount>[] = [
    {
      key: "item",
      label: "Item",
      render: (c) => <span className="font-semibold text-slate-800">{c.item}</span>,
    },
    {
      key: "before",
      label: "Pre-Procedure",
      align: "right",
      render: (c) => <span className="text-slate-600">{c.beforeSurgery}</span>,
    },
    {
      key: "during",
      label: "During",
      align: "right",
      render: (c) => <span className="text-slate-600">{c.duringSurgery}</span>,
    },
    {
      key: "final",
      label: "Final",
      align: "right",
      render: (c) => <span className="font-bold text-slate-800">{c.finalCount}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (c) =>
        c.status === "Correct" ? (
          <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Correct
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700">
            <AlertTriangle className="h-3 w-3" /> Reconciliation Required
          </Badge>
        ),
    },
    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (c) =>
        c.status === "Reconciliation Required" ? (
          <button
            type="button"
            onClick={() => onResolveCount(c)}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            Mark Correct
          </button>
        ) : (
          <span className="text-xs text-slate-400">{c.countedBy}</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <OtSectionHeader
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Surgical Safety"
        subtitle="WHO-style safety checklist and surgical counts"
        tone="from-sky-500 to-blue-600"
      />

      {reconciliation.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Counts Mismatch — Stop & Reconcile"
          body={`Final count does not match pre-procedure for: ${reconciliation.map((c) => c.item).join(", ")}. Do not close until reconciled.`}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard title="Checklist Done" icon={<ShieldCheck className="h-3.5 w-3.5" />} tone="emerald" value={`${done}/${safetyItems.length}`} subtitle="steps signed off" />
        <InfoTileCard title="Checklist Pending" icon={<ShieldCheck className="h-3.5 w-3.5" />} tone="amber" value={String(safetyItems.length - done)} subtitle="Steps to sign off" />
        <InfoTileCard title="Count Risks" icon={<AlertTriangle className="h-3.5 w-3.5" />} tone={reconciliation.length ? "red" : "emerald"} value={String(reconciliation.length)} subtitle="Items to reconcile" />
        <InfoTileCard title="Items Counted" icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="slate" value={String(counts.length)} subtitle="Instrument groups" />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <ShieldCheck className="h-4 w-4 text-sky-500" /> Safety Checklist
        </p>
        {safetyItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggleSafety(item)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
              item.completed
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
                item.completed ? "bg-emerald-500" : "bg-slate-300",
              )}
            >
              {item.completed && <CheckCircle2 className="h-4 w-4" />}
            </span>
            <span className="flex-1">
              <span className={cn("text-sm font-semibold", item.completed ? "text-slate-600 line-through decoration-emerald-300" : "text-slate-800")}>
                {item.step}
              </span>
              {item.completedBy && (
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  {item.completedBy} · {item.completedAt}
                </span>
              )}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {item.completed ? "Done" : "Pending"}
            </span>
          </button>
        ))}
      </div>

      {/* Counts */}
      <DataTable
        card
        title="Surgical & Instrument Counts"
        titleIcon={<CheckCircle2 className="h-4 w-4" />}
        rows={counts}
        columns={countColumns}
        rowKey={(c) => c.id}
        countLabel="item groups"
        emptyText="No surgical counts recorded yet."
        searchable
        searchPlaceholder="Search item or counted-by..."
        filters={[
          {
            id: "status",
            type: "select",
            label: "Status",
            placeholder: "All statuses",
            options: Array.from(new Set(counts.map((c) => c.status))).map((s) => ({ value: s, label: s })),
            getValue: (c) => c.status,
          },
        ]}
      />
    </div>
  );
}
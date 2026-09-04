// app/(dashboard)/billing/ipd/_components/drawer/section-charges.tsx
"use client";
import { useMemo, useState } from "react";
import {
  Activity,
  Banknote,
  CalendarDays,
  FileSpreadsheet,
  Lock,
  Receipt,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { ChargeCategory, DailyCharge } from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { DateFilterBar } from "./date-filter-bar";

const categoryTone: Record<ChargeCategory, string> = {
  "Doctor Fee": "border-blue-200 bg-blue-50 text-blue-700",
  "Nurse Fee": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Bed Fee": "border-violet-200 bg-violet-50 text-violet-700",
  Diagnostic: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Pharmacy: "border-amber-200 bg-amber-50 text-amber-700",
  Procedure: "border-rose-200 bg-rose-50 text-rose-700",
  Other: "border-slate-200 bg-slate-50 text-slate-600",
};

const CATEGORY_ICON: Record<ChargeCategory, React.ReactNode> = {
  "Doctor Fee": <Stethoscope className="h-3 w-3" />,
  "Nurse Fee": <Activity className="h-3 w-3" />,
  "Bed Fee": <Receipt className="h-3 w-3" />,
  Diagnostic: <FileSpreadsheet className="h-3 w-3" />,
  Pharmacy: <Banknote className="h-3 w-3" />,
  Procedure: <Activity className="h-3 w-3" />,
  Other: <FileSpreadsheet className="h-3 w-3" />,
};

export function SectionCharges({
  charges,
  universalPaymentEnabled,
}: {
  charges: DailyCharge[];
  universalPaymentEnabled: boolean;
}) {
  const [date, setDate] = useState("");
  const filtered = useMemo(
    () => (date ? charges.filter((c) => c.date === date) : charges),
    [charges, date],
  );

  const groupedByDate = useMemo(() => {
    const map = new Map<string, DailyCharge[]>();
    filtered.forEach((c) => {
      const rows = map.get(c.date) ?? [];
      rows.push(c);
      map.set(c.date, rows);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const filteredTotal = filtered.reduce((sum, c) => sum + c.amount, 0);
  const includedTotal = filtered
    .filter(
      (c) =>
        universalPaymentEnabled ||
        (c.category !== "Pharmacy" && c.category !== "Diagnostic"),
    )
    .reduce((sum, c) => sum + c.amount, 0);

  const columns: DataColumn<DailyCharge>[] = [
    {
      key: "category",
      label: "Category",
      render: (c) => (
        <Badge variant="outline" className={categoryTone[c.category]}>
          <span className="mr-1">{CATEGORY_ICON[c.category]}</span>
          {c.category}
        </Badge>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (c) => (
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-medium text-slate-700">
            {c.description}
          </p>
          {c.addedBy && (
            <p className="text-[10px] text-slate-400">Added by {c.addedBy}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (c) => {
        const excluded =
          !universalPaymentEnabled &&
          (c.category === "Pharmacy" || c.category === "Diagnostic");
        return (
          <span
            className={`font-bold ${
              excluded ? "text-slate-400 line-through" : "text-slate-800"
            }`}
          >
            {formatCurrency(c.amount)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (c) => {
        const excluded =
          !universalPaymentEnabled &&
          (c.category === "Pharmacy" || c.category === "Diagnostic");
        return excluded ? (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            <Lock className="mr-1 h-3 w-3" />
            Excluded
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            Included
          </Badge>
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
            <Receipt className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Day-wise Billing Details
            </p>
            <p className="text-xs text-slate-500">
              Doctor, nurse, bed, diagnostic, and pharmacy charges recorded
              daily during admission.
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Total Charges"
          icon={<Receipt className="h-3.5 w-3.5" />}
          tone="blue"
          value={formatCurrency(filteredTotal)}
          subtitle={`${filtered.length} entries`}
        />
        <InfoTileCard
          title="In Bill Total"
          icon={<FileSpreadsheet className="h-3.5 w-3.5" />}
          tone="emerald"
          value={formatCurrency(includedTotal)}
          subtitle="Adds to net payable"
        />
        <InfoTileCard
          title="Excluded"
          icon={<Lock className="h-3.5 w-3.5" />}
          tone="amber"
          value={formatCurrency(filteredTotal - includedTotal)}
          subtitle="Billed separately"
        />
        <InfoTileCard
          title="Days"
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          tone="slate"
          value={String(groupedByDate.length)}
          subtitle={date ? "Selected date" : "All days"}
        />
      </div>

      {/* Date filter */}
      <DateFilterBar
        value={date}
        onChange={setDate}
        label="Filter charges by date"
      />

      {/* Universal payment alert */}
      {!universalPaymentEnabled && (
        <InfoAlertCard
          tone="amber"
          icon={<Lock className="h-3.5 w-3.5" />}
          title="Pharmacy & Diagnostic charges excluded"
          body="Pharmacy and Diagnostic charges shown below are for reference only — they are not added to this IPD bill's total since Universal Payment is disabled. They will be billed separately by Pharmacy/Lab departments."
        />
      )}

      {/* Grouped tables */}
      <div className="space-y-4">
        {groupedByDate.map(([groupDate, rows]) => {
          const dayTotal = rows.reduce((sum, r) => sum + r.amount, 0);
          const formatted = new Date(`${groupDate}T12:00:00`).toLocaleDateString(
            "en-IN",
            { weekday: "short", day: "2-digit", month: "short", year: "numeric" },
          );
          return (
            <DataTable
              key={groupDate}
              card
              title={
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                  {formatted}
                </span>
              }
              titleIcon={<FileSpreadsheet className="h-4 w-4" />}
              rows={rows}
              columns={columns}
              rowKey={(c) => c.id}
              countLabel="entries"
              emptyText="No charges recorded for this date."
            />
          );
        })}
        {groupedByDate.length === 0 && (
          <InfoAlertCard
            tone="slate"
            icon={<Receipt className="h-3.5 w-3.5" />}
            title="No charges found"
            body={
              date
                ? `No charges were recorded on ${new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.`
                : "No charges have been recorded for this patient yet."
            }
          />
        )}
      </div>
    </div>
  );
}

// app/(dashboard)/billing/ipd/all-billings/_components/drawer/section-audit-trail.tsx
"use client";
import {
  FileSearch,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import {
  DataTable,
  type DataColumn,
  type DataTableFilter,
} from "@/components/patient-detail/data-table";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { KindBadge } from "../billing-timeline";
import type {
  BillingEvent,
  BillingEventKind,
} from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { cn } from "@/lib/utils";

const KIND_OPTIONS: BillingEventKind[] = [
  "Admission",
  "Charge",
  "Discount",
  "Payment",
  "Coverage Receipt",
  "Refund",
  "Deposit",
];

export function SectionAuditTrail({ events }: { events: BillingEvent[] }) {
  const filters: DataTableFilter<BillingEvent>[] = [
    {
      id: "search",
      type: "search",
      placeholder: "Search events...",
      getValue: (e) => [e.title, e.detail ?? "", e.actor],
    },
    {
      id: "kind",
      type: "select",
      label: "Kind",
      placeholder: "All events",
      options: KIND_OPTIONS.map((k) => ({ value: k, label: k })),
      getValue: (e) => e.kind,
    },
    {
      id: "date",
      type: "daterange",
      label: "Date Range",
      getValue: (e) => e.date,
    },
  ];

  const columns: DataColumn<BillingEvent>[] = [
    {
      key: "date",
      label: "Date / Time",
      render: (e) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{e.dateTime ?? e.date}</p>
        </div>
      ),
    },
    {
      key: "kind",
      label: "Event",
      render: (e) => (
        <div className="flex flex-wrap items-center gap-2">
          <KindBadge kind={e.kind} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{e.title}</p>
            {e.detail && (
              <p className="line-clamp-1 max-w-[320px] text-[10px] text-slate-400">
                {e.detail}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (e) => (
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            e.amount > 0
              ? "text-emerald-600"
              : e.amount < 0
                ? "text-rose-600"
                : "text-slate-400",
          )}
        >
          {e.amount === 0
            ? "₹0"
            : `${e.amount > 0 ? "+" : "-"}${formatCurrency(Math.abs(e.amount))}`}
        </span>
      ),
    },
    {
      key: "actor",
      label: "Actor",
      render: (e) => (
        <span className="text-xs text-slate-600">{e.actor}</span>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Audit Trail
            </p>
            <p className="text-xs text-slate-500">
              Immutable financial event log for this patient — searchable and
              filterable by event kind and date range.
            </p>
          </div>
        </div>
      </div>

      <InfoAlertCard
        tone="slate"
        icon={<FileSearch className="h-3.5 w-3.5" />}
        title={`${events.length} events recorded`}
        body="Every charge, discount, payment, refund, deposit, and coverage receipt is logged with the acting staff member for full traceability."
      />

      {/* Audit table */}
      <DataTable
        card
        searchable
        searchPlaceholder="Search events..."
        filters={filters}
        title="Financial Event Log"
        titleIcon={<ScrollText className="h-4 w-4" />}
        rows={events}
        columns={columns}
        rowKey={(e) => e.id}
        countLabel="events"
        emptyText="No financial events recorded for this patient yet."
      />
    </div>
  );
}
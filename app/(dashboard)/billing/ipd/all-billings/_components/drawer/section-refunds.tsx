// app/(dashboard)/billing/ipd/all-billings/_components/drawer/section-refunds.tsx
"use client";
import {
  CalendarDays,
  Clock3,
  RotateCcw,
  TicketPercent,
  TrendingDown,
  User,
  Users,
} from "lucide-react";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { PaymentMethodBadge } from "../billing-badges";
import type { RefundRecord } from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

export function SectionRefunds({ refunds }: { refunds: RefundRecord[] }) {
  const processed = refunds.filter((r) => r.status === "Processed");
  const pending = refunds.filter((r) => r.status === "Pending");
  const processedTotal = processed.reduce((sum, r) => sum + r.amount, 0);
  const pendingTotal = pending.reduce((sum, r) => sum + r.amount, 0);
  const latest = refunds[0];

  const columns: DataColumn<RefundRecord>[] = [
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">
            {new Date(`${r.date}T12:00:00`).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (r) => (
        <span className="line-clamp-2 max-w-[320px] text-xs text-slate-600">
          {r.reason}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (r) => (
        <span className="font-bold text-rose-700">
          - {formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      key: "method",
      label: "Refund Method",
      render: (r) => <PaymentMethodBadge method={r.method} />,
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (r) =>
        r.status === "Processed" ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            Processed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            <Clock3 className="h-3 w-3" />
            Pending
          </span>
        ),
    },
    {
      key: "processedBy",
      label: "Refunded To / By",
      render: (r) => (
        <div className="text-[11px]">
          <p className="flex items-center gap-1 text-slate-700">
            <Users className="h-3 w-3 text-slate-400" />
            {r.refundedTo}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-slate-400">
            <User className="h-3 w-3" />
            {r.processedBy}
          </p>
        </div>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <RotateCcw className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Refunds & Reversals
            </p>
            <p className="text-xs text-slate-500">
              Money returned to the payer either paid out or under review.
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Total Refunded"
          icon={<TrendingDown className="h-3.5 w-3.5" />}
          tone="rose"
          value={formatCurrency(processedTotal)}
          subtitle={`${processed.length} processed`}
        />
        <InfoTileCard
          title="Pending Refund"
          icon={<Clock3 className="h-3.5 w-3.5" />}
          tone="amber"
          value={formatCurrency(pendingTotal)}
          subtitle={`${pending.length} under review`}
        />
        <InfoTileCard
          title="Refund Count"
          icon={<TicketPercent className="h-3.5 w-3.5" />}
          tone="slate"
          value={String(refunds.length)}
          subtitle="Total requests"
        />
        <InfoTileCard
          title="Last Refund"
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          tone="blue"
          value={
            latest
              ? new Date(`${latest.date}T12:00:00`).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"
          }
          subtitle={latest?.processedBy ?? "No refunds yet"}
        />
      </div>

      {refunds.length === 0 ? (
        <InfoAlertCard
          tone="emerald"
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          title="No refunds recorded"
          body="No amount has been reversed or refunded for this patient's bill."
        />
      ) : (
        <DataTable
          card
          title="Refund History"
          titleIcon={<RotateCcw className="h-4 w-4" />}
          rows={refunds}
          columns={columns}
          rowKey={(r) => r.id}
          countLabel="refunds"
          emptyText="No refunds have been recorded for this bill."
        />
      )}
    </div>
  );
}
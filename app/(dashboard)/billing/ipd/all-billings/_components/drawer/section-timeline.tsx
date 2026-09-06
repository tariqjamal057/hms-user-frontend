// app/(dashboard)/billing/ipd/all-billings/_components/drawer/section-timeline.tsx
"use client";
import {
  Activity,
  Banknote,
  History,
  Layers,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { BillingTimeline } from "../billing-timeline";
import type { BillingPatient } from "@/types/billing/ipd/billing-types";
import {
  buildBillingTimeline,
  categoryLedger,
} from "@/lib/billing/ipd/billing-analytics";
import { computeBilling, formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { cn } from "@/lib/utils";

export function SectionTimeline({ patient }: { patient: BillingPatient }) {
  const computed = computeBilling(patient);
  const events = buildBillingTimeline(patient);
  const ledger = categoryLedger(patient.charges);
  const ledgerTotal = ledger.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
            <History className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Billing Timeline
            </p>
            <p className="text-xs text-slate-500">
              Every financial event for this IPD — charges, discounts,
              payments, deposits, refunds, and coverage receipts in order.
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Net Payable"
          icon={<Banknote className="h-3.5 w-3.5" />}
          tone="blue"
          value={formatCurrency(computed.netPayable)}
          subtitle="Final bill amount"
        />
        <InfoTileCard
          title="Collected"
          icon={<Wallet className="h-3.5 w-3.5" />}
          tone="emerald"
          value={formatCurrency(computed.totalCollected)}
          subtitle={`Net of ${formatCurrency(computed.totalRefunded)} refunded`}
        />
        <InfoTileCard
          title="Refunded"
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          tone="rose"
          value={formatCurrency(computed.totalRefunded)}
          subtitle={
            computed.pendingRefund > 0
              ? `+ ${formatCurrency(computed.pendingRefund)} pending`
              : "No pending refunds"
          }
        />
        <InfoTileCard
          title="Deposits"
          icon={<Layers className="h-3.5 w-3.5" />}
          tone="purple"
          value={formatCurrency(computed.totalDeposits)}
          subtitle="Advances / security held"
        />
      </div>

      {/* Department-wise ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-sm shadow-blue-200">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <p className="text-sm font-bold text-slate-800">
            Department-wise Ledger
          </p>
        </div>
        <div className="space-y-2.5">
          {ledger.map((row) => {
            const pct = ledgerTotal ? (row.total / ledgerTotal) * 100 : 0;
            return (
              <div key={row.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    {row.category}
                    <span className="ml-1.5 text-[10px] text-slate-400">
                      {row.count} {row.count === 1 ? "entry" : "entries"}
                    </span>
                  </span>
                  <span className="font-bold tabular-nums text-slate-800">
                    {formatCurrency(row.total)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${Math.max(4, Math.round(pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
          {ledger.length === 0 && (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-400">
              No charges recorded for this patient yet.
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className={cn("rounded-2xl border border-slate-200 bg-slate-50/40 p-5")}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">
            Financial Events · {events.length}
          </p>
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            Oldest → Newest
          </span>
        </div>
        <BillingTimeline events={events} />
      </div>
    </div>
  );
}
// app/(dashboard)/billing/dashboard/_components/settlement-card.tsx
"use client";
import { Check, CircleCheckBig, FileText, Send } from "lucide-react";
import type { DischargeSettlement } from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

interface Props {
  settlement: DischargeSettlement;
  onCollect: () => void;
}

export function SettlementCard({ settlement, onCollect }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">Discharge Settlement Preview</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Final financial reconciliation before account closure ·{" "}
            <span className="font-medium text-slate-700">{settlement.patientName}</span>{" "}
            <span className="font-mono">{settlement.ipdId}</span>
          </p>
        </div>
        <span
          className={`self-start rounded-full px-2.5 py-1 text-[10px] font-bold ${
            settlement.ready
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {settlement.ready ? "Ready to settle" : "Final approval pending"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Gross Bill</span>
            <b className="text-slate-800">{formatCurrency(settlement.grossBill)}</b>
          </div>
          {settlement.packageDiscount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discount</span>
              <b>− {formatCurrency(settlement.packageDiscount)}</b>
            </div>
          )}
          {settlement.insuranceApproved > 0 && (
            <div className="flex justify-between text-indigo-600">
              <span>Insurance Approved</span>
              <b>− {formatCurrency(settlement.insuranceApproved)}</b>
            </div>
          )}
          {settlement.insurancePending > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Insurance Pending</span>
              <b>{formatCurrency(settlement.insurancePending)}</b>
            </div>
          )}
          {settlement.deposits > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Patient Deposit</span>
              <b>− {formatCurrency(settlement.deposits)}</b>
            </div>
          )}
          {settlement.selfCollected > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Self Payments</span>
              <b>− {formatCurrency(settlement.selfCollected)}</b>
            </div>
          )}
          <div className="flex justify-between border-t pt-3 text-base">
            <span className="font-semibold text-slate-700">Patient Payable</span>
            <b className={settlement.patientPayable > 0 ? "text-rose-600" : "text-emerald-600"}>
              {formatCurrency(settlement.patientPayable)}
            </b>
          </div>
          {settlement.refundDue > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Refund of {formatCurrency(settlement.refundDue)} approved for disbursal
            </p>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Settlement Checklist
          </div>
          <div className="mt-3 space-y-2.5">
            {settlement.checklist.map((item) => (
              <label
                key={item.label}
                className="flex cursor-pointer items-start gap-2.5 text-xs"
              >
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                    item.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {item.done && <Check className="h-3 w-3" />}
                </span>
                <span className={item.done ? "text-slate-600" : "font-medium text-slate-700"}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-700">
            <CircleCheckBig className="h-4 w-4 shrink-0" />
            {settlement.checklist.filter((c) => c.done).length} of{" "}
            {settlement.checklist.length} items reconciled
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t bg-slate-50 px-5 py-4">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          <FileText className="h-3.5 w-3.5" /> Preview Final Bill
        </button>
        {settlement.insurancePending > 0 && (
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <Send className="h-3.5 w-3.5" /> Request Payer Approval
          </button>
        )}
        <button
          type="button"
          onClick={onCollect}
          disabled={settlement.patientPayable === 0}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CircleCheckBig className="h-3.5 w-3.5" />
          {settlement.patientPayable > 0
            ? `Collect ${formatCurrency(settlement.patientPayable)}`
            : "Settled"}
        </button>
      </div>
    </section>
  );
}
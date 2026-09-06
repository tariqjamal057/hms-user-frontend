// app/(dashboard)/billing/dashboard/_components/claims-tab.tsx
"use client";
import { Check, Info, Minus } from "lucide-react";
import type {
  BillingPatient,
  ClaimStageState,
  PayerBreakdown,
} from "@/types/billing/ipd/billing-types";
import {
  buildPayerBreakdown,
  deriveClaimLifecycle,
} from "@/lib/billing/ipd/billing-analytics";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

const STATE_META: Record<
  ClaimStageState,
  { ring: string; dot: string; text: string }
> = {
  done: {
    ring: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  current: {
    ring: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  upcoming: {
    ring: "bg-slate-100 text-slate-500",
    dot: "bg-slate-300",
    text: "text-slate-500",
  },
};

function PayerBar({ label, value, max, tone }: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <b className="text-slate-800">{formatCurrency(value)}</b>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
    </div>
  );
}

export function ClaimsTab({ patient }: { patient: BillingPatient }) {
  const stages = deriveClaimLifecycle(patient);
  const payer: PayerBreakdown = buildPayerBreakdown(patient);
  const coverage = patient.coverage;
  const insured = Boolean(coverage && coverage.type !== "None");
  const maxPayer = Math.max(
    payer.insuranceApproved,
    payer.deposits,
    payer.patientPayable,
    payer.selfPaid,
    1,
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Claim Lifecycle</h3>
          {insured && (
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
              {payer.insurancePending > 0
                ? "Further approval pending"
                : "Coverage fully received"}
            </span>
          )}
        </div>

        {insured ? (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              {stages.map((stage) => {
                const meta = STATE_META[stage.state];
                return (
                  <div key={stage.key} className="text-center">
                    <div
                      className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${meta.ring}`}
                    >
                      {stage.state === "done" ? (
                        <Check className="h-4 w-4" />
                      ) : stage.state === "current" ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Info className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className={`mt-2 text-[10px] font-bold ${meta.text}`}>
                      {stage.label}
                    </div>
                    {stage.value && (
                      <div className="mt-0.5 text-[10px] text-slate-400">{stage.value}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{
                  width: `${Math.round(
                    (stages.filter((s) => s.state === "done").length / stages.length) * 100,
                  )}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              {stages.filter((s) => s.state === "done").length} of{" "}
              {stages.length} stages complete · {
                stages.find((s) => s.state === "current")?.detail ?? "Self-pay account"
              }
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Self-pay account — no insurance claim lifecycle
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
              No {coverage?.type} scheme or policy is attached to this account.
              Billing is collected directly from the patient.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800">Payer Breakdown</h3>
        <div className="mt-5 space-y-4">
          <PayerBar
            label="Insurance / TPA"
            value={payer.insuranceApproved}
            max={maxPayer}
            tone="bg-indigo-500"
          />
          {payer.insurancePending > 0 && (
            <p className="-mt-2 text-[10px] font-medium text-amber-600">
              {formatCurrency(payer.insurancePending)} not yet received
            </p>
          )}
          <PayerBar
            label="Patient Deposit"
            value={payer.deposits}
            max={maxPayer}
            tone="bg-emerald-500"
          />
          <PayerBar
            label="Self Paid"
            value={payer.selfPaid}
            max={maxPayer}
            tone="bg-cyan-500"
          />
          <PayerBar
            label="Patient Payable"
            value={payer.patientPayable}
            max={maxPayer}
            tone="bg-rose-500"
          />
        </div>
        {insured && coverage && (
          <div className="mt-5 space-y-2 rounded-lg bg-slate-50 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{coverage.type}</span>
              <b className="text-slate-700">{coverage.schemeName}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Policy / Card</span>
              <b className="font-mono text-slate-700">{coverage.policyOrCardNumber}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approved</span>
              <b className="text-slate-700">{formatCurrency(coverage.approvedAmount)}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Received</span>
              <b className="text-emerald-700">{formatCurrency(coverage.receivedAmount)}</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
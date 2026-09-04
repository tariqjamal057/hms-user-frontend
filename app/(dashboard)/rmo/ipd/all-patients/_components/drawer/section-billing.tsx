// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-billing.tsx
"use client";
import { useMemo, useState } from "react";
import { Banknote, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BillingSnapshot } from "@/types/rmo/ipd/rmo-types";
import { DateField } from "@/components/forms/form-controls";

const statusTone: Record<BillingSnapshot["status"], string> = {
  "Fully Paid": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Partially Paid": "border-amber-200 bg-amber-50 text-amber-700",
  "Fully Due": "border-red-200 bg-red-50 text-red-700",
};

export function SectionBilling({ billing }: { billing: BillingSnapshot }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(() => date ? billing.payments.filter((p) => p.date === date) : billing.payments, [billing.payments, date]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Summary label="Total Bill Till Today" value={`₹${billing.totalBillTillToday.toLocaleString("en-IN")}`} tone="border-blue-200 bg-blue-50 text-blue-700" />
        <Summary label="Total Paid" value={`₹${billing.totalPaid.toLocaleString("en-IN")}`} tone="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <Summary label="Total Pending" value={`₹${billing.totalPending.toLocaleString("en-IN")}`} tone="border-red-200 bg-red-50 text-red-700" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><Wallet className="h-4 w-4 text-emerald-600" />Payment History</p>
          <Badge variant="outline" className={statusTone[billing.status]}>{billing.status}</Badge>
        </div>
        <div className="mt-3"><DateField label="Filter payments by date" value={date} onChange={setDate} /></div>
        <div className="mt-3 space-y-2">
          {filtered.map((payment) => (
            <div key={payment.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{payment.partyName}</p>
                <span className="text-sm font-bold text-emerald-700">₹{payment.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{payment.dateTime} · Collected by {payment.collectedBy}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {payment.methods.map((split, index) => (
                  <span key={index} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
                    <Banknote className="h-3 w-3 text-slate-400" />{split.method}: ₹{split.amount.toLocaleString("en-IN")}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No payments recorded for this date.</p>}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className={`rounded-xl border p-4 text-center ${tone}`}><p className="text-[10px] uppercase opacity-80">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}
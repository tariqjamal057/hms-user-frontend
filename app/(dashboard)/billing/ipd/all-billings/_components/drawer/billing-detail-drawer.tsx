// app/(dashboard)/billing/ipd/_components/drawer/billing-detail-drawer.tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Banknote, FileText, HeartHandshake, Receipt, TicketPercent, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillingPatient, PaymentRecord } from "@/types/billing/ipd/billing-types";
import { computeBilling, formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { BillingStatusBadge } from "../billing-badges";
import { SectionBillSummary } from "./section-bill-summary";
import { SectionCharges } from "./section-charges";
import { SectionDiscounts } from "./section-discounts";
import { SectionPayments } from "./section-payments";
import { SectionCoverage } from "./section-coverage";
import { CollectPaymentModal } from "./collect-payment-modal";

type SectionKey = "summary" | "charges" | "discounts" | "payments" | "coverage";

const NAV: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: "summary", label: "Bill Summary", icon: FileText },
  { key: "charges", label: "Charges", icon: Receipt },
  { key: "discounts", label: "Discounts", icon: TicketPercent },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "coverage", label: "Ayushman / Insurance", icon: HeartHandshake },
];

export function BillingDetailDrawer({ patient, onClose, onPatientUpdate }: { patient: BillingPatient | null; onClose: () => void; onPatientUpdate: (patient: BillingPatient) => void }) {
  const [section, setSection] = useState<SectionKey>("summary");
  const [collecting, setCollecting] = useState(false);

  if (!patient) return null;
  const active = patient;

  const computed = computeBilling(active);

  function handleCollectPayment(payment: PaymentRecord) {
    const updated = { ...active, payments: [payment, ...active.payments] } as BillingPatient;
    onPatientUpdate(updated);
    setCollecting(false);
    toast.success(`${formatCurrency(payment.totalAmount)} collected from ${payment.partyName}.`);
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-4xl flex-col overflow-hidden bg-[#f7f9fc] shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white">{active.patientName.charAt(0)}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{active.patientName}</h2>
                <BillingStatusBadge status={computed.status} />
              </div>
              <p className="text-xs text-slate-500">{active.uhid} · {active.ward} · {active.room} · {active.bed}</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${section === key ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-5">
          {section === "summary" && <SectionBillSummary patient={active} />}
          {section === "charges" && <SectionCharges charges={active.charges} universalPaymentEnabled={active.universalPaymentEnabled} />}
          {section === "discounts" && <SectionDiscounts discounts={active.discounts} />}
          {section === "payments" && <SectionPayments payments={active.payments} />}
          {section === "coverage" && <SectionCoverage netPayable={computed.netPayable} coverage={active.coverage} />}
        </div>

        {computed.dueAmount > 0 ? (
          <footer className="border-t border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase text-slate-400">Balance Due</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(computed.dueAmount)}</p>
              </div>
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setCollecting(true)}><Banknote className="h-4 w-4" />Collect Payment</Button>
            </div>
          </footer>
        ) : (
          <footer className="border-t border-emerald-200 bg-emerald-50/60 p-4 text-center text-sm font-semibold text-emerald-700">
            Bill fully settled — no payment collection needed.
          </footer>
        )}
      </aside>

      {collecting && <CollectPaymentModal open dueAmount={computed.dueAmount} onCancel={() => setCollecting(false)} onCollect={handleCollectPayment} />}
    </div>
  );
}
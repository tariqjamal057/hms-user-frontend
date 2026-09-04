// app/(dashboard)/billing/ipd/_components/drawer/section-payments.tsx
"use client";
import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CircleCheckBig,
  CreditCard,
  User,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { PaymentRecord } from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { DateFilterBar } from "./date-filter-bar";
import { PaymentMethodBadge } from "../billing-badges";

export function SectionPayments({ payments }: { payments: PaymentRecord[] }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(
    () => (date ? payments.filter((p) => p.date === date) : payments),
    [payments, date],
  );
  const totalCollected = filtered.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalAll = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const latest = payments[0];

  const columns: DataColumn<PaymentRecord>[] = [
    {
      key: "dateTime",
      label: "Date / Time",
      render: (p) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{p.dateTime}</p>
        </div>
      ),
    },
    {
      key: "partyName",
      label: "Payer",
      render: (p) => (
        <div>
          <p className="text-sm font-semibold text-slate-800">{p.partyName}</p>
          <p className="text-[10px] text-slate-400">
            {p.relationToPatient}
          </p>
        </div>
      ),
    },
    {
      key: "methods",
      label: "Methods",
      render: (p) => (
        <div className="flex flex-wrap gap-1.5">
          {p.methods.map((split, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2 py-0.5"
            >
              <PaymentMethodBadge method={split.method} />
              <span className="text-xs font-semibold text-slate-700">
                {formatCurrency(split.amount)}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Amount",
      align: "right",
      render: (p) => (
        <span className="font-bold text-emerald-700">
          {formatCurrency(p.totalAmount)}
        </span>
      ),
    },
    {
      key: "collectedBy",
      label: "Collected By",
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User className="h-3 w-3" />
          {p.collectedBy}
        </div>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Payment History
            </p>
            <p className="text-xs text-slate-500">
              Every payment collected, split by method, with the paying party
              and collecting staff member.
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title={date ? "Selected Day Total" : "Total Collected"}
          icon={<Banknote className="h-3.5 w-3.5" />}
          tone="emerald"
          value={formatCurrency(totalCollected)}
          subtitle={date ? "For selected date" : "All time"}
        />
        <InfoTileCard
          title="Total Payments"
          icon={<CreditCard className="h-3.5 w-3.5" />}
          tone="blue"
          value={String(payments.length)}
          subtitle={`${filtered.length} matching`}
        />
        <InfoTileCard
          title="Lifetime Collected"
          icon={<CircleCheckBig className="h-3.5 w-3.5" />}
          tone="purple"
          value={formatCurrency(totalAll)}
          subtitle="All receipts"
        />
        <InfoTileCard
          title="Last Payment"
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          tone="slate"
          value={latest ? latest.dateTime : "—"}
          subtitle={latest ? `${formatCurrency(latest.totalAmount)} · ${latest.collectedBy}` : "No payments yet"}
        />
      </div>

      {/* Date filter */}
      <DateFilterBar
        value={date}
        onChange={setDate}
        label="Filter payments by date"
      />

      {filtered.length === 0 ? (
        <InfoAlertCard
          tone="slate"
          icon={<Wallet className="h-3.5 w-3.5" />}
          title="No payments recorded"
          body={
            date
              ? "No payments were collected on the selected date."
              : "No payments have been recorded for this patient yet."
          }
        />
      ) : (
        <DataTable
          card
          title="Payment Records"
          titleIcon={<Wallet className="h-4 w-4" />}
          rows={filtered}
          columns={columns}
          rowKey={(p) => p.id}
          countLabel="payments"
          emptyText="No payments recorded for this date."
        />
      )}
    </div>
  );
}

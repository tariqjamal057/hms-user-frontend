// app/(dashboard)/pharmacy/ipd/orders/_components/tab-audit.tsx
"use client";
import { FileClock, History, ShieldCheck, User } from "lucide-react";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { PharmacyIpdOrder } from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";

interface AuditEvent {
  label: string;
  detail: string;
  timestamp: string;
  tone: "blue" | "emerald" | "amber" | "red" | "purple" | "slate";
}

const TONE_BG: Record<AuditEvent["tone"], string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  slate: "bg-slate-400",
};

export function TabAudit({ order }: { order: PharmacyIpdOrder }) {
  const events: AuditEvent[] = [];

  order.medicines.forEach((medicine) => {
    medicine.dailyLogs.forEach((log) => {
      if (log.deliveredAt) {
        events.push({
          label: `${medicine.medicineName} — ${log.status}`,
          detail: `${log.slot} dose · ${log.date} · by ${log.deliveredBy ?? "—"}`,
          timestamp: log.deliveredAt,
          tone: log.status === "Delivered" ? "emerald" : "amber",
        });
      }
      if (log.doctorNotifiedAt) {
        events.push({
          label: `${medicine.medicineName} — Doctor notified`,
          detail: `${log.slot} dose · ${log.date} · out of stock`,
          timestamp: log.doctorNotifiedAt,
          tone: "red",
        });
      }
    });
  });

  order.returns.forEach((entry) =>
    events.push({
      label: `Return: ${entry.medicineName}`,
      detail: `Qty ${entry.returnedQty} · by ${entry.returnedByName} (${entry.returnedBy})`,
      timestamp: entry.returnDate,
      tone: "amber",
    }),
  );
  order.discounts.forEach((entry) =>
    events.push({
      label: `Discount applied — ₹${entry.amount.toFixed(2)}`,
      detail: `${entry.reason} · by ${entry.givenBy} (${entry.givenByRole})`,
      timestamp: entry.givenOn,
      tone: "purple",
    }),
  );
  order.payments.forEach((entry) =>
    events.push({
      label: `Payment received — ₹${entry.amount.toFixed(2)} (${entry.method})`,
      detail: `Received by ${entry.receivedBy}${entry.reference ? ` · Ref ${entry.reference}` : ""}`,
      timestamp: entry.receivedOn,
      tone: "emerald",
    }),
  );
  if (order.billSentToBillingDeptAt)
    events.push({
      label: "Bill sent to IPD Billing Department",
      detail: "Direct payment disabled hospital-wide",
      timestamp: order.billSentToBillingDeptAt,
      tone: "blue",
    });

  const sorted = events.sort(
    (a, b) =>
      new Date(b.timestamp.replace(",", "")).getTime() -
      new Date(a.timestamp.replace(",", "")).getTime(),
  );

  const firstEvent = sorted[sorted.length - 1];
  const lastEvent = sorted[0];
  const deliveredCount = events.filter(
    (e) => e.tone === "emerald" && e.label.includes("Delivered"),
  ).length;

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm">
            <FileClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Order Audit Trail
            </p>
            <p className="text-xs text-slate-500">
              {sorted.length} events · immutable chronological log
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Total Events"
          icon={<History className="h-3.5 w-3.5" />}
          tone="slate"
          value={String(sorted.length)}
          subtitle="Recorded"
        />
        <InfoTileCard
          title="Deliveries"
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          tone="emerald"
          value={String(deliveredCount)}
          subtitle="Completed"
        />
        <InfoTileCard
          title="First Event"
          icon={<User className="h-3.5 w-3.5" />}
          tone="blue"
          value={firstEvent ? firstEvent.timestamp : "—"}
          subtitle={firstEvent?.label ?? "No activity"}
        />
        <InfoTileCard
          title="Last Event"
          icon={<User className="h-3.5 w-3.5" />}
          tone="purple"
          value={lastEvent ? lastEvent.timestamp : "—"}
          subtitle={lastEvent?.label ?? "No activity"}
        />
      </div>

      {sorted.length === 0 ? (
        <InfoAlertCard
          tone="slate"
          icon={<FileClock className="h-3.5 w-3.5" />}
          title="No audit events"
          body="No audit events have been recorded for this order yet."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm">
              <FileClock className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-bold text-slate-800">
              Chronological Events
            </p>
          </div>
          <div className="space-y-2">
            {sorted.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 transition hover:bg-slate-50"
              >
                <div
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${TONE_BG[event.tone]}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {event.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {event.detail}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-slate-400">
                  {event.timestamp}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

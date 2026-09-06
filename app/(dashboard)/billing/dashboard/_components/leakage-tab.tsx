// app/(dashboard)/billing/dashboard/_components/leakage-tab.tsx
"use client";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { RevenueAlert, RevenueAlertSeverity } from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

const SEVERITY_STYLE: Record<RevenueAlertSeverity, string> = {
  high: "border-rose-200 bg-rose-50/40",
  medium: "border-amber-200 bg-amber-50/40",
  low: "border-slate-200 bg-white",
};

const SEVERITY_CHIP: Record<RevenueAlertSeverity, string> = {
  high: "text-rose-600",
  medium: "text-amber-600",
  low: "text-slate-500",
};

interface Props {
  alerts: RevenueAlert[];
  onOpenPatient: (uhid: string) => void;
}

export function LeakageTab({ alerts, onOpenPatient }: Props) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const openAlerts = useMemo(
    () => alerts.filter((a) => !resolved.has(a.id)),
    [alerts, resolved],
  );

  function resolveAll() {
    setResolved((prev) => new Set([...prev, ...alerts.map((a) => a.id)]));
  }

  function resolveOne(id: string) {
    setResolved((prev) => new Set([...prev, id]));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">Revenue Leakage Control</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Cross-check source events against posted financial transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
            {openAlerts.length} open alerts
          </span>
          <button
            type="button"
            onClick={resolveAll}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Resolve All
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {openAlerts.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">
              All revenue alerts resolved
            </p>
            <p className="text-xs text-slate-400">
              No open leakages across the current billing accounts.
            </p>
          </div>
        )}

        {openAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex flex-col rounded-xl border p-4 ${SEVERITY_STYLE[alert.severity]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`h-4 w-4 shrink-0 ${SEVERITY_CHIP[alert.severity]}`}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide ${SEVERITY_CHIP[alert.severity]}`}
                >
                  {alert.severity}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-indigo-600">
                {alert.type.replace("-", " ")}
              </span>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800">{alert.title}</p>
            <p className="mt-1.5 flex-1 text-xs leading-5 text-slate-500">
              {alert.detail}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
              <div>
                <span className="block text-[10px] text-slate-400">
                  {alert.patientName}
                </span>
                <span className="block text-sm font-bold text-red-600">
                  {formatCurrency(alert.amount)}
                </span>
              </div>
              {alert.ageDays !== undefined && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                  <Clock3 className="h-3 w-3" /> {alert.ageDays}d
                </span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onOpenPatient(alert.uhid)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                Review <ArrowRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => resolveOne(alert.id)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-slate-900 px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800"
              >
                <Check className="h-3 w-3" /> Resolve
              </button>
            </div>
          </div>
        ))}
      </div>

      {resolved.size > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {resolved.size} alert{resolved.size === 1 ? "" : "s"} resolved this session.
        </div>
      )}
    </div>
  );
}
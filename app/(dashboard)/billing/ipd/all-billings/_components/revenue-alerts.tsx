// app/(dashboard)/billing/ipd/all-billings/_components/revenue-alerts.tsx
"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  HeartHandshake,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BillingPatient, RevenueAlert } from "@/types/billing/ipd/billing-types";
import { deriveRevenueAlerts } from "@/lib/billing/ipd/billing-analytics";
import { TODAY_ISO } from "@/lib/billing/ipd/billing-data";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

const SEVERITY_STYLE: Record<
  RevenueAlert["severity"],
  { badge: string; ring: string; icon: React.ElementType }
> = {
  high: {
    badge: "border-red-200 bg-red-50 text-red-700",
    ring: "border-red-200 bg-gradient-to-r from-red-50/80 via-white to-rose-50/60",
    icon: AlertTriangle,
  },
  medium: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    ring: "border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/60",
    icon: ShieldAlert,
  },
  low: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    ring: "border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-cyan-50/60",
    icon: HeartHandshake,
  },
};

const TYPE_ICON: Record<RevenueAlert["type"], React.ElementType> = {
  unpaid: AlertTriangle,
  overdue: Clock3,
  coverage: HeartHandshake,
  "high-value": TrendingUp,
};

const TYPE_LABEL: Record<RevenueAlert["type"], string> = {
  unpaid: "Unpaid",
  overdue: "Overdue",
  coverage: "Insurance",
  "high-value": "High value",
};

export function RevenueAlertsPanel({
  patients,
  onOpenPatient,
}: {
  patients: BillingPatient[];
  onOpenPatient: (patient: BillingPatient) => void;
}) {
  const [resolved, setResolved] = useState<string[]>([]);
  const alerts = useMemo(() => deriveRevenueAlerts(patients, TODAY_ISO), [patients]);
  const active = alerts.filter((a) => !resolved.includes(a.id));
  const pendingAmount = active.reduce((sum, a) => sum + a.amount, 0);
  const highCount = active.filter((a) => a.severity === "high").length;

  function resolve(id: string) {
    setResolved((prev) => [...prev, id]);
  }
  function resolveAll() {
    setResolved(alerts.map((a) => a.id));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              active.length > 0
                ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-200"
                : "bg-emerald-100 text-emerald-600",
            )}
          >
            {active.length > 0 ? (
              <AlertTriangle className="h-4.5 w-4.5" />
            ) : (
              <CheckCircle2 className="h-4.5 w-4.5" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Revenue Leakage Alerts</p>
            <p className="text-xs text-slate-500">
              {active.length > 0
                ? `${highCount} high priority · ${formatCurrency(pendingAmount)} at risk`
                : "No leakage flagged — collection is on track."}
            </p>
          </div>
        </div>
        {active.length > 0 && (
          <button
            type="button"
            onClick={resolveAll}
            className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resolve all
          </button>
        )}
      </div>

      {/* Alert cards */}
      {active.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          No outstanding revenue alerts. All bills are either settled or on a
          healthy follow-up track.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {active.map((alert) => {
            const Icon = TYPE_ICON[alert.type];
            const style = SEVERITY_STYLE[alert.severity];
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-4",
                  style.ring,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
                        alert.severity === "high"
                          ? "bg-rose-500"
                          : alert.severity === "medium"
                            ? "bg-amber-500"
                            : "bg-blue-500",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          {alert.title}
                        </p>
                        <Badge variant="outline" className={style.badge}>
                          {alert.severity === "high"
                            ? "High"
                            : alert.severity === "medium"
                              ? "Medium"
                              : "Low"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {alert.patientName} ·{" "}
                        <span className="font-mono">{alert.uhid}</span>
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-base font-bold tabular-nums text-slate-800">
                    {formatCurrency(alert.amount)}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  {alert.detail}
                </p>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                  <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {TYPE_LABEL[alert.type]}
                    {typeof alert.ageDays === "number"
                      ? ` · ${alert.ageDays}d`
                      : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPatient(
                          patients.find((p) => p.uhid === alert.uhid)!,
                        )
                      }
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => resolve(alert.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
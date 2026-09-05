// app/(dashboard)/nurse/icu/patients/[uhid]/_components/monitoring-panel.tsx
"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Droplets,
  Heart,
  HeartPulse,
  MonitorCheck,
  Thermometer,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { VitalsHistoryTable } from "@/components/patient-detail/vitals-history-table";
import type { VitalRecord } from "@/types/nurse/ipd/nurse-ipd-types";
import { cn } from "@/lib/utils";

type ParamLevel = "normal" | "attention" | "critical";

type LevelStyle = {
  badge: string;
  border: string;
  value: string;
  dot: string;
};

const LEVEL_STYLES: Record<ParamLevel, LevelStyle> = {
  normal: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    border: "border-emerald-200/70",
    value: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  attention: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    border: "border-amber-200/70",
    value: "text-amber-700",
    dot: "bg-amber-500",
  },
  critical: {
    badge: "border-red-200 bg-red-50 text-red-700",
    border: "border-red-200/70",
    value: "text-red-700",
    dot: "bg-red-500",
  },
};

const RANGES: Record<string, { attention: (n: number) => boolean; critical: (n: number) => boolean }> = {
  bp: {
    critical: (n) => n > 160 || n < 90,
    attention: (n) => n > 140,
  },
  pulse: {
    critical: (n) => n > 120 || n < 50,
    attention: (n) => n > 100 || n < 60,
  },
  spo2: {
    critical: (n) => n < 90,
    attention: (n) => n < 95,
  },
  rr: {
    critical: (n) => n > 26 || n < 8,
    attention: (n) => n > 20 || n < 12,
  },
  temp: {
    critical: (n) => n >= 102.2,
    attention: (n) => n > 100.4 || n < 97,
  },
  pain: {
    critical: (n) => n >= 7,
    attention: (n) => n >= 4,
  },
};

function levelFor(param: string, value: number): ParamLevel {
  if (RANGES[param]?.critical(value)) return "critical";
  if (RANGES[param]?.attention(value)) return "attention";
  return "normal";
}

type MonitorParam = {
  key: string;
  label: string;
  icon: React.ReactNode;
  unit: string;
  value: string;
  numeric: number;
  previous?: number;
  meta: string;
};

function MonitorCard({ param }: { param: MonitorParam }) {
  const level: ParamLevel = levelFor(param.key, param.numeric);
  const style = LEVEL_STYLES[level];
  const hasTrend = typeof param.previous === "number";
  const delta = hasTrend ? param.numeric - (param.previous as number) : undefined;
  const TrendIcon =
    delta == null || delta === 0 ? null : delta > 0 ? ArrowUp : ArrowDown;

  return (
    <div className={cn("rounded-xl border bg-white p-4", style.border)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              level === "normal" && "bg-emerald-50 text-emerald-600",
              level === "attention" && "bg-amber-50 text-amber-600",
              level === "critical" && "bg-red-50 text-red-600",
            )}
          >
            {param.icon}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {param.label}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn("gap-1.5 border", style.badge)}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
          {level === "normal" ? "Normal" : level === "attention" ? "Attention" : "Critical"}
        </Badge>
      </div>

      <p className={cn("mt-3 text-2xl font-extrabold tracking-tight", style.value)}>
        {param.value}
        <span className="ml-1 text-xs font-semibold text-slate-400">{param.unit}</span>
      </p>

      {hasTrend ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          {TrendIcon ? (
            <TrendIcon
              className={cn(
                "h-3.5 w-3.5",
                (delta as number) > 0 ? "text-red-400" : "text-emerald-500",
              )}
            />
          ) : (
            <span className="text-slate-400">—</span>
          )}
          {delta === 0
            ? "No change"
            : `${Math.abs(delta as number)} ${(delta as number) > 0 ? "up" : "down"} vs previous`}
        </p>
      ) : (
        <p className="mt-1 text-xs text-slate-400">Baseline reading</p>
      )}

      <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
        <span className="font-semibold text-slate-500">{param.meta}</span> · latest reading
      </p>
    </div>
  );
}

type TabMonitoringProps = {
  patientName: string;
  vitals: VitalRecord[];
  title?: string;
  subtitle?: string;
};

/**
 * First-class ICU "Monitoring" tab. Renders a per-parameter card for each vital
 * showing current value + trend vs previous + recorded time/author + alert
 * status, a roll-up of out-of-range parameters, and the recent vitals trend.
 * Reused across ICU/IPD workspaces via `title`/`subtitle` overrides.
 */
export function TabMonitoring({
  patientName,
  vitals,
  title = "Continuous Monitoring",
  subtitle = "Current value · trend vs previous · recorded time & author, per vital parameter",
}: TabMonitoringProps) {
  const latest = vitals[0];
  const previous = vitals[1];

  const params: MonitorParam[] = latest
    ? [
        {
          key: "bp",
          label: "Blood Pressure",
          icon: <Activity className="h-4 w-4" />,
          unit: "mmHg",
          value: latest.bp,
          numeric: latest.systolic,
          previous: previous?.systolic,
          meta: `${latest.dateTime} · ${latest.recordedBy}`,
        },
        {
          key: "pulse",
          label: "Pulse Rate",
          icon: <HeartPulse className="h-4 w-4" />,
          unit: "bpm",
          value: String(latest.pulse),
          numeric: latest.pulse,
          previous: previous?.pulse,
          meta: `${latest.dateTime} · ${latest.recordedBy}`,
        },
        {
          key: "spo2",
          label: "Oxygen Saturation",
          icon: <Droplets className="h-4 w-4" />,
          unit: "%",
          value: String(latest.spo2),
          numeric: latest.spo2,
          previous: previous?.spo2,
          meta: `${latest.dateTime} · ${latest.recordedBy}`,
        },
        {
          key: "rr",
          label: "Respiratory Rate",
          icon: <Wind className="h-4 w-4" />,
          unit: "/min",
          value: String(latest.respRate),
          numeric: latest.respRate,
          previous: previous?.respRate,
          meta: `${latest.dateTime} · ${latest.recordedBy}`,
        },
        {
          key: "temp",
          label: "Temperature",
          icon: <Thermometer className="h-4 w-4" />,
          unit: "°F",
          value: String(latest.temp),
          numeric: latest.temp,
          previous: previous?.temp,
          meta: `${latest.dateTime} · ${latest.recordedBy}`,
        },
        {
          key: "pain",
          label: "Pain Score",
          icon: <Heart className="h-4 w-4" />,
          unit: "/10",
          value: String(latest.pain),
          numeric: latest.pain,
          previous: previous?.pain,
          meta: `${latest.dateTime} · ${latest.recordedBy}`,
        },
      ]
    : [];

  const abnormal = params.filter((p) => levelFor(p.key, p.numeric) !== "normal");
  const critical = abnormal.filter((p) => levelFor(p.key, p.numeric) === "critical");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-sm">
            <MonitorCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              {title}
            </p>
            <p className="text-xs text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>
        {latest && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold text-rose-700 sm:self-auto">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            Running · {latest.dateTime}
          </span>
        )}
      </div>

      {/* Out-of-range alerts */}
      {critical.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Critical Parameters Require Urgent Review"
          body={`${patientName} has critical readings for ${critical.map((p) => p.label).join(", ")}. Notify the treating team immediately.`}
        />
      )}
      {abnormal.length > 0 && critical.length === 0 && (
        <InfoAlertCard
          tone="amber"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Out-of-Range Parameters"
          body={`${patientName}'s ${abnormal.map((p) => p.label).join(" and ")} need attention. Continue close monitoring and document any intervention.`}
        />
      )}

      {/* Parameter cards */}
      {params.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {params.map((p) => (
            <MonitorCard key={p.key} param={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <MonitorCheck className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">No vitals recorded yet to monitor.</p>
          <p className="text-xs text-slate-400">Record vitals from the Vitals Monitoring tab to start continuous monitoring.</p>
        </div>
      )}

      {/* Recent trend */}
      {latest && (
        <VitalsHistoryTable
          rows={vitals.slice(0, 5).map((v) => ({
            dateTime: v.dateTime,
            bp: v.bp,
            pulse: v.pulse,
            temp: v.temp,
            spo2: v.spo2,
            respRate: v.respRate,
            pain: v.pain,
            recordedBy: v.recordedBy,
          }))}
          title="Recent Vitals Trend"
          showIcuColumns
        />
      )}
    </div>
  );
}
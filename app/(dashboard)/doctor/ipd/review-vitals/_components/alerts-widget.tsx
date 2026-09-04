
import { AlertTriangle, Activity, HeartPulse, Thermometer, TrendingUp, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PillButton } from "@/components/forms/pill-button";
import type { VitalAlert } from "@/types/doctor/ipd/vitals-types";

type AlertMeta = {
  Icon: typeof AlertTriangle;
  chip: string;
  header: string;
  accent: string;
};

const iconMap: Record<string, AlertMeta> = {
  "Blood Pressure": {
    Icon: Activity,
    chip: "bg-red-100 text-red-600",
    header: "border-red-200 bg-red-50/60",
    accent: "bg-gradient-to-b from-red-400 to-red-600",
  },
  SpO2: {
    Icon: Droplets,
    chip: "bg-sky-100 text-sky-600",
    header: "border-sky-200 bg-sky-50/60",
    accent: "bg-gradient-to-b from-cyan-400 to-sky-600",
  },
  Pulse: {
    Icon: HeartPulse,
    chip: "bg-red-100 text-red-600",
    header: "border-red-200 bg-red-50/60",
    accent: "bg-gradient-to-b from-red-400 to-red-600",
  },
  Temperature: {
    Icon: Thermometer,
    chip: "bg-amber-100 text-amber-600",
    header: "border-amber-200 bg-amber-50/60",
    accent: "bg-gradient-to-b from-amber-400 to-orange-500",
  },
};

const defaultMeta: AlertMeta = {
  Icon: AlertTriangle,
  chip: "bg-red-100 text-red-600",
  header: "border-red-200 bg-red-50/60",
  accent: "bg-gradient-to-b from-red-400 to-red-600",
};

export function AlertsWidget({ alerts, onViewTrend }: { alerts: VitalAlert[]; onViewTrend: (type: string) => void }) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm py-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm shadow-red-200">
            <AlertTriangle className="h-4 w-4" />
          </span>
          Alerts
        </p>
        {alerts.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-600">
            {alerts.length}
          </span>
        )}
      </div>

      <CardContent className="space-y-3 px-4 pb-4">
        {alerts.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center">
            <p className="text-sm text-slate-400">No abnormal vitals detected.</p>
          </div>
        )}

        {alerts.map((a, i) => {
          const { Icon, chip, header, accent } = iconMap[a.type] ?? defaultMeta;
          return (
            <div
              key={i}
              className={`group flex items-stretch overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${header}`}
            >
              <span className={`w-1 shrink-0 rounded-full ${accent}`} aria-hidden="true" />
              <div className="min-w-0 flex-1 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${chip}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{a.type}</span>
                  </p>
                  <span className="shrink-0 rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-red-600">
                    Abnormal
                  </span>
                </div>

                <p className="mt-1.5 pl-8 text-xs leading-relaxed text-slate-600">{a.message}</p>

                <div className="mt-2 flex items-center justify-end">
                  <PillButton
                    variant="outline"
                    size="sm"
                    icon={TrendingUp}
                    onClick={() => onViewTrend(a.type)}
                  >
                    View Trend
                  </PillButton>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

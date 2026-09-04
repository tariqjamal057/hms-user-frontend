"use client";

import {
  Activity,
  Droplets,
  Gauge,
  Heart,
  Thermometer,
  Weight,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickVitalItem = {
  label: string;
  value: string;
  unit?: string;
};

type VitalStyle = {
  icon: LucideIcon;
  tint: string;
  accent: string;
  bar: string;
};

const normalize = (l: string) => l.toLowerCase().replace(/[^a-z0-9]/g, "");

const TOKEN_STYLES: { tokens: string[]; style: VitalStyle }[] = [
  {
    tokens: ["bp", "bloodpressure"],
    style: {
      icon: Activity,
      tint: "bg-red-50 text-red-500",
      accent: "text-red-600",
      bar: "bg-gradient-to-r from-red-400 to-rose-500",
    },
  },
  {
    tokens: ["spo2", "spo"],
    style: {
      icon: Droplets,
      tint: "bg-blue-50 text-blue-500",
      accent: "text-blue-600",
      bar: "bg-gradient-to-r from-blue-400 to-cyan-500",
    },
  },
  {
    tokens: ["temp"],
    style: {
      icon: Thermometer,
      tint: "bg-orange-50 text-orange-500",
      accent: "text-orange-600",
      bar: "bg-gradient-to-r from-orange-400 to-amber-500",
    },
  },
  {
    tokens: ["pulse", "puls", "heartrate", "hr"],
    style: {
      icon: Heart,
      tint: "bg-pink-50 text-pink-500",
      accent: "text-pink-600",
      bar: "bg-gradient-to-r from-pink-400 to-rose-500",
    },
  },
  {
    tokens: ["resp", "rr", "resprate"],
    style: {
      icon: Wind,
      tint: "bg-purple-50 text-purple-500",
      accent: "text-purple-600",
      bar: "bg-gradient-to-r from-purple-400 to-violet-500",
    },
  },
  {
    tokens: ["weight"],
    style: {
      icon: Weight,
      tint: "bg-emerald-50 text-emerald-500",
      accent: "text-emerald-600",
      bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
    },
  },
];

const DEFAULT_STYLE: VitalStyle = {
  icon: Gauge,
  tint: "bg-slate-100 text-slate-500",
  accent: "text-slate-800",
  bar: "bg-gradient-to-r from-slate-300 to-slate-400",
};

function styleFor(label: string): VitalStyle {
  const n = normalize(label);
  const tokenHit = TOKEN_STYLES.find((t) => t.tokens.some((tok) => n.includes(tok)));
  return tokenHit?.style ?? DEFAULT_STYLE;
}

export type QuickVitalsCardProps = {
  vitals: QuickVitalItem[];
  title?: string;
  className?: string;
  gridClassName?: string;
};

/**
 * Unified quick-vitals card. Renders each vital as an enhanced tile with a
 * tone-matched icon chip, colored top accent bar, value + unit, hover lift,
 * and an optional card header. Reused across module profile headers.
 */
export function QuickVitalsCard({
  vitals,
  title = "Quick Vitals",
  className,
  gridClassName,
}: QuickVitalsCardProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm sm:p-5", className)}>
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-500">
              <Activity className="h-3.5 w-3.5" />
            </span>
            {title}
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Latest
          </span>
        </div>
      )}

      <div className={cn("grid grid-cols-3 gap-2.5 sm:grid-cols-3 md:grid-cols-6", gridClassName)}>
        {vitals.map((v, i) => {
          const s = styleFor(v.label);
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <span className={cn("absolute inset-x-0 top-0 h-0.5", s.bar)} />
              <div className="p-3 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                      s.tint,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className={cn("text-base font-bold leading-none sm:text-lg", s.accent)}>
                  {v.value || "—"}
                  {v.unit && (
                    <span className="ml-0.5 text-[10px] font-medium text-slate-400">{v.unit}</span>
                  )}
                </p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {v.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

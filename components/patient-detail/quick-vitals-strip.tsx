// components/patient-detail/quick-vitals-strip.tsx
"use client";

import type { QuickVital } from "./patient-detail-shell";

const DEFAULT_COLOR_MAP: Record<string, string> = {
  BP: "border-blue-200 bg-blue-50 text-blue-700",
  Pulse: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Temp: "border-amber-200 bg-amber-50 text-amber-700",
  RR: "border-violet-200 bg-violet-50 text-violet-700",
  "SpO₂": "border-cyan-200 bg-cyan-50 text-cyan-700",
  Spo2: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Pain: "border-rose-200 bg-rose-50 text-rose-700",
};

export function QuickVitalsStrip({
  vitals,
  className,
  gridClassName = "grid-cols-3 sm:grid-cols-3 md:grid-cols-6",
}: {
  vitals: QuickVital[];
  className?: string;
  gridClassName?: string;
}) {
  if (!vitals || vitals.length === 0) return null;

  return (
    <div className={className}>
      <div className={`grid gap-2 ${gridClassName}`}>
        {vitals.map((v, i) => {
          const colorClasses =
            v.color ?? DEFAULT_COLOR_MAP[v.label] ?? "border-slate-100 bg-white text-slate-800";
          const Icon = v.icon;
          return (
            <div
              key={i}
              className={`min-w-0 rounded-xl border px-2 py-3 text-center shadow-sm ${colorClasses}`}
            >
              {Icon && (
                <Icon
                  aria-hidden
                  className="mx-auto mb-1.5 h-4 w-4 opacity-70"
                />
              )}
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
                {v.label}
              </p>
              <p className="mt-1 text-base font-bold sm:text-lg">
                {v.value}
              </p>
              {v.unit && (
                <p className="text-xs font-medium opacity-70">{v.unit}</p>
              )}
              {v.recordedOn && (
                <p className="mt-0.5 text-[9px] leading-tight font-normal normal-case tracking-normal opacity-50">
                  {v.recordedOn}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

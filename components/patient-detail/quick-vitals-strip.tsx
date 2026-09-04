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
}: {
  vitals: QuickVital[];
  className?: string;
}) {
  if (!vitals || vitals.length === 0) return null;

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {vitals.map((v, i) => {
          const colorClasses =
            v.color ?? DEFAULT_COLOR_MAP[v.label] ?? "border-slate-100 bg-white/70 text-slate-800";
          return (
            <div
              key={i}
              className={`min-w-0 rounded-xl border px-2 py-3 text-center shadow-sm ${colorClasses}`}
            >
              <p className="text-base font-bold sm:text-lg">
                {v.value}
                {v.unit && (
                  <span className="ml-0.5 text-xs font-medium opacity-70">
                    {v.unit}
                  </span>
                )}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
                {v.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

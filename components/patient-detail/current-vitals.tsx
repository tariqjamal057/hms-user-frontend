"use client";

import { Activity, Droplets, Heart, Activity as PulseIcon, Ruler, Thermometer, Weight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type VitalColor = "red" | "pink" | "orange" | "blue" | "purple" | "teal";

export type VitalData = {
  bp?: string;
  pulse?: string;
  temp?: string;
  spo2?: string;
  weight?: string;
  height?: string;
};

export type VitalTip = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  unit: string;
  color: VitalColor;
};

const COLOR_STYLES: Record<VitalColor, { tint: string }> = {
  red: { tint: "bg-red-50 text-red-500" },
  pink: { tint: "bg-pink-50 text-pink-500" },
  orange: { tint: "bg-orange-50 text-orange-500" },
  blue: { tint: "bg-blue-50 text-blue-500" },
  purple: { tint: "bg-purple-50 text-purple-500" },
  teal: { tint: "bg-teal-50 text-teal-500" },
};

/**
 * Unified single vital card. Renders a colored icon chip, a live status dot,
 * the vital label, and the value + unit. Reused inside `CurrentVitals` and
 * directly in any grid.
 */
export function VitalCard({
  icon,
  label,
  value,
  unit,
  color,
}: VitalTip) {
  const style = COLOR_STYLES[color];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", style.tint)}>{icon}</span>
        <p className="flex-1 truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-lg font-bold text-slate-800">
        {value || "—"}
        <span className="ml-0.5 text-[11px] font-normal text-slate-400">{value ? unit : ""}</span>
      </p>
    </div>
  );
}

type CurrentVitalsProps = {
  vitals: VitalData;
  gridClassName?: string;
  className?: string;
  showWeightHeight?: boolean;
};

/**
 * Unified "Current Vitals" card. Accepts a `gridClassName` to control how the
 * vital cards lay out (e.g. `grid-cols-4` on the detail overview, `lg:grid-cols-2`
 * on the consultation page) while keeping identical styling everywhere.
 */
export function CurrentVitals({
  vitals,
  gridClassName,
  className,
  showWeightHeight = true,
}: CurrentVitalsProps) {
  const vitalList: VitalTip[] = [
    { icon: <Activity className="h-4 w-4" />, label: "Blood Pressure", value: vitals.bp, unit: "mmHg", color: "red" },
    { icon: <PulseIcon className="h-4 w-4" />, label: "Pulse Rate", value: vitals.pulse, unit: "/min", color: "pink" },
    { icon: <Thermometer className="h-4 w-4" />, label: "Temperature", value: vitals.temp, unit: "°F", color: "orange" },
    { icon: <Droplets className="h-4 w-4" />, label: "SpO₂", value: vitals.spo2, unit: "%", color: "blue" },
    ...(showWeightHeight && vitals.weight
      ? [{ icon: <Weight className="h-4 w-4" />, label: "Weight", value: vitals.weight, unit: "kg", color: "purple" as VitalColor }]
      : []),
    ...(showWeightHeight && vitals.height
      ? [{ icon: <Ruler className="h-4 w-4" />, label: "Height", value: vitals.height, unit: "cm", color: "teal" as VitalColor }]
      : []),
  ];

  const hasAnyVitals = vitalList.some((v) => v.value);

  return (
    <Card className={cn("border-slate-200", className)}>
      <CardContent className="">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
              <Heart className="h-4 w-4 text-blue-500" />
            </span>
            Current Vitals
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Latest
          </span>
        </div>

        {hasAnyVitals ? (
          <div className={cn("grid grid-cols-2 gap-2.5", gridClassName)}>
            {vitalList.map((v) => (
              <VitalCard key={v.label} {...v} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center">
            <Activity className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-1.5 text-sm text-slate-400">No vitals recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
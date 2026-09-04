"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Heart, Activity, Thermometer, Droplets, Weight, Ruler, Activity as PulseIcon } from "lucide-react";

interface VitalsSidebarCardProps {
  vitals: {
    bp?: string;
    pulse?: string;
    temp?: string;
    spo2?: string;
    weight?: string;
    height?: string;
  };
}

type VitalColor = "red" | "pink" | "orange" | "blue" | "purple" | "teal";

const COLOR_STYLES: Record<VitalColor, { tint: string; icon: string; badge: string }> = {
  red: { tint: "bg-red-50 text-red-500", icon: "bg-red-500", badge: "ring-red-100" },
  pink: { tint: "bg-pink-50 text-pink-500", icon: "bg-pink-500", badge: "ring-pink-100" },
  orange: { tint: "bg-orange-50 text-orange-500", icon: "bg-orange-500", badge: "ring-orange-100" },
  blue: { tint: "bg-blue-50 text-blue-500", icon: "bg-blue-500", badge: "ring-blue-100" },
  purple: { tint: "bg-purple-50 text-purple-500", icon: "bg-purple-500", badge: "ring-purple-100" },
  teal: { tint: "bg-teal-50 text-teal-500", icon: "bg-teal-500", badge: "ring-teal-100" },
};

export function VitalsSidebarCard({ vitals }: VitalsSidebarCardProps) {
  const hasAnyVitals = vitals.bp || vitals.pulse || vitals.temp || vitals.spo2 || vitals.weight || vitals.height;

  const vitalsList = [
    {
      icon: <Activity className="w-4 h-4" />,
      label: "Blood Pressure",
      value: vitals.bp,
      unit: "mmHg",
      color: "red" as VitalColor,
    },
    {
      icon: <PulseIcon className="w-4 h-4" />,
      label: "Pulse Rate",
      value: vitals.pulse,
      unit: "/min",
      color: "pink" as VitalColor,
    },
    {
      icon: <Thermometer className="w-4 h-4" />,
      label: "Temperature",
      value: vitals.temp,
      unit: "°F",
      color: "orange" as VitalColor,
    },
    {
      icon: <Droplets className="w-4 h-4" />,
      label: "SpO₂",
      value: vitals.spo2,
      unit: "%",
      color: "blue" as VitalColor,
    },
    ...(vitals.weight
      ? [{
          icon: <Weight className="w-4 h-4" />,
          label: "Weight",
          value: vitals.weight,
          unit: "kg",
          color: "purple" as VitalColor,
        }]
      : []),
    ...(vitals.height
      ? [{
          icon: <Ruler className="w-4 h-4" />,
          label: "Height",
          value: vitals.height,
          unit: "cm",
          color: "teal" as VitalColor,
        }]
      : []),
  ];

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Heart className="w-4 h-4 text-blue-500" />
            </span>
            Current Vitals
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Latest
          </span>
        </div>

        {hasAnyVitals && vitalsList.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {vitalsList.map((v) => (
              <VitalCard key={v.label} {...v} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center py-4">
            <Activity className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-400 mt-1.5">No vitals recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Complete Step 1 to add vitals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VitalCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  unit: string;
  color: VitalColor;
}) {
  const style = COLOR_STYLES[color];

  return (
    <div className="p-2.5 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`w-7 h-7 rounded-lg ${style.tint} flex items-center justify-center`}>{icon}</span>
        {value ? (
          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${style.badge} ring-4`} />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        )}
      </div>
      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-base font-bold text-slate-800 mt-0.5">
        {value || "—"}
        <span className="text-[10px] font-normal text-slate-400 ml-0.5">{value ? unit : ""}</span>
      </p>
    </div>
  );
}
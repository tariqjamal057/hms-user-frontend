import { Activity, Gauge, HeartPulse, Thermometer, Wind, Droplets } from "lucide-react";
import type { ComponentType } from "react";
import type { NormalRange } from "@/types/doctor/ipd/vitals-types";
import { LabelValueCard } from "@/components/patient-detail/label-value-card";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  BP: Activity,
  Pulse: HeartPulse,
  "Resp. Rate": Wind,
  SpO2: Droplets,
  "Temp.": Thermometer,
  "Pain (NRS)": Gauge,
};

export function NormalRangesWidget({ ranges }: { ranges: NormalRange[] }) {
  return (
    <LabelValueCard
      title="Normal Ranges"
      rows={ranges.map((r) => ({
        label: r.label,
        value: r.range,
        icon: ICON_MAP[r.label],
      }))}
    />
  );
}

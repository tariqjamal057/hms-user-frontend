import { Activity, Gauge, HeartPulse, Thermometer, Wind, Droplets } from "lucide-react";
import type { VitalRecordEntry } from "@/types/doctor/ipd/vitals-types";
import { LabelValueCard } from "@/components/patient-detail/label-value-card";

export function LatestVitalsPanel({ record }: { record: VitalRecordEntry }) {
  const rows = [
    { label: "BP", value: `${record.bp} mmHg`, icon: Activity },
    { label: "Pulse", value: `${record.pulse} bpm`, icon: HeartPulse },
    { label: "Respiratory Rate", value: `${record.respRate} /min`, icon: Wind },
    { label: "SpO2", value: `${record.spo2} %`, icon: Droplets },
    { label: "Temperature", value: `${record.temp} °F`, icon: Thermometer },
    { label: "Pain (NRS)", value: `${record.pain} /10`, icon: Gauge },
  ];

  return <LabelValueCard title="Latest Vitals" subtitle={record.dateTime} rows={rows} />;
}

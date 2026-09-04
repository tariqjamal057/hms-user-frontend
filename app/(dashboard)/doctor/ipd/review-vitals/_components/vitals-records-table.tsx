import { Activity, Calendar, Droplets, Gauge, HeartPulse, Thermometer, User, Wind } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import type { VitalRecordEntry } from "@/types/doctor/ipd/vitals-types";

const COLUMNS: DataColumn<VitalRecordEntry>[] = [
  {
    key: "dateTime",
    label: "Date & Time",
    icon: <Calendar className="h-3 w-3" />,
    color: "text-slate-700",
  },
  {
    key: "bp",
    label: "BP",
    icon: <Activity className="h-3 w-3" />,
    color: "text-red-600",
    unit: "mmHg",
  },
  {
    key: "pulse",
    label: "Pulse",
    icon: <HeartPulse className="h-3 w-3" />,
    color: "text-pink-600",
    unit: "/min",
  },
  {
    key: "respRate",
    label: "Resp. Rate",
    icon: <Wind className="h-3 w-3" />,
    color: "text-violet-600",
    unit: "/min",
  },
  {
    key: "spo2",
    label: "SpO₂",
    icon: <Droplets className="h-3 w-3" />,
    color: "text-blue-600",
    unit: "%",
  },
  {
    key: "temp",
    label: "Temp",
    icon: <Thermometer className="h-3 w-3" />,
    color: "text-orange-600",
    unit: "°F",
  },
  {
    key: "pain",
    label: "Pain",
    icon: <Gauge className="h-3 w-3" />,
    color: "text-rose-600",
    unit: "/10",
  },
  {
    key: "recordedBy",
    label: "Recorded By",
    icon: <User className="h-3 w-3" />,
    color: "text-slate-700",
  },
];

export function VitalsRecordsTable({ records }: { records: VitalRecordEntry[] }) {
  return (
    <DataTable
      rows={records}
      columns={COLUMNS}
      rowKey={(r) => r.dateTime}
      emptyText="No vitals records available"
    />
  );
}

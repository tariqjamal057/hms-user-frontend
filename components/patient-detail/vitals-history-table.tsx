"use client";

import type { ReactNode } from "react";
import {
  Activity,
  Calendar,
  Droplets,
  Heart,
  HeartPulse,
  Thermometer,
  TrendingUp,
  Weight,
  Wind,
} from "lucide-react";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { displayDateToIso } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

/**
 * Generic vitals history row. Accepts either OPD-style fields (date/bp/pulse/
 * temp/spo2/weight) or IPD/ICU/Emergency fields (dateTime/bp/pulse/temp/spo2/
 * respRate/pain/recordedBy). The component auto-detects which shape is
 * present and renders the matching column set.
 */
export type VitalsHistoryRow = {
  date?: string;
  dateTime?: string;
  bp: string;
  pulse: string | number;
  temp: string | number;
  spo2: string | number;
  weight?: string;
  respRate?: string | number;
  pain?: string | number;
  recordedBy?: string;
};

export type VitalsHistoryTableProps = {
  rows: VitalsHistoryRow[];
  title?: string;
  emptyText?: string;
  className?: string;
  /** Show ICU-specific columns (RR, Pain) */
  showIcuColumns?: boolean;
};

type ColDef = {
  key: keyof VitalsHistoryRow;
  label: string;
  icon: ReactNode;
  color: string;
  unit?: string;
};

const COL_STYLES = {
  red: "text-red-600",
  pink: "text-pink-600",
  orange: "text-orange-600",
  blue: "text-blue-600",
  purple: "text-purple-600",
  cyan: "text-cyan-600",
  rose: "text-rose-600",
  slate: "text-slate-700",
} as const;

const BASE_COLUMNS: ColDef[] = [
  { key: "date", label: "Date & Time", icon: <Calendar className="h-3 w-3" />, color: COL_STYLES.slate },
  { key: "bp", label: "BP", icon: <Activity className="h-3 w-3" />, color: COL_STYLES.red, unit: "mmHg" },
  { key: "pulse", label: "Pulse", icon: <HeartPulse className="h-3 w-3" />, color: COL_STYLES.pink, unit: "/min" },
];

const ICU_COLUMNS: ColDef[] = [
  { key: "respRate", label: "RR", icon: <Wind className="h-3 w-3" />, color: COL_STYLES.cyan, unit: "/min" },
  { key: "spo2", label: "SpO₂", icon: <Droplets className="h-3 w-3" />, color: COL_STYLES.blue, unit: "%" },
  { key: "temp", label: "Temp", icon: <Thermometer className="h-3 w-3" />, color: COL_STYLES.orange, unit: "°F" },
  { key: "pain", label: "Pain", icon: <Heart className="h-3 w-3" />, color: COL_STYLES.rose, unit: "/10" },
  { key: "recordedBy", label: "Recorded By", icon: <Heart className="h-3 w-3" />, color: COL_STYLES.slate },
];

const OPD_COLUMNS: ColDef[] = [
  { key: "temp", label: "Temp", icon: <Thermometer className="h-3 w-3" />, color: COL_STYLES.orange, unit: "°F" },
  { key: "spo2", label: "SpO₂", icon: <Droplets className="h-3 w-3" />, color: COL_STYLES.blue, unit: "%" },
  { key: "weight", label: "Weight", icon: <Weight className="h-3 w-3" />, color: COL_STYLES.purple, unit: "kg" },
];

/**
 * Unified "Vitals Trend History" card + table. Renders a tappable-free,
 * hover-highlighted table with colored column icons, color-coded vital values
 * and appended units. Reused across overview/detail views that show patient
 * vitals history. Built on top of the shared `DataTable` primitive.
 */
export function VitalsHistoryTable({
  rows,
  title = "Vitals Trend History",
  emptyText = "No vitals history recorded for this patient",
  className,
  showIcuColumns = false,
}: VitalsHistoryTableProps) {
  const columns: DataColumn<VitalsHistoryRow>[] = [
    ...BASE_COLUMNS,
    ...(showIcuColumns ? ICU_COLUMNS : OPD_COLUMNS),
  ].map((def) => ({
    key: def.key as string,
    label: def.label,
    align: "left" as const,
    icon: def.icon,
    color: def.color,
    unit: def.unit,
    render:
      def.key === "date" || def.key === "dateTime"
        ? (row) => <span className="font-semibold text-slate-700">{String(row.dateTime ?? row.date ?? "")}</span>
        : def.key === "recordedBy"
          ? (row) => <span className="text-slate-600">{String(row[def.key] ?? "")}</span>
          : undefined,
  }));

  return (
    <DataTable
      card
      className={cn(className)}
      title={title}
      titleIcon={<TrendingUp className="h-4 w-4" />}
      countLabel="entries"
      emptyText={emptyText}
      rows={rows}
      columns={columns}
      rowKey={(r) => `${r.date ?? r.dateTime ?? ""}-${r.bp}-${r.pulse}-${r.temp}`}
      searchable
      searchPlaceholder="Search date, BP or recorded by..."
      filters={[
        {
          id: "recorded-on",
          type: "daterange",
          label: "Recorded",
          getValue: (r) => r.date ?? displayDateToIso(r.dateTime ?? ""),
        },
      ]}
    />
  );
}
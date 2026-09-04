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
import { Card, CardContent } from "@/components/ui/card";
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
  align?: string;
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
  { key: "date", label: "Date / Time", icon: <Calendar className="h-3 w-3" />, color: COL_STYLES.slate, align: "text-left" },
  { key: "bp", label: "BP", icon: <Activity className="h-3 w-3" />, color: COL_STYLES.red, align: "text-left", unit: "mmHg" },
  { key: "pulse", label: "Pulse", icon: <HeartPulse className="h-3 w-3" />, color: COL_STYLES.pink, align: "text-left", unit: "/min" },
  { key: "temp", label: "Temp", icon: <Thermometer className="h-3 w-3" />, color: COL_STYLES.orange, align: "text-left", unit: "°F" },
  { key: "spo2", label: "SpO₂", icon: <Droplets className="h-3 w-3" />, color: COL_STYLES.blue, align: "text-left", unit: "%" },
];

const ICU_COLUMNS: ColDef[] = [
  { key: "respRate", label: "RR", icon: <Wind className="h-3 w-3" />, color: COL_STYLES.cyan, align: "text-left", unit: "/min" },
  { key: "pain", label: "Pain", icon: <Heart className="h-3 w-3" />, color: COL_STYLES.rose, align: "text-left", unit: "/10" },
  { key: "recordedBy", label: "Recorded By", icon: <Heart className="h-3 w-3" />, color: COL_STYLES.slate, align: "text-left" },
];

const OPD_COLUMNS: ColDef[] = [
  { key: "weight", label: "Weight", icon: <Weight className="h-3 w-3" />, color: COL_STYLES.purple, align: "text-left", unit: "kg" },
];

/**
 * Unified "Vitals Trend History" card + enhanced table. Renders a tappable-free,
 * hover-highlighted table with colored column icons, color-coded vital values
 * and appended units. Reused across overview/detail views that show patient
 * vitals history.
 */
export function VitalsHistoryTable({
  rows,
  title = "Vitals Trend History",
  emptyText = "No vitals history recorded for this patient",
  className,
  showIcuColumns = false,
}: VitalsHistoryTableProps) {
  const columns: ColDef[] = [
    ...BASE_COLUMNS,
    ...(showIcuColumns ? ICU_COLUMNS : OPD_COLUMNS),
  ];

  return (
    <Card className={cn("border-slate-200 transition-shadow hover:shadow-md p-0", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200">
              <TrendingUp className="h-4 w-4" />
            </span>
            {title}
          </h3>
          {rows.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {rows.length} entries
            </span>
          )}
        </div>

        {rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    {columns.map((col) => (
                      <th
                        key={col.key as string}
                        className={cn(
                          "whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-3 sm:text-xs",
                          col.align,
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span className={col.color}>{col.icon}</span>
                          {col.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={`${row.date ?? row.dateTime ?? idx}-${idx}`}
                      className={cn(
                        "border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/40",
                        idx % 2 === 1 && "bg-slate-50/40",
                      )}
                    >
                      {columns.map((col) => {
                        const raw = row[col.key as keyof VitalsHistoryRow];
                        const textClass = col.color;
                        const isDate = col.key === "date" || col.key === "dateTime";
                        return (
                          <td
                            key={col.key as string}
                            className={cn(
                              "whitespace-nowrap px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm",
                              col.align,
                            )}
                          >
                            {isDate ? (
                              <span className="font-semibold text-slate-700">{raw as string}</span>
                            ) : col.key === "recordedBy" ? (
                              <span className="text-slate-600">{raw as string}</span>
                            ) : (
                              <span className={cn("font-semibold", textClass)}>
                                {raw as string}
                                {col.unit && (
                                  <span className="ml-1 text-[10px] font-medium text-slate-400 sm:text-[11px]">
                                    {col.unit}
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-2 text-sm text-slate-400">{emptyText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

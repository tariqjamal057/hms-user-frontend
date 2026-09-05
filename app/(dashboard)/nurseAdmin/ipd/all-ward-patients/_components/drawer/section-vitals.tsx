// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-vitals.tsx
"use client";
import { useMemo, useState } from "react";
import { HeartPulse } from "lucide-react";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import { VitalsHistoryTable } from "@/components/patient-detail/vitals-history-table";
import type { VitalRecordFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { DateFilterBar } from "./date-filter-bar";
import { SectionHeader } from "./section-header";

export function SectionVitals({ vitals }: { vitals: VitalRecordFull[] }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(() => date ? vitals.filter((v) => v.date === date) : vitals, [vitals, date]);
  const latest = vitals[0];

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<HeartPulse className="h-5 w-5" />}
        title="Vitals Monitoring"
        subtitle="Latest reading, abnormal range highlights and full history across doctor & nurse entries."
      />

      <CurrentVitals
        showIcuTiles
        showWeightHeight={false}
        gridClassName="grid-cols-3 sm:grid-cols-6"
        vitals={
          latest
            ? {
                bp: latest.bp,
                pulse: String(latest.pulse),
                temp: String(latest.temp),
                spo2: String(latest.spo2),
                respRate: String(latest.respRate),
                pain: String(latest.pain),
              }
            : {}
        }
      />
      {latest && (
        <p className="text-xs text-slate-400">
          Recorded {latest.dateTime} by {latest.recordedBy} ({latest.recordedByRole})
        </p>
      )}

      <DateFilterBar value={date} onChange={setDate} />

      <VitalsHistoryTable
        showIcuColumns
        rows={filtered.map((v) => ({
          dateTime: v.dateTime,
          bp: v.bp,
          pulse: v.pulse,
          temp: v.temp,
          spo2: v.spo2,
          respRate: v.respRate,
          pain: v.pain,
          recordedBy: v.recordedBy,
        }))}
        title="Vitals History (Doctor & Nurse Entries)"
        emptyText="No vitals found for this date."
      />
    </div>
  );
}
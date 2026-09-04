// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-vitals.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Plus, Stethoscope, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type { VitalRecord } from "@/types/emergency/emergency-types";
import { DateFilterBar } from "./date-filter-bar";
import { PillButton } from "@/components/forms/pill-button";

export function SectionVitals({ vitals, recordPath }: { vitals: VitalRecord[]; recordPath?: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const filtered = useMemo(
    () => (date ? vitals.filter((v) => v.date === date) : vitals),
    [vitals, date],
  );
  const latest = vitals[0];

  const columns: DataColumn<VitalRecord>[] = useMemo(
    () => [
      {
        key: "dateTime",
        label: "Date / Time",
        render: (v) => (
          <span className="font-medium text-slate-700">{v.dateTime}</span>
        ),
      },
      {
        key: "bp",
        label: "BP",
        render: (v) => <span className="text-slate-700">{v.bp}</span>,
        cellClassName: "font-semibold",
      },
      {
        key: "pulse",
        label: "Pulse",
        unit: "/min",
        render: (v) => v.pulse,
      },
      {
        key: "respRate",
        label: "RR",
        unit: "/min",
        render: (v) => v.respRate,
      },
      {
        key: "spo2",
        label: "SpO₂",
        unit: "%",
        render: (v) => v.spo2,
      },
      {
        key: "temp",
        label: "Temp",
        unit: "°F",
        render: (v) => v.temp,
      },
      {
        key: "pain",
        label: "Pain",
        unit: "/10",
        render: (v) => v.pain,
      },
      {
        key: "recordedBy",
        label: "Recorded By",
        render: (v) => (
          <span className="flex items-center gap-1.5 text-slate-600">
            {v.recordedByRole === "Nurse" ? (
              <UserRound className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
            )}
            {v.recordedBy}
            <span className="text-xs text-slate-400">({v.recordedByRole})</span>
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm shadow-red-200">
                <HeartPulse className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-bold text-slate-800 sm:text-base">
                Latest Vitals
              </p>
            </div>
            {recordPath && (
              <PillButton
                size="sm"
                icon={Plus}
                onClick={() => router.push(recordPath)}
              >
                Add Vitals
              </PillButton>
            )}
          </div>
          {latest ? (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                <Vital label="BP" value={latest.bp} unit="mmHg" />
                <Vital label="Pulse" value={String(latest.pulse)} unit="/min" />
                <Vital label="Temp" value={String(latest.temp)} unit="°F" />
                <Vital label="RR" value={String(latest.respRate)} unit="/min" />
                <Vital label="SpO₂" value={String(latest.spo2)} unit="%" />
                <Vital label="Pain" value={String(latest.pain)} unit="/10" />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Recorded {latest.dateTime} by {latest.recordedBy} (
                {latest.recordedByRole})
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No vitals recorded yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="mb-3">
        <DateFilterBar value={date} onChange={setDate} />
      </div>

      <DataTable
        card
        title="Vitals History"
        titleIcon={<HeartPulse className="h-4 w-4" />}
        rows={filtered}
        columns={columns}
        rowKey={(v) => v.id}
        countLabel="vitals"
        emptyText={
          date ? `No vitals found for ${date}.` : "No vitals recorded yet."
        }
        className="border-slate-200"
      />
    </div>
  );
}

function Vital({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 text-center transition hover:border-slate-300 hover:shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">
        {value} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}


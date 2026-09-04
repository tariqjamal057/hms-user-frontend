// app/(dashboard)/doctor/ipd/clinical-overview/[uhid]/_components/clinical-overview-tabs.tsx
"use client";

import {
  Ban, CheckCircle2, ClipboardList, Clock, FileText,
  HeartPulse, Pill, Stethoscope, TestTube,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import { MedicineStatusCard } from "@/components/patient-detail/medicine-status-card";
import { InfoCard } from "@/components/patient-detail/info-card";
import { VitalsHistoryTable } from "@/components/patient-detail/vitals-history-table";
import type { VitalRecord } from "@/lib/doctor/opd/opd-mock-data";

function getLogIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    Vitals: <HeartPulse className="w-4 h-4 text-red-500" />,
    Medicine: <Pill className="w-4 h-4 text-purple-500" />,
    Lab: <TestTube className="w-4 h-4 text-amber-500" />,
    Note: <FileText className="w-4 h-4 text-blue-500" />,
    Diagnosis: <ClipboardList className="w-4 h-4 text-cyan-500" />,
    Nursing: <User className="w-4 h-4 text-teal-500" />,
    "Doctor Round": <Stethoscope className="w-4 h-4 text-indigo-500" />,
  };
  return icons[type] || <FileText className="w-4 h-4 text-slate-400" />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function OverviewMedicinesTab({ patient }: { patient: WardRoundPatient }) {
  const given = patient.medicines?.filter((m) => m.status === "Given") || [];
  const pending = patient.medicines?.filter((m) => m.status === "Pending") || [];
  const other = patient.medicines?.filter((m) => m.status === "Held" || m.status === "Discontinued") || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-bold text-slate-800">Given by Nurse</h3>
            <Badge className="bg-green-100 text-green-700 ml-auto">{given.length}</Badge>
          </div>
          {given.length > 0 ? (
            <div className="space-y-2">
              {given.map((med) => (
                <MedicineStatusCard key={med.id} med={med} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No medicines given yet</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800">Pending / Not Given</h3>
            <Badge className="bg-amber-100 text-amber-700 ml-auto">{pending.length}</Badge>
          </div>
          {pending.length > 0 ? (
            <div className="space-y-2">
              {pending.map((med) => (
                <MedicineStatusCard key={med.id} med={med} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No pending medicines</p>
          )}
        </Card>
      </div>

      {other.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-800">Held / Discontinued</h3>
          </div>
          <div className="space-y-2">
            {other.map((med) => (
              <MedicineStatusCard key={med.id} med={med} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export function OverviewLabsTab({ patient }: { patient: WardRoundPatient }) {
  const labs = patient.labReports || [];

  const statusTone: Record<string, "slate" | "blue" | "amber" | "purple" | "emerald"> = {
    Ordered: "slate",
    "Sample Collected": "blue",
    "In Progress": "amber",
    "Result Ready": "purple",
    Reviewed: "emerald",
  };

  return (
    <InfoCard
      title="Lab & Investigation Reports"
      icon={<TestTube className="h-4 w-4 sm:h-5 sm:w-5" />}
      tone="amber"
      limit={labs.length + 1}
      className="shadow-sm"
      emptyText="No lab reports recorded for this patient"
      items={labs.map((lab) => ({
        key: lab.id,
        title: lab.testName,
        badges: [
          { label: lab.status, tone: statusTone[lab.status] ?? "slate" },
          ...(lab.isAbnormal ? [{ label: "Abnormal", tone: "red" as const }] : []),
        ],
        rows: [
          { value: lab.category, block: true },
          ...(lab.result
            ? [{ value: lab.result, tone: lab.isAbnormal ? ("red" as const) : undefined, emphasize: true }]
            : []),
          { value: lab.orderedOn },
          ...(lab.resultOn ? [{ value: lab.resultOn }] : []),
          { value: lab.orderedBy },
        ],
      }))}
    />
  );
}

export function OverviewVitalsTab({ patient }: { patient: WardRoundPatient }) {
  const history = patient.vitalsHistory || [];
  const rows: VitalRecord[] = history.map((v) => ({
    date: v.recordedOn,
    bp: v.bp,
    pulse: v.pulse,
    temp: v.temp,
    spo2: v.spo2,
    weight: "—",
  }));
  return (
    <VitalsHistoryTable
      rows={rows}
      emptyText="No vitals history recorded"
    />
  );
}

export function OverviewLogsTab({ patient }: { patient: WardRoundPatient }) {
  const logs = patient.clinicalLogs || [];
  return (
    <InfoCard
      title="Clinical Activity Log"
      icon={<ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />}
      tone="blue"
      limit={logs.length + 1}
      className="shadow-sm"
      emptyText="No clinical logs recorded"
      items={logs.map((log) => ({
        key: log.id,
        title: log.title,
        icon: getLogIcon(log.type),
        badges: [{ label: log.type, tone: "slate" }],
        rows: [
          { value: log.description, full: true },
          { value: `${log.timestamp} • ${log.recordedBy}` },
        ],
      }))}
    />
  );
}

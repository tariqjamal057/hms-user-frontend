// app/(dashboard)/nurse/icu/patients/[uhid]/_components/handover-snapshot.tsx
"use client";

import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  MessageSquareText,
  Pill,
  ShieldAlert,
  Stethoscope,
  UserRound,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { InfoTileCard, type InfoTileCardTone } from "@/components/patient-detail/info-tile-card";
import type {
  EmarDose,
  FluidBalanceEntry,
  NurseIpdPatient,
  ProgressNote,
  VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";
import { cn } from "@/lib/utils";

const ACUITY_TONE: Record<string, InfoTileCardTone> = {
  Critical: "red",
  Unstable: "amber",
  Stable: "emerald",
  "Under Observation": "cyan",
};

type HandoverSnapshotProps = {
  patient: NurseIpdPatient;
  vitals: VitalRecord[];
  doses: EmarDose[];
  notes: ProgressNote[];
  fluidEntries: FluidBalanceEntry[];
};

/**
 * First-class ICU "Handover" snapshot. Gives the incoming shift / team an at-a-
 * glance summary — current condition, diagnosis, latest vitals, medication
 * status, pending orders, alerts, fluid balance and doctor/nurse instructions.
 */
export function HandoverSnapshot({
  patient,
  vitals,
  doses,
  notes,
  fluidEntries,
}: HandoverSnapshotProps) {
  const latest = vitals[0];
  const givenDoses = doses.filter((d) => d.status === "Given");
  const pendingDoses = doses.filter((d) => d.status !== "Given" && d.status !== "Out of Stock");
  const lastGiven = givenDoses[0];
  const doctorNote = notes.find((n) => n.role === "Doctor");
  const nurseNote = notes.find((n) => n.role === "Nurse");
  const latestNote = notes[0] ?? doctorNote ?? nurseNote;

  const intake = fluidEntries
    .filter((e) => e.direction === "Intake")
    .reduce((sum, e) => sum + e.volumeMl, 0);
  const output = fluidEntries
    .filter((e) => e.direction === "Output")
    .reduce((sum, e) => sum + e.volumeMl, 0);
  const net = intake - output;

  const allergyTone = patient.allergies.length > 0 ? ("red" as const) : ("emerald" as const);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Handover Snapshot — {patient.patientName}
            </p>
            <p className="text-xs text-slate-500">
              Quick summary for the incoming shift / team ·{" "}
              {patient.ward} / {patient.bed} · {patient.ipdId}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "self-start border px-3 py-1 text-[11px] font-bold sm:self-auto",
            patient.acuity === "Critical"
              ? "border-red-200 bg-red-50 text-red-700"
              : patient.acuity === "Stable"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-cyan-200 bg-cyan-50 text-cyan-700",
          )}
        >
          {patient.acuity}
        </Badge>
      </div>

      {/* Critical alerts */}
      {patient.allergies.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<ShieldAlert className="h-4 w-4" />}
          title="Allergy Alert"
          body={`${patient.patientName} is allergic to: ${patient.allergies.join(", ")}. Exercise caution with all medications.`}
        />
      )}

      {/* Snapshot grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoTileCard
          title="Current Condition"
          icon={<UserRound className="h-3.5 w-3.5" />}
          tone={ACUITY_TONE[patient.acuity] ?? "slate"}
          value={patient.acuity}
          subtitle={`Admitted ${patient.admissionDateTime} · ${patient.department}`}
        />
        <InfoTileCard
          title="Diagnosis"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          tone="purple"
          value={patient.currentDiagnosis}
          subtitle={`ICD ${patient.diagnosisCode} · Dr. ${patient.admittingDoctor}`}
        />
        <InfoTileCard
          title="Latest Vitals"
          icon={<HeartPulse className="h-3.5 w-3.5" />}
          tone="rose"
          value={
            latest
              ? `${latest.bp} · ${latest.pulse}/min · SpO₂ ${latest.spo2}%`
              : "No vitals yet"
          }
          subtitle={
            latest
              ? `${latest.dateTime} · ${latest.recordedBy}`
              : "Record from Vitals Monitoring"
          }
        />
        <InfoTileCard
          title="Medications Given"
          icon={<Pill className="h-3.5 w-3.5" />}
          tone="emerald"
          value={String(givenDoses.length)}
          subtitle={
            lastGiven
              ? `Last: ${lastGiven.medicineName} ${lastGiven.strength} (${lastGiven.givenAt ?? "—"})`
              : "Nothing administered yet"
          }
        />
        <InfoTileCard
          title="Pending Orders"
          icon={<Activity className="h-3.5 w-3.5" />}
          tone={pendingDoses.length > 0 ? "amber" : "slate"}
          value={String(pendingDoses.length)}
          subtitle={
            pendingDoses.length > 0
              ? `Next: ${pendingDoses[0].medicineName} · ${pendingDoses[0].slot} ${pendingDoses[0].scheduledTime}`
              : "All scheduled doses on track"
          }
        />
        <InfoTileCard
          title="Allergies"
          icon={<ShieldAlert className="h-3.5 w-3.5" />}
          tone={allergyTone}
          value={patient.allergies.length > 0 ? patient.allergies.join(", ") : "None known"}
          subtitle={patient.allergies.length > 0 ? "Exercise caution" : "No allergy alerts"}
        />
        <InfoTileCard
          title="Fluid Balance"
          icon={<Waves className="h-3.5 w-3.5" />}
          tone="cyan"
          value={`${net >= 0 ? "+" : ""}${net} ml`}
          subtitle={`In ${intake} ml / Out ${output} ml`}
        />
        <InfoTileCard
          title="Shift Timeline"
          icon={<CalendarClock className="h-3.5 w-3.5" />}
          tone="slate"
          value={patient.currentShift}
          subtitle={`Assigned nurse: ${patient.assignedNurse}`}
        />
        <InfoTileCard
          title="Doctor's Instructions"
          icon={<MessageSquareText className="h-3.5 w-3.5" />}
          tone="blue"
          value={doctorNote?.noteText ?? "No standing instructions on record"}
          subtitle={doctorNote ? `${doctorNote.author} · ${doctorNote.createdAt}` : undefined}
        />
      </div>

      {/* Nurse notes */}
      <InfoAlertCard
        tone="blue"
        icon={<MessageSquareText className="h-4 w-4" />}
        title={`Nursing Note — ${latestNote?.author ?? "No nurse notes yet"}`}
        body={
          latestNote
            ? `${[latestNote.subjective, latestNote.assessment, latestNote.plan, latestNote.noteText]
                .filter(Boolean)
                .join(" · ")}`
            : "Add a progress note to capture observations before handover."
        }
      />
    </div>
  );
}
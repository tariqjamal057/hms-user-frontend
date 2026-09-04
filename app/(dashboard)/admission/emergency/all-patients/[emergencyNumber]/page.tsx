"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import type { EmergencyPatient, EmergencyStatus } from "@/types/emergency/emergency-types";
import { EMERGENCY_PATIENTS, EMERGENCY_STATUS_OPTIONS } from "@/lib/emergency/emergency-data";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import { SectionRegistration } from "../_components/drawer/section-registration";
import { SectionVitals } from "../_components/drawer/section-vitals";
import { SectionDiagnosis } from "../_components/drawer/section-diagnosis";
import { SectionMedicines } from "../_components/drawer/section-medicines";
import { SectionLabReports } from "../_components/drawer/section-lab-reports";
import { SectionProgressNotes } from "../_components/drawer/section-progress-notes";
import { SectionTreatmentPlan } from "../_components/drawer/section-treatment-plan";
import { SectionAssignedNurses } from "../_components/drawer/section-assigned-nurses";
import { SectionHandoverPolice } from "../_components/drawer/section-handover-police";

const COLOR_MAP: Record<string, { color: string; dot: string }> = {
  "Under Observation": { color: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Stable: { color: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Critical: { color: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
  "Shifted to IPD": { color: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  "Shifted to OT": { color: "border-violet-200 bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  "Shifted to ICU": { color: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  "Well & Released": { color: "border-teal-200 bg-teal-50 text-teal-700", dot: "bg-teal-500" },
  "Follow-up OPD": { color: "border-cyan-200 bg-cyan-50 text-cyan-700", dot: "bg-cyan-500" },
  "Patient Death": { color: "border-slate-400 bg-slate-200 text-slate-700", dot: "bg-slate-500" },
};

const STATUS_OPTIONS = EMERGENCY_STATUS_OPTIONS.map((s) => ({
  label: s,
  value: s,
  color: COLOR_MAP[s]?.color ?? "border-slate-200 bg-slate-50 text-slate-600",
  dot: COLOR_MAP[s]?.dot ?? "bg-slate-400",
}));

export default function EmergencyPatientDetailPage() {
  const params = useParams<{ emergencyNumber: string }>();
  const [patients, setPatients] = useState<EmergencyPatient[]>(EMERGENCY_PATIENTS);
  const patient = useMemo(
    () => patients.find((p) => p.emergencyNumber === params.emergencyNumber) ?? null,
    [patients, params.emergencyNumber],
  );

  const patientList: PatientListItem[] = useMemo(
    () =>
      patients.map((p) => ({
        uhid: p.uhid,
        name: p.patientName || "Unidentified",
        subtitle: `${p.emergencyNumber} · ${p.bedOrBay}`,
      })),
    [patients],
  );

  if (!patient) return notFound();
  const active = patient;

  function handlePatientUpdate(updated: EmergencyPatient) {
    setPatients((previous) =>
      previous.map((p) =>
        p.emergencyNumber === updated.emergencyNumber ? updated : p,
      ),
    );
  }

  function informPolice(firNumber: string, remarks: string) {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const updated = {
      ...active,
      police: {
        ...active.police,
        informed: true,
        informedAt: stamp,
        informedBy: "Front Desk - Admission",
        firNumber: firNumber || undefined,
        remarks: remarks || active.police.remarks,
      },
    } as EmergencyPatient;
    handlePatientUpdate(updated);
    toast.success(`${active.police.nearestPoliceStation} has been informed.`);
  }

  const acuity =
    active.status === "Critical"
      ? "Critical"
      : active.status === "Under Observation"
        ? "Under Observation"
        : undefined;

  const patientData: PatientDetailData = {
    uhid: active.uhid,
    name: active.patientName || "Unidentified",
    age: active.age ?? 0,
    gender: active.gender,
    bloodGroup: "Unspecified",
    allergies: active.allergies,
    acuity,
    moduleId: active.emergencyNumber,
    moduleIdLabel: "Emergency No.",
    locationParts: [active.bedOrBay],
    metaLine: active.incidentType,
    fallbackInfoFields: [
      { label: "Attending Doctor", value: active.attendingDoctor },
      { label: "Assigned RMO", value: active.assignedRmo },
      { label: "Arrival Mode", value: active.arrivalMode },
      { label: "Registered At", value: active.registeredAt },
    ],
  };

  const tabs: PatientTab[] = [
    { value: "registration", label: "Registration", content: <SectionRegistration patient={active} /> },
    { value: "vitals", label: "Vitals", content: <SectionVitals vitals={active.vitals} /> },
    { value: "diagnosis", label: "Diagnosis", content: <SectionDiagnosis diagnoses={active.diagnoses} /> },
    { value: "medicines", label: "Medicines", content: <SectionMedicines doses={active.doses} /> },
    { value: "labs", label: "Lab Reports", content: <SectionLabReports reports={active.labReports} /> },
    { value: "notes", label: "Progress Notes", content: <SectionProgressNotes notes={active.progressNotes} /> },
    { value: "treatment", label: "Treatment Plan", content: <SectionTreatmentPlan plans={active.treatmentPlans} /> },
    { value: "nurses", label: "Assigned Nurses", content: <SectionAssignedNurses assignments={active.assignedNurses} /> },
    { value: "handover", label: "Handover & Police", content: <SectionHandoverPolice handovers={active.handovers} police={active.police} onInformPolice={informPolice} /> },
  ];

  return (
    <PatientDetailShell
      patient={patientData}
      patientList={patientList}
      patientsPath="/admission/emergency/all-patients"
      status={active.status}
      statusOptions={STATUS_OPTIONS}
      onStatusChange={(s) => handlePatientUpdate({ ...active, status: s as EmergencyStatus })}
      tabs={tabs}
      defaultTab="registration"
    />
  );
}
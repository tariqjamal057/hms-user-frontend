// lib/patient-detail/patient-profile-data.ts
// Adapters that normalize concrete module patient records into the unified
// PatientDetailData shape used by PatientProfileCard / PatientDetailShell.
import type {
  PatientDetailData,
  PatientListItem,
} from "@/components/patient-detail/patient-detail-types";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";

export function diagnosisCause(currentDiagnosis?: string, diagnosisCode?: string): string | undefined {
  return currentDiagnosis
    ? `${currentDiagnosis}${diagnosisCode ? ` · ${diagnosisCode}` : ""}`
    : undefined;
}

export function wardRoundProfileDetail(p: WardRoundPatient): PatientDetailData {
  const fallbackInfoFields: PatientDetailData["fallbackInfoFields"] = [
    { label: "Department", value: p.department },
    { label: "Attending Doctor", value: p.admittingDoctor },
    { label: "Admitted On", value: p.admissionDateTime },
  ];
  if (p.expectedDischarge) fallbackInfoFields.push({ label: "Expected Discharge", value: p.expectedDischarge });

  const quickVitals: PatientDetailData["quickVitals"] = [
    { label: "BP", value: p.vitals.bp, unit: "mmHg" },
    { label: "Pulse", value: p.vitals.pulse, unit: "/min" },
    { label: "Temp", value: p.vitals.temp, unit: "°F" },
    { label: "RR", value: p.vitals.rr, unit: "/min" },
    { label: "SpO₂", value: p.vitals.spo2, unit: "%" },
    { label: "Pain", value: p.vitals.pain, unit: "/10" },
  ];

  return {
    uhid: p.uhid,
    name: p.patientName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies ?? [],
    acuity: p.status,
    moduleId: p.ipdId,
    moduleIdLabel: "IPD ID",
    locationParts: p.wardRoomBed.split("/").map((s) => s.trim()).filter(Boolean),
    causeOfProblem: diagnosisCause(p.currentDiagnosis, p.diagnosisCode),
    contact: p.contactNumber,
    quickVitals,
    fallbackInfoFields,
  };
}

export function wardRoundPatientList(patients: WardRoundPatient[]): PatientListItem[] {
  return patients.map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.uhid} · ${p.ipdId} · ${p.wardRoomBed}`,
  }));
}
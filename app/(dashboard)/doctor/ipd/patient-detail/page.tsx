// app/(dashboard)/doctor/ipd/patient-detail/page.tsx
"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PatientDetailShell, type PatientTab, type PatientDetailData, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import { getAllWardPatients, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import ReviewVitalsPage from "../review-vitals/page";
import DiagnosisUpdatePage from "../diagnosis-update/page";
import ProgressNotesPage from "../progress-note/page";
import MedicineOrdersPage from "../medicine-orders/page";
import InvestigationOrdersPage from "../investigation-orders/page";
import TreatmentPlanPage from "../treatment-plan/page";
import DischargeDecisionPage from "../discharge-decision/page";

function parseLocation(wardRoomBed: string) {
  return wardRoomBed.split("/").map((s) => s.trim()).filter(Boolean);
}

function toDetailData(p: WardRoundPatient): PatientDetailData {
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
    locationParts: parseLocation(p.wardRoomBed),
    metaLine: `${p.currentDiagnosis} (${p.diagnosisCode})`,
    fallbackInfoFields: [
      { label: "Department", value: p.department },
      { label: "Attending Doctor", value: p.admittingDoctor },
      { label: "Admitted On", value: p.admissionDateTime },
      { label: "Diagnosis", value: p.currentDiagnosis, highlight: true },
    ],
  };
}

function PatientDetailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const all = useMemo(() => getAllWardPatients(), []);
  const requestedUhid = params.get("uhid");
  const initialUhid =
    requestedUhid && all.some((p) => p.uhid === requestedUhid)
      ? requestedUhid
      : (all[0]?.uhid ?? "");
  const [uhid, setUhid] = useState<string>(initialUhid);
  const patient = getPatientByUhid(uhid);

  const detail: PatientDetailData | undefined = patient ? toDetailData(patient) : undefined;

  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.uhid} · ${p.ipdId} · ${p.wardRoomBed}`,
      })),
    [all],
  );

  if (!patient || !detail) {
    return <div className="p-10 text-center text-sm text-slate-400">No IPD patients available</div>;
  }

  const tabs: PatientTab[] = [
    { value: "review-vitals", label: "Review Vitals", content: <ReviewVitalsPage key={uhid} uhid={uhid} embedded /> },
    { value: "diagnosis-update", label: "Diagnosis Update", content: <DiagnosisUpdatePage key={uhid} uhid={uhid} embedded /> },
    { value: "progress-note", label: "Progress Note", content: <ProgressNotesPage key={uhid} uhid={uhid} embedded /> },
    { value: "medicine-orders", label: "Medicine Orders", content: <MedicineOrdersPage key={uhid} uhid={uhid} embedded /> },
    { value: "lab-orders", label: "Lab Orders", content: <InvestigationOrdersPage key={uhid} uhid={uhid} embedded /> },
    { value: "treatment-plan", label: "Treatment Plan", content: <TreatmentPlanPage key={uhid} uhid={uhid} embedded /> },
    { value: "discharge-decision", label: "Discharge Decision", content: <DischargeDecisionPage key={uhid} uhid={uhid} embedded /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath="/doctor/ipd/patients"
      tabs={tabs}
      showPatientSwitcher
      onSwitchPatient={(u) => setUhid(u)}
      onBack={() => router.push("/doctor/ipd/patients")}
      subtitle="IPD Patient"
    />
  );
}

export default function DoctorIpdPatientDetailPage() {
  return (
    <Suspense fallback={null}>
      <PatientDetailInner />
    </Suspense>
  );
}

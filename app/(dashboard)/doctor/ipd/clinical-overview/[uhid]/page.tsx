// app/(dashboard)/doctor/ipd/clinical-overview/[uhid]/page.tsx
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientDetailShell, type PatientTab, type PatientDetailData, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import { getAllWardPatients, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import { OverviewMedicinesTab, OverviewLabsTab, OverviewVitalsTab, OverviewLogsTab } from "./_components/clinical-overview-tabs";

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
    contact: p.contactNumber,
    quickVitals: [
      { label: "BP", value: p.vitals.bp, unit: "mmHg" },
      { label: "Pulse", value: p.vitals.pulse, unit: "/min" },
      { label: "Temp", value: p.vitals.temp, unit: "°F" },
      { label: "RR", value: p.vitals.rr, unit: "/min" },
      { label: "SpO₂", value: p.vitals.spo2, unit: "%" },
      { label: "Pain", value: p.vitals.pain, unit: "/10" },
    ],
    fallbackInfoFields: [
      { label: "Department", value: p.department },
      { label: "Attending Doctor", value: p.admittingDoctor },
      {
        label: "Admitted On",
        value: p.daysAdmitted ? `${p.admissionDateTime} (${p.daysAdmitted} days)` : p.admissionDateTime,
      },
      { label: "Diagnosis", value: p.currentDiagnosis, highlight: true },
      { label: "Diagnosis Code", value: p.diagnosisCode },
    ],
  };
}

export default function ClinicalOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const uhid = params.uhid as string;

  const all = useMemo(() => getAllWardPatients(), []);
  const patient = getPatientByUhid(uhid);

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">Patient Not Found</p>
          <p className="mt-2 text-sm text-slate-500">No patient record found for UHID: {uhid}</p>
        </div>
      </div>
    );
  }

  const detail = toDetailData(patient);

  const patientList: PatientListItem[] = all.map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.uhid} · ${p.ipdId} · ${p.wardRoomBed}`,
  }));

  const tabs: PatientTab[] = [
    { value: "medicines", label: "Medicines", content: <OverviewMedicinesTab patient={patient} /> },
    { value: "labs", label: "Lab Reports", content: <OverviewLabsTab patient={patient} /> },
    { value: "vitals", label: "Vitals History", content: <OverviewVitalsTab patient={patient} /> },
    { value: "logs", label: "Clinical Logs", content: <OverviewLogsTab patient={patient} /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath="/doctor/ipd/patients"
      tabs={tabs}
      // showPatientSwitcher
      onSwitchPatient={(u) => router.push(`/doctor/ipd/clinical-overview/${u}`)}
      onBack={() => router.push("/doctor/ipd/patients")}
      subtitle="Clinical Overview"
    />
  );
}

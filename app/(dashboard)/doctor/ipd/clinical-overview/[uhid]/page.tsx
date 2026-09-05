// app/(dashboard)/doctor/ipd/clinical-overview/[uhid]/page.tsx
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientDetailShell, type PatientTab, type PatientDetailData, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import { getAllWardPatients, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { wardRoundProfileDetail } from "@/lib/patient-detail/patient-profile-data";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import { OverviewMedicinesTab, OverviewLabsTab, OverviewVitalsTab, OverviewLogsTab } from "./_components/clinical-overview-tabs";

function toDetailData(p: WardRoundPatient): PatientDetailData {
  return wardRoundProfileDetail(p);
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

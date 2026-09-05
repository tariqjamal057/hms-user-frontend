// app/(dashboard)/nurseAdmin/ipd/all-ward-patients/[uhid]/record-vitals/page.tsx
"use client";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { WardRecordVitalsPage } from "@/components/nurse/ward-record-vitals-page";
import {
  getWardPatientByUhid,
  getWardVitalsForPatient,
  saveWardVital,
  WARD_PATIENTS_FULL,
} from "@/lib/nurse-admin/ipd/ward-detail-data";

export default function WardPatientRecordVitalsRoute() {
  const params = useParams();
  const uhid = params.uhid as string;
  const patient = getWardPatientByUhid(uhid);
  if (!patient) return notFound();

  return (
    <WardRecordVitalsPage
      patient={patient}
      patientList={WARD_PATIENTS_FULL.map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.ipdId} · ${p.ward} / ${p.bed}`,
      }))}
      patientsPath="/nurseAdmin/ipd/all-ward-patients"
      backPath={`/nurseAdmin/ipd/all-ward-patients/${patient.uhid}`}
      subtitle="IPD Patient · Record Vitals"
      getVitals={getWardVitalsForPatient}
      saveVital={(vital) => saveWardVital(patient.uhid, vital)}
    />
  );
}
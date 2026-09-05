// app/(dashboard)/nurse/ipd/patients/[uhid]/record-vitals/page.tsx
"use client";
import { useParams } from "next/navigation";
import { NurseRecordVitalsPage } from "@/components/nurse/nurse-record-vitals-page";
import {
  getNursePatientByUhid,
  getNursePatients,
  getVitalsForPatient,
  saveVitalForPatient,
} from "@/lib/nurse/ipd/nurse-ipd-data";

export default function NurseRecordVitalsRoute() {
  const params = useParams();
  const uhid = params.uhid as string;
  const patient = getNursePatientByUhid(uhid);

  return (
    <NurseRecordVitalsPage
      patient={patient}
      patientList={getNursePatients().map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.ipdId} · ${p.ward} / ${p.bed}`,
      }))}
      patientsPath="/nurse/ipd/patients"
      backPath={`/nurse/ipd/patients/${patient.uhid}`}
      subtitle="IPD Patient · Record Vitals"
      getVitals={getVitalsForPatient}
      saveVital={(vital) => saveVitalForPatient(patient.uhid, vital)}
    />
  );
}
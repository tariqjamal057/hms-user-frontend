// app/(dashboard)/nurseAdmin/icu/patients/[uhid]/record-vitals/page.tsx
"use client";
import { useParams } from "next/navigation";
import { NurseRecordVitalsPage } from "@/components/nurse/nurse-record-vitals-page";
import {
  getNursePatientByUhid,
  getNursePatients,
  getVitalsForPatient,
  saveVitalForPatient,
} from "@/lib/nurse/icu/nurse-icu-data";

export default function NurseAdminIcuRecordVitalsRoute() {
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
      patientsPath="/nurseAdmin/icu/patients"
      backPath={`/nurseAdmin/icu/patients/${patient.uhid}`}
      subtitle="ICU Patient · Record Vitals"
      getVitals={getVitalsForPatient}
      saveVital={(vital) => saveVitalForPatient(patient.uhid, vital)}
      recordPathPrefix="/nurseAdmin/icu/patients"
    />
  );
}
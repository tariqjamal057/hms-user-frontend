// components/nurse/ward-record-vitals-page.tsx
"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HeartPulse } from "lucide-react";
import {
  PatientDetailShell,
  type PatientDetailData,
  type PatientListItem,
  type PatientTab,
} from "@/components/patient-detail/patient-detail-shell";
import { RecordVitalsForm } from "@/components/forms/record-vitals-form";
import { PillButton } from "@/components/forms/pill-button";
import type { WardRoundPatient, VitalReading } from "@/types/doctor/ipd/ward-round-types";
import type { VitalRecordEntry } from "@/types/doctor/ipd/vitals-types";
import type { VitalsFormData } from "@/types/doctor/ipd/record-vitals-types";
import type { VitalRecordFull, WardPatientFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { CURRENT_NURSE } from "@/lib/nurse/ipd/nurse-ipd-data";

type Props = {
  patient: WardPatientFull;
  patientList: PatientListItem[];
  patientsPath: string;
  backPath: string;
  subtitle: string;
  getVitals: (uhid: string) => VitalRecordFull[];
  saveVital: (vital: VitalRecordFull) => void;
};

export function WardRecordVitalsPage({
  patient,
  patientList,
  patientsPath,
  backPath,
  subtitle,
  getVitals,
  saveVital,
}: Props) {
  const router = useRouter();
  const records = useMemo(() => getVitals(patient.uhid), [getVitals, patient.uhid]);
  const previousVitals = records[0] ? toVitalRecordEntry(records[0]) : undefined;
  const roundPatient = useMemo(() => toWardRoundPatient(patient, records[0]), [patient, records]);

  function handleSave(data: VitalsFormData) {
    saveVital({
      id: `V-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      dateTime: stamp(),
      bp: `${data.systolic}/${data.diastolic}`,
      pulse: Number(data.pulse),
      respRate: Number(data.respRate),
      spo2: Number(data.spo2),
      temp: Number(data.temp),
      pain: Number(data.painScore ?? 0),
      recordedBy: CURRENT_NURSE.name,
      recordedByRole: "Nurse",
    });
    toast.success("Vitals saved successfully");
    router.push(backPath);
  }

  const detail: PatientDetailData = {
    uhid: patient.uhid,
    name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    acuity: patient.acuity,
    moduleId: patient.ipdId,
    moduleIdLabel: "IPD ID",
    locationParts: [patient.ward, patient.room, patient.bed],
    fallbackInfoFields: [
      { label: "Department", value: patient.department },
      { label: "Attending Doctor", value: patient.admittingDoctor },
      { label: "Admitted On", value: patient.admissionDateTime },
      { label: "Diagnosis", value: patient.currentDiagnosis, highlight: true },
    ],
  };

  const tabs: PatientTab[] = [];

  return (
    <div className="bg-white">
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath={patientsPath}
        tabs={tabs}
        hideSingleTab
        showPatientSwitcher
        onSwitchPatient={(u) => router.replace(`/nurseAdmin/ipd/all-ward-patients/${u}/record-vitals`)}
        onBack={() => router.push(backPath)}
        subtitle={subtitle}
        headerActions={
          <PillButton variant="outline" size="sm" onClick={() => router.push(backPath)}>
            Back to Patient Detail
          </PillButton>
        }
        containerClassName="min-h-0"
      />

      <div className="mx-auto max-w-[1600px] border-t border-slate-200 p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <HeartPulse className="h-5 w-5 text-blue-600" />
              Record Patient Vitals
            </h2>
            <p className="text-xs text-slate-400">
              Recording as <span className="font-semibold">{CURRENT_NURSE.name}</span>. Review abnormal alerts
              and the previous vitals comparison before saving.
            </p>
          </div>
        </div>

        <RecordVitalsForm
          patient={roundPatient}
          previousVitals={previousVitals}
          hidePatientHeader
          onSaveVitals={handleSave}
        />
      </div>
    </div>
  );
}

function stamp() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toVitalRecordEntry(v: VitalRecordFull): VitalRecordEntry {
  return {
    dateTime: v.dateTime,
    bp: v.bp,
    systolic: Number(v.bp.split("/")[0] || 0),
    diastolic: Number(v.bp.split("/")[1] || 0),
    pulse: v.pulse,
    respRate: v.respRate,
    spo2: v.spo2,
    temp: v.temp,
    pain: v.pain,
    recordedBy: v.recordedBy,
  };
}

function toWardRoundPatient(p: WardPatientFull, latest?: VitalRecordFull): WardRoundPatient {
  const reading: VitalReading | undefined = latest
    ? {
        bp: latest.bp,
        pulse: String(latest.pulse),
        temp: String(latest.temp),
        rr: String(latest.respRate),
        spo2: String(latest.spo2),
        pain: String(latest.pain),
        recordedOn: latest.dateTime,
      }
    : undefined;
  return {
    uhid: p.uhid,
    patientName: p.patientName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    status: p.acuity,
    wardRoomBed: `${p.ward}/${p.room}/${p.bed}`,
    department: p.department,
    admittingDoctor: p.admittingDoctor,
    admissionDateTime: p.admissionDateTime,
    allergies: p.allergies,
    ipdId: p.ipdId,
    vitals:
      reading ??
      ({ bp: "—", pulse: "—", temp: "—", rr: "—", spo2: "—", pain: "—", recordedOn: "" } as VitalReading),
    labHighlights: [],
    currentDiagnosis: p.currentDiagnosis,
    diagnosisCode: p.diagnosisCode,
  };
}
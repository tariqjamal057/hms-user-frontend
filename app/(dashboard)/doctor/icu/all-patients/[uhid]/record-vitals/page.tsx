// app/(dashboard)/doctor/icu/patients/[uhid]/record-vitals/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { HeartPulse } from "lucide-react";
import {
  PatientDetailShell,
  type PatientTab,
  type PatientDetailData,
  type PatientListItem,
} from "@/components/patient-detail/patient-detail-shell";
import { RecordVitalsForm } from "@/components/forms/record-vitals-form";
import { PillButton } from "@/components/forms/pill-button";
import { getNursePatientByUhid, NURSE_ICU_PATIENTS, getVitalsForPatient } from "@/lib/nurse/icu/nurse-icu-data";
import { diagnosisCause } from "@/lib/patient-detail/patient-profile-data";
import type { NurseIpdPatient } from "@/types/nurse/ipd/nurse-ipd-types";

function toDetailData(p: NurseIpdPatient): PatientDetailData {
  return {
    uhid: p.uhid,
    name: p.patientName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies ?? [],
    acuity: p.acuity,
    moduleId: p.ipdId,
    moduleIdLabel: "ICU ID",
    locationParts: [p.ward, p.room, p.bed],
    causeOfProblem: diagnosisCause(p.currentDiagnosis, p.diagnosisCode),
    fallbackInfoFields: [
      { label: "Department", value: p.department },
      { label: "Attending Doctor", value: p.admittingDoctor },
      { label: "Admitted On", value: p.admissionDateTime },
    ],
  };
}

function adaptPatient(p: NurseIpdPatient) {
  return {
    uhid: p.uhid,
    patientName: p.patientName,
    age: p.age,
    gender: p.gender as "Male" | "Female" | "Other",
    bloodGroup: p.bloodGroup,
    status: (p.acuity ?? "Under Observation") as "Stable" | "Critical" | "Under Observation",
    wardRoomBed: [p.ward, p.room, p.bed].filter(Boolean).join(" / "),
    department: p.department,
    admittingDoctor: p.admittingDoctor,
    admissionDateTime: p.admissionDateTime,
    allergies: p.allergies ?? [],
    ipdId: p.ipdId,
    currentDiagnosis: p.currentDiagnosis,
    diagnosisCode: p.diagnosisCode,
    vitals: {
      bp: "—",
      pulse: 0,
      temp: 0,
      respRate: 0,
      spo2: 0,
      pain: 0,
      recordedOn: p.admissionDateTime,
    },
    labHighlights: [],
  };
}

function RecordVitalsPageInner() {
  const router = useRouter();
  const params = useParams();
  const uhid = params.uhid as string;

  const all = useMemo(() => NURSE_ICU_PATIENTS, []);
  const initial = getNursePatientByUhid(uhid);
  const [uhidState, setUhidState] = useState<string>(initial.uhid);
  const patient = getNursePatientByUhid(uhidState);
  const records = useMemo(
    () => (uhidState ? getVitalsForPatient(uhidState) : []),
    [uhidState],
  );
  const previousVitals = records[0];

  const detail: PatientDetailData = toDetailData(patient);
  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.uhid} · ${p.ipdId} · ${p.ward} / ${p.room} / ${p.bed}`,
      })),
    [all],
  );

  const tabs: PatientTab[] = [];

  return (
    <div className="bg-slate-50/50">
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath="/doctor/icu/all-patients"
        tabs={tabs}
        hideSingleTab
        showPatientSwitcher
        onSwitchPatient={(u) => setUhidState(u)}
        onBack={() => router.push(`/doctor/icu/all-patients/${uhidState}`)}
        subtitle="ICU Patient · Record Vitals"
        headerActions={
          <PillButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/doctor/icu/all-patients/${uhidState}`)}
          >
            Back to Patient
          </PillButton>
        }
        containerClassName="min-h-0"
      />

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <HeartPulse className="h-5 w-5 text-red-500" />
              Record Patient Vitals
            </h2>
            <p className="text-xs text-slate-400">
              Enter the patient&apos;s vital signs. Review abnormal alerts and
              the previous vitals comparison on the right before saving.
            </p>
          </div>
        </div>

        <RecordVitalsForm
          patient={adaptPatient(patient) as never}
          previousVitals={previousVitals as never}
          hidePatientHeader
          onSaveVitals={(data) => {
            console.log("Save ICU vitals:", { uhid: uhidState, ...data });
            toast.success("Vitals saved successfully");
            router.push(`/doctor/icu/all-patients/${uhidState}`);
          }}
          onSaveDraft={(data) => {
            console.log("Save vitals as draft:", { uhid: uhidState, ...data });
            toast.success("Draft saved");
          }}
          onSaveAndContinue={(data) => {
            console.log("Save vitals & continue:", { uhid: uhidState, ...data });
            toast.success("Vitals saved");
            router.push(`/doctor/icu/all-patients/${uhidState}`);
          }}
        />
      </div>
    </div>
  );
}

export default function IcuRecordVitalsPage() {
  return (
    <Suspense fallback={null}>
      <RecordVitalsPageInner />
    </Suspense>
  );
}

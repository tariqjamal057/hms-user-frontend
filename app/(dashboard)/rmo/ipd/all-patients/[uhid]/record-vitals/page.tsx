// app/(dashboard)/rmo/ipd/all-patients/[uhid]/record-vitals/page.tsx
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
import { RMO_PATIENTS, getRmoPatientByUhid } from "@/lib/rmo/ipd/rmo-data";
import type { RmoPatient } from "@/types/rmo/ipd/rmo-types";
import type { VitalRecordEntry } from "@/types/doctor/ipd/vitals-types";

function mapStatus(status: RmoPatient["status"]): "Stable" | "Critical" | "Under Observation" {
  if (status === "Critical") return "Critical";
  if (status === "Stable") return "Stable";
  return "Under Observation";
}

function adaptPatient(p: RmoPatient) {
  const primary = p.diagnoses[0];
  return {
    uhid: p.uhid,
    patientName: p.patientName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    status: mapStatus(p.status),
    wardRoomBed: [p.ward, p.room, p.bed].filter(Boolean).join(" / "),
    department: p.department,
    admittingDoctor: p.attendingDoctor,
    admissionDateTime: p.admissionDateTime,
    allergies: p.allergies,
    ipdId: p.ipdId,
    currentDiagnosis: primary?.name ?? "—",
    diagnosisCode: primary?.code ?? "—",
    vitals: {
      bp: "—",
      pulse: "0",
      temp: "0",
      rr: "0",
      spo2: "0",
      pain: "0",
      recordedOn: p.admissionDateTime,
    },
    labHighlights: [],
  };
}

function toPreviousVitals(p: RmoPatient): VitalRecordEntry | undefined {
  const v = p.vitals[0];
  if (!v) return undefined;
  const [systolic, diastolic] = v.bp.split("/").map((n) => Number(n.trim()));
  return {
    dateTime: v.dateTime,
    bp: v.bp,
    systolic: systolic || 0,
    diastolic: diastolic || 0,
    pulse: v.pulse,
    respRate: v.respRate,
    spo2: v.spo2,
    temp: v.temp,
    pain: v.pain,
    recordedBy: v.recordedBy,
  };
}

function toDetailData(p: RmoPatient): PatientDetailData {
  return {
    uhid: p.uhid,
    name: p.patientName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies,
    moduleId: p.ipdId,
    moduleIdLabel: "IPD ID",
    locationParts: [p.ward, p.room, p.bed],
    fallbackInfoFields: [
      { label: "Doctor", value: p.attendingDoctor },
      { label: "Department", value: p.department },
      { label: "Admitted On", value: p.admissionDateTime },
    ],
  };
}

function RecordVitalsPageInner() {
  const router = useRouter();
  const params = useParams();
  const uhid = params.uhid as string;

  const all = useMemo(() => RMO_PATIENTS, []);
  const [uhidState, setUhidState] = useState<string>(uhid);
  const patient = getRmoPatientByUhid(uhidState);

  const tabs: PatientTab[] = [];

  if (!patient) {
    return (
      <div className="p-10 text-center text-sm text-slate-400">
        Patient not found for UHID {uhidState}
      </div>
    );
  }

  const previousVitals = useMemo(() => toPreviousVitals(patient), [patient]);
  const detail: PatientDetailData = toDetailData(patient);
  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.ipdId} · ${p.uhid} · ${p.ward} / ${p.room} / ${p.bed}`,
      })),
    [all],
  );

  return (
    <div className="bg-slate-50/50">
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath="/rmo/ipd/all-patients"
        tabs={tabs}
        hideSingleTab
        showPatientSwitcher
        onSwitchPatient={(u) => router.push(`/rmo/ipd/all-patients/${u}/record-vitals`)}
        onBack={() => router.push(`/rmo/ipd/all-patients/${uhidState}`)}
        subtitle="IPD Patient · Record Vitals"
        headerActions={
          <PillButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/rmo/ipd/all-patients/${uhidState}`)}
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
          patient={adaptPatient(patient)}
          previousVitals={previousVitals}
          hidePatientHeader
          onSaveVitals={(data) => {
            console.log("Save RMO IPD vitals:", { uhid: uhidState, ...data });
            toast.success("Vitals saved successfully");
            router.push(`/rmo/ipd/all-patients/${uhidState}`);
          }}
          onSaveDraft={(data) => {
            console.log("Save vitals as draft:", { uhid: uhidState, ...data });
            toast.success("Draft saved");
          }}
          onSaveAndContinue={(data) => {
            console.log("Save vitals & continue:", { uhid: uhidState, ...data });
            toast.success("Vitals saved");
            router.push(`/rmo/ipd/all-patients/${uhidState}`);
          }}
        />
      </div>
    </div>
  );
}

export default function RmoIpdRecordVitalsPage() {
  return (
    <Suspense fallback={null}>
      <RecordVitalsPageInner />
    </Suspense>
  );
}
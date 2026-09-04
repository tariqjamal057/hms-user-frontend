// app/(dashboard)/doctor/emergency/all-patients/[uhid]/record-vitals/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";
import {
  PatientDetailShell,
  type PatientTab,
  type PatientDetailData,
  type PatientListItem,
} from "@/components/patient-detail/patient-detail-shell";
import { RecordVitalsForm } from "@/components/forms/record-vitals-form";
import { PillButton } from "@/components/forms/pill-button";
import { EMERGENCY_PATIENTS } from "@/lib/emergency/emergency-data";
import { getVitalsForPatient, type VitalRecordEntry } from "@/lib/doctor/ipd/vitals-data";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import type { EmergencyPatient } from "@/types/emergency/emergency-types";

function toRmo(p: EmergencyPatient): RmoEmergencyPatient {
  return { ...p, criticalNotifications: [], deathRecord: undefined, department: "Critical Care" };
}

function toDetailData(p: EmergencyPatient): PatientDetailData {
  return {
    uhid: p.uhid,
    name: p.patientName || "Unidentified Patient",
    age: p.age ?? 0,
    gender: p.gender,
    bloodGroup: "—",
    allergies: p.allergies ?? [],
    moduleId: p.emergencyNumber,
    moduleIdLabel: "Emergency No.",
    locationParts: [p.bedOrBay],
    metaLine: p.incidentType,
    fallbackInfoFields: [
      { label: "Incident", value: p.incidentType },
      { label: "Arrival", value: p.arrivalMode },
      { label: "Attending Doctor", value: p.attendingDoctor || "Unassigned" },
    ],
  };
}

function RecordVitalsPageInner() {
  const router = useRouter();
  const params = useParams();
  const uhid = params.uhid as string;

  const all = useMemo(() => EMERGENCY_PATIENTS.map(toRmo), []);
  const initial = useMemo(
    () => all.find((p) => p.uhid === uhid) ?? null,
    [all, uhid],
  );
  const [version, setVersion] = useState<RmoEmergencyPatient | null>(initial);
  const active = version ?? initial;
  const previousVitals = useMemo(
    () => (active ? getVitalsForPatient(active.uhid)[0] : undefined),
    [active],
  );

  const detail: PatientDetailData | undefined = active
    ? toDetailData(active)
    : undefined;

  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName || "Unidentified",
        subtitle: `${p.uhid} · ${p.emergencyNumber} · ${p.bedOrBay}`,
      })),
    [all],
  );

  const tabs: PatientTab[] = [];

  if (!active || !detail) {
    return (
      <div className="p-10 text-center text-sm text-slate-400">
        Patient not found for UHID {uhid}
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50">
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath="/doctor/emergency/all-patients"
        tabs={tabs}
        hideSingleTab
        showPatientSwitcher
        onSwitchPatient={(u) =>
          router.push(`/doctor/emergency/all-patients/${u}/record-vitals`)
        }
        onBack={() =>
          router.push(`/doctor/emergency/all-patients/${active.uhid}`)
        }
        subtitle={`Emergency Case · Bed ${active.bedOrBay}`}
        headerActions={
          <PillButton
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/doctor/emergency/all-patients/${active.uhid}`)
            }
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
          patient={adaptPatient(active)}
          previousVitals={previousVitals as VitalRecordEntry | undefined}
          hidePatientHeader
          onSaveVitals={(data) => {
            console.log("Save emergency vitals:", { uhid: active.uhid, ...data });
            toast.success("Vitals saved successfully");
            router.push(`/doctor/emergency/all-patients/${active.uhid}`);
          }}
          onSaveDraft={(data) => {
            console.log("Save vitals as draft:", { uhid: active.uhid, ...data });
            toast.success("Draft saved");
          }}
          onSaveAndContinue={(data) => {
            console.log("Save vitals & continue:", { uhid: active.uhid, ...data });
            toast.success("Vitals saved");
            router.push(`/doctor/emergency/all-patients/${active.uhid}`);
          }}
        />
      </div>
    </div>
  );
}

export default function EmergencyRecordVitalsPage() {
  return (
    <Suspense fallback={null}>
      <RecordVitalsPageInner />
    </Suspense>
  );
}

// Adapts an emergency patient to the WardRoundPatient shape required by
// RecordVitalsForm. The form only reads basic identity + vitals fields.
function adaptPatient(p: RmoEmergencyPatient) {
  return {
    uhid: p.uhid,
    patientName: p.patientName || "Unidentified",
    age: p.age ?? 0,
    gender: p.gender,
    bloodGroup: "—",
    status: p.status as never,
    ipdId: p.emergencyNumber,
    wardRoomBed: p.bedOrBay,
    department: p.department,
    admittingDoctor: p.attendingDoctor || "",
    admissionDateTime: p.registeredAt,
    currentDiagnosis: p.incidentType,
    diagnosisCode: "—",
    daysAdmitted: 0,
    expectedDischarge: "",
    allergies: p.allergies ?? [],
    contactNumber: p.mobileNumber,
    guardianName: p.attendantName,
    labHighlights: [],
    medicines: [],
    vitals: {
      bp: "—",
      pulse: 0,
      temp: 0,
      respRate: 0,
      spo2: 0,
      pain: 0,
      recordedOn: p.registeredAt,
    },
  };
}

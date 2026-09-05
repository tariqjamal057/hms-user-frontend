// app/(dashboard)/doctor/ipd/patient-detail/record-vitals/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getAllWardPatients, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { wardRoundProfileDetail } from "@/lib/patient-detail/patient-profile-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";

function toDetailData(p: ReturnType<typeof getPatientByUhid>): PatientDetailData {
  if (!p) {
    return {
      uhid: "",
      name: "",
      age: 0,
      gender: "",
      bloodGroup: "",
      allergies: [],
      moduleId: "",
      moduleIdLabel: "IPD ID",
    };
  }
  return wardRoundProfileDetail(p);
}

function RecordVitalsPageInner() {
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
  const records = useMemo(
    () => (uhid ? getVitalsForPatient(uhid) : []),
    [uhid],
  );
  const previousVitals = records[0];

  const detail: PatientDetailData | undefined = patient
    ? toDetailData(patient)
    : undefined;

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
    return (
      <div className="p-10 text-center text-sm text-slate-400">
        No IPD patients available
      </div>
    );
  }

  // Empty tab list — the shell still renders the unified patient header,
  // but no tab bar or tab content is shown below it. The form is rendered
  // outside the shell wrapper so it sits flush under the header.
  const tabs: PatientTab[] = [];

  return (
    <div className="bg-white">
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath="/doctor/ipd/patients"
        tabs={tabs}
        hideSingleTab
        showPatientSwitcher
        onSwitchPatient={(u) => setUhid(u)}
        onBack={() =>
          router.push(`/doctor/ipd/patient-detail?uhid=${uhid}`)
        }
        subtitle="IPD Patient · Record Vitals"
        headerActions={
          <PillButton
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/doctor/ipd/patient-detail?uhid=${uhid}`)
            }
          >
            Back to Patient Detail
          </PillButton>
        }
        containerClassName="min-h-0"
      />

      <div className="mx-auto max-w-[1600px] p-4 border rounded-lg mt-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <HeartPulse className="h-5 w-5 text-blue-600" />
              Record Patient Vitals
            </h2>
            <p className="text-xs text-slate-400">
              Enter the patient&apos;s vital signs. Review abnormal alerts and
              the previous vitals comparison on the right before saving.
            </p>
          </div>
        </div>

        <RecordVitalsForm
          patient={patient}
          previousVitals={previousVitals}
          hidePatientHeader
          onSaveVitals={(data) => {
            console.log("Save vitals:", { uhid, ...data });
            toast.success("Vitals saved successfully");
            router.push(`/doctor/ipd/patient-detail?uhid=${uhid}`);
          }}
          onSaveDraft={(data) => {
            console.log("Save vitals as draft:", { uhid, ...data });
            toast.success("Draft saved");
          }}
          onSaveAndContinue={(data) => {
            console.log("Save vitals & continue to diagnosis:", { uhid, ...data });
            toast.success("Vitals saved. Continuing to Diagnosis Update");
            router.push(
              `/doctor/ipd/patient-detail?uhid=${uhid}&tab=diagnosis-update`,
            );
          }}
        />
      </div>
    </div>
  );
}

export default function RecordVitalsPage() {
  return (
    <Suspense fallback={null}>
      <RecordVitalsPageInner />
    </Suspense>
  );
}

// app/(dashboard)/nurseAdmin/ipd/all-ward-patients/[uhid]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  PatientDetailShell,
  type PatientDetailData,
  type PatientListItem,
  type PatientTab,
} from "@/components/patient-detail/patient-detail-shell";
import {
  WARD_PATIENTS_FULL,
  getWardPatientByUhid,
} from "@/lib/nurse-admin/ipd/ward-detail-data";
import { SectionPatientInfo } from "../_components/drawer/section-patient-info";
import { SectionVitals } from "../_components/drawer/section-vitals";
import { SectionMedicines } from "../_components/drawer/section-medicines";
import { SectionProgressNotes } from "../_components/drawer/section-progress-notes";
import { SectionFluidBalance } from "../_components/drawer/section-fluid-balance";
import { SectionTreatmentPlan } from "../_components/drawer/section-treatment-plan";
import { SectionShiftHandover } from "../_components/drawer/section-shift-handover";
import { SectionAssignedNurses } from "../_components/drawer/section-assigned-nurses";
import { SectionDischarge } from "../_components/drawer/section-discharge";

export default function WardPatientDetailPage() {
  const params = useParams<{ uhid: string }>();
  const sourcePatient = getWardPatientByUhid(params.uhid);

  if (!sourcePatient) return notFound();

  const fallbackInfoFields: { label: string; value: string; highlight?: boolean }[] = [];
  if (sourcePatient.admittingDoctor) fallbackInfoFields.push({ label: "Doctor", value: sourcePatient.admittingDoctor });
  if (sourcePatient.department) fallbackInfoFields.push({ label: "Department", value: sourcePatient.department });
  if (sourcePatient.currentDiagnosis) fallbackInfoFields.push({ label: "Diagnosis", value: sourcePatient.currentDiagnosis, highlight: true, });
  if (sourcePatient.admissionDateTime) fallbackInfoFields.push({ label: "Admitted On", value: sourcePatient.admissionDateTime });
  if (sourcePatient.admittedFrom) fallbackInfoFields.push({ label: "Admitted From", value: sourcePatient.admittedFrom });

  const detail: PatientDetailData = {
    uhid: sourcePatient.uhid,
    name: sourcePatient.patientName,
    age: sourcePatient.age,
    gender: sourcePatient.gender,
    bloodGroup: sourcePatient.bloodGroup,
    allergies: sourcePatient.allergies,
    acuity: sourcePatient.acuity,
    moduleId: sourcePatient.ipdId,
    moduleIdLabel: "IPD ID",
    locationParts: [sourcePatient.ward, sourcePatient.room, sourcePatient.bed],
    contact: sourcePatient.contactNumber,
    fallbackInfoFields,
  };

  const patientList: PatientListItem[] = WARD_PATIENTS_FULL.map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.ipdId} · ${p.ward} · ${p.bed}`,
  }));

  const tabs: PatientTab[] = [
    {
      value: "info",
      label: "Patient Info",
      content: (
        <SectionPatientInfo
          patient={sourcePatient}
          onChangeStatus={() => {
            /* status change disabled */
          }}
        />
      ),
    },
    {
      value: "vitals",
      label: "Vitals",
      content: <SectionVitals vitals={sourcePatient.vitals} />,
    },
    {
      value: "medicines",
      label: "Medicines",
      content: <SectionMedicines medicines={sourcePatient.medicines} />,
    },
    {
      value: "notes",
      label: "Progress Notes",
      content: <SectionProgressNotes notes={sourcePatient.progressNotes} />,
    },
    {
      value: "fluid",
      label: "Fluid Balance",
      content: <SectionFluidBalance entries={sourcePatient.fluidBalance} />,
    },
    {
      value: "treatment",
      label: "Treatment Plan",
      content: <SectionTreatmentPlan plans={sourcePatient.treatmentPlans} />,
    },
    {
      value: "handover",
      label: "Shift Handover",
      content: <SectionShiftHandover handovers={sourcePatient.handovers} />,
    },
    {
      value: "nurses",
      label: "Assigned Nurses",
      content: (
        <SectionAssignedNurses
          ward={sourcePatient.ward}
          assignments={sourcePatient.assignments}
          onUpdateAssignments={() => {
            /* assignment change disabled */
          }}
        />
      ),
    },
    {
      value: "discharge",
      label: "Discharge",
      content: (
        <SectionDischarge
          patientName={sourcePatient.patientName}
          bed={sourcePatient.bed}
          ward={sourcePatient.ward}
          discharge={sourcePatient.discharge}
          alreadySent={sourcePatient.status === "Discharged" && Boolean(sourcePatient.discharge?.sentToBillingAt)}
          onSendToBilling={() => {
            /* discharge disabled */
          }}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        <PatientDetailShell
          patient={detail}
          patientList={patientList}
          patientsPath="/nurseAdmin/ipd/all-ward-patients"
          status={sourcePatient.status}
          tabs={tabs}
          defaultTab="info"
        />
      </div>
    </div>
  );
}
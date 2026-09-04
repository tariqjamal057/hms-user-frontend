// app/(dashboard)/doctor/emergency/all-patients/[uhid]/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientDetailShell, type PatientTab, type PatientDetailData, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import type { EmergencyPatient, TreatmentPlanItem } from "@/types/emergency/emergency-types";
import { EMERGENCY_PATIENTS } from "@/lib/emergency/emergency-data";
import { RmoEntryDrawer, type EntryKind } from "@/app/(dashboard)/rmo/emergency/all-patients/_components/rmo-entry-drawers";
import { EmergencyStatusWorkflow } from "@/app/(dashboard)/rmo/emergency/all-patients/_components/emergency-status-workflow";
import { TreatmentPlanForm } from "@/app/(dashboard)/rmo/emergency/all-patients/_components/section-treatment-plan-form";
import { SectionRegistration } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-registration";
import { SectionVitals } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-vitals";
import { SectionDiagnosis } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-diagnosis";
import { SectionMedicines } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-medicines";
import { SectionLabReports } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-lab-reports";
import { SectionProgressNotes } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-progress-notes";
import { SectionTreatmentPlan } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-treatment-plan";
import { SectionAssignedNurses } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-assigned-nurses";
import { SectionHandoverPolice } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-handover-police";

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
      { label: "Current Condition", value: p.currentCondition },
    ],
  };
}

function SectionAction({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3">
      <p className="text-sm font-bold text-blue-900">{title}</p>
      <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={onClick}>
        <FilePlus2 className="h-4 w-4" />
        Add New
      </Button>
    </div>
  );
}

export default function DoctorEmergencyPatientDetailPage() {
  const params = useParams();
  const uhid = params.uhid as string;

  const all = useMemo(() => EMERGENCY_PATIENTS.map(toRmo), []);
  const patient = useMemo(() => all.find((p) => p.uhid === uhid) ?? null, [all, uhid]);
  const [version, setVersion] = useState<RmoEmergencyPatient | null>(patient);
  const active = version ?? patient;

  const [entry, setEntry] = useState<EntryKind>(null);
  const [addingTreatment, setAddingTreatment] = useState(false);

  const detail: PatientDetailData | undefined = active ? toDetailData(active) : undefined;

  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName || "Unidentified",
        subtitle: `${p.uhid} · ${p.emergencyNumber} · ${p.bedOrBay}`,
      })),
    [all],
  );

  function receive(payload: unknown) {
    if (!active) return;
    setVersion(appendPayload(active, entry, payload));
    setEntry(null);
  }

  function addTreatmentPlan(plan: Omit<TreatmentPlanItem, "id" | "orderedOn" | "followStatus">) {
    if (!active) return;
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const newPlan: TreatmentPlanItem = { ...plan, id: `T-${Date.now()}`, orderedOn: stamp, followStatus: "Following" };
    setVersion({ ...active, treatmentPlans: [newPlan, ...active.treatmentPlans] });
    setAddingTreatment(false);
  }

  if (!active || !detail) {
    return <div className="p-10 text-center text-sm text-slate-400">Patient not found for UHID {uhid}</div>;
  }

  const tabs: PatientTab[] = [
    { value: "registration", label: "Registration", content: <SectionRegistration patient={active} /> },
    {
      value: "vitals",
      label: "Vitals",
      content: (
        <>
          <SectionAction title="Vitals History" onClick={() => setEntry("vital")} />
          <SectionVitals vitals={active.vitals} />
        </>
      ),
    },
    {
      value: "diagnosis",
      label: "Diagnosis",
      content: (
        <>
          <SectionAction title="Diagnosis" onClick={() => setEntry("diagnosis")} />
          <SectionDiagnosis diagnoses={active.diagnoses} />
        </>
      ),
    },
    {
      value: "medicines",
      label: "Medicines",
      content: (
        <>
          <SectionAction title="Medicine Orders" onClick={() => setEntry("medicine")} />
          <SectionMedicines doses={active.doses} />
        </>
      ),
    },
    {
      value: "labs",
      label: "Labs",
      content: (
        <>
          <SectionAction title="Lab Orders" onClick={() => setEntry("lab")} />
          <SectionLabReports reports={active.labReports} />
        </>
      ),
    },
    {
      value: "notes",
      label: "Progress Notes",
      content: (
        <>
          <SectionAction title="Progress Notes" onClick={() => setEntry("note")} />
          <SectionProgressNotes notes={active.progressNotes} />
        </>
      ),
    },
    {
      value: "treatment",
      label: "Treatment",
      content: (
        <>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3">
            <p className="text-sm font-bold text-blue-900">Treatment Plans</p>
            <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => setAddingTreatment(true)}>
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
          <SectionTreatmentPlan plans={active.treatmentPlans} />
        </>
      ),
    },
    { value: "nurses", label: "Nurses", content: <SectionAssignedNurses assignments={active.assignedNurses} /> },
    { value: "handover", label: "Handover", content: <SectionHandoverPolice handovers={active.handovers} police={active.police} onInformPolice={() => undefined} /> },
    { value: "status", label: "Status Log", content: <EmergencyStatusWorkflow patient={active} onUpdate={(updated) => setVersion(updated)} /> },
  ];

  return (
    <>
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath="/doctor/emergency/all-patients"
        tabs={tabs}
        subtitle="Emergency Case"
      />

      <RmoEntryDrawer kind={entry} patient={active} onClose={() => setEntry(null)} onSubmit={receive} />
      {addingTreatment && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setAddingTreatment(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <TreatmentPlanForm onSubmit={addTreatmentPlan} onClose={() => setAddingTreatment(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function appendPayload(patient: RmoEmergencyPatient, kind: EntryKind, payload: unknown): RmoEmergencyPatient {
  const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const date = new Date().toISOString().slice(0, 10);
  if (kind === "vital")
    return { ...patient, vitals: [{ ...(payload as object), id: `V-${Date.now()}`, date, dateTime: stamp, recordedBy: "Doctor", recordedByRole: "Doctor" }, ...patient.vitals] as RmoEmergencyPatient["vitals"] };
  if (kind === "medicine")
    return { ...patient, doses: [...(payload as Array<Record<string, unknown>>).map((x, i) => ({ ...x, id: `M-${Date.now()}-${i}`, date, status: "Pending", scheduledTime: "As ordered" })), ...patient.doses] as RmoEmergencyPatient["doses"] };
  if (kind === "lab")
    return { ...patient, labReports: [...(payload as Array<Record<string, unknown>>).map((x, i) => ({ ...x, id: `L-${Date.now()}-${i}`, date, reportedAt: "Ordered — awaiting lab", orderedBy: "Doctor" })), ...patient.labReports] as RmoEmergencyPatient["labReports"] };
  if (kind === "diagnosis")
    return { ...patient, diagnoses: [{ ...(payload as object), id: `DG-${Date.now()}`, addedAt: stamp, addedBy: "Doctor" }, ...patient.diagnoses] as RmoEmergencyPatient["diagnoses"] };
  if (kind === "note") {
    const x = payload as Record<string, string>;
    return { ...patient, progressNotes: [{ ...x, id: `PN-${Date.now()}`, date, createdAt: stamp, author: "Doctor", role: "Doctor", noteText: x.noteText || [x.subjective, x.objective, x.assessment, x.plan].filter(Boolean).join(" ") }, ...patient.progressNotes] as RmoEmergencyPatient["progressNotes"] };
  }
  return patient;
}

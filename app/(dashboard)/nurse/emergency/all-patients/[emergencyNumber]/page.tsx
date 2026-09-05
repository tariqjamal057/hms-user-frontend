// app/(dashboard)/nurse/emergency/all-patients/[emergencyNumber]/page.tsx
"use client";
import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";

import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import type { ProgressNote, VitalRecord } from "@/types/emergency/emergency-types";
import { EMERGENCY_PATIENTS } from "@/lib/emergency/emergency-data";
import { SectionRegistration } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-registration";
import { SectionVitals } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-vitals";
import { SectionDiagnosis } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-diagnosis";
import { SectionMedicines } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-medicines";
import { SectionLabReports } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-lab-reports";
import { SectionProgressNotes } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-progress-notes";
import { SectionAssignedNurses } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-assigned-nurses";
import { SectionHandoverPolice } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-handover-police";
import { NurseMedicineAdministerDrawer } from "../_components/nurse-medicine-administer-drawer";
import { NurseTreatmentFollowDrawer } from "../_components/nurse-treatment-follow-drawer";
import { NurseVitalForm } from "../_components/nurse-vital-form";
import { NurseProgressNoteForm } from "../_components/nurse-progress-note-form";

export default function NurseEmergencyPatientDetailPage() {
  const params = useParams<{ emergencyNumber: string }>();
  const [patients, setPatients] = useState<RmoEmergencyPatient[]>(
    EMERGENCY_PATIENTS.map((p) => ({ ...p, criticalNotifications: [] })),
  );
  const patient = useMemo(
    () => patients.find((p) => p.emergencyNumber === params.emergencyNumber) ?? null,
    [patients, params.emergencyNumber],
  );

  const [administeringMed, setAdministeringMed] = useState<{ medicineId: string; medicineName: string; instructions: string } | null>(null);
  const [updatingTreatment, setUpdatingTreatment] = useState<{ planId: string; title: string; currentStatus: "Following" | "Not Following" } | null>(null);
  const [addingVital, setAddingVital] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const patientList: PatientListItem[] = useMemo(
    () =>
      patients.map((p) => ({
        uhid: p.uhid,
        name: p.patientName || "Unidentified",
        subtitle: `${p.emergencyNumber} · ${p.bedOrBay}`,
      })),
    [patients],
  );

  if (!patient) return notFound();
  const active = patient;

  function updatePatient(updated: RmoEmergencyPatient) {
    setPatients((rows) => rows.map((p) => (p.emergencyNumber === updated.emergencyNumber ? updated : p)));
    toast.success("Patient updated.");
  }

  function handleMedicineAdminister(medicineId: string, givenAt: string) {
    const updatedDoses = active.doses.map((d) =>
      d.id === medicineId ? { ...d, status: "Given" as const, givenBy: "Nurse", givenAt } : d,
    );
    updatePatient({ ...active, doses: updatedDoses });
    toast.success("Medicine administered.");
    setAdministeringMed(null);
  }

  function handleTreatmentFollow(planId: string, followStatus: "Following" | "Not Following") {
    const updatedPlans = active.treatmentPlans.map((t) =>
      t.id === planId ? { ...t, followStatus } : t,
    );
    updatePatient({ ...active, treatmentPlans: updatedPlans });
    setUpdatingTreatment(null);
  }

  function handleAddVital(vital: Omit<VitalRecord, "id" | "date" | "dateTime" | "recordedBy" | "recordedByRole">) {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const date = new Date().toISOString().slice(0, 10);
    const newVital: VitalRecord = {
      ...vital,
      id: `V-${Date.now()}`,
      date,
      dateTime: stamp,
      recordedBy: "Nurse",
      recordedByRole: "Nurse",
    };
    updatePatient({ ...active, vitals: [newVital, ...active.vitals] });
    toast.success("Vitals recorded.");
    setAddingVital(false);
  }

  function handleAddNote(note: Omit<ProgressNote, "id" | "date" | "createdAt" | "author" | "role">) {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const date = new Date().toISOString().slice(0, 10);
    const newNote: ProgressNote = {
      ...note,
      id: `PN-${Date.now()}`,
      date,
      createdAt: stamp,
      author: "Nurse",
      role: "Nurse",
    };
    updatePatient({ ...active, progressNotes: [newNote, ...active.progressNotes] });
    toast.success("Progress note added.");
    setAddingNote(false);
  }

  const acuity =
    active.status === "Critical"
      ? "Critical"
      : active.status === "Under Observation"
        ? "Under Observation"
        : undefined;

  const patientData: PatientDetailData = {
    uhid: active.uhid,
    name: active.patientName || "Unidentified",
    age: active.age ?? 0,
    gender: active.gender,
    bloodGroup: "Unspecified",
    allergies: active.allergies,
    acuity,
    moduleId: active.emergencyNumber,
    moduleIdLabel: "Emergency No.",
    locationParts: [active.bedOrBay],
    causeOfProblem: active.currentCondition,
    metaLine: active.incidentType,
    fallbackInfoFields: [
      { label: "Attending Doctor", value: active.attendingDoctor },
      { label: "Assigned RMO", value: active.assignedRmo },
      { label: "Assigned Nurse", value: active.assignedNurse },
      { label: "Registered At", value: active.registeredAt },
    ],
  };

  const tabs: PatientTab[] = [
    { value: "registration", label: "Registration", content: <SectionRegistration patient={active} /> },
    {
      value: "vitals",
      label: "Vitals",
      content: (
        <>
          <SectionAction title="Vitals History" onClick={() => setAddingVital(true)} />
          <SectionVitals vitals={active.vitals} />
        </>
      ),
    },
    { value: "diagnosis", label: "Diagnosis", content: <SectionDiagnosis diagnoses={active.diagnoses} /> },
    {
      value: "medicines",
      label: "Medicines",
      content: (
        <div>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
            <p className="text-sm font-bold text-emerald-900">Medicine Administration</p>
            <p className="text-xs text-slate-500">Update status for each dose as you administer</p>
          </div>
          <SectionMedicines
            doses={active.doses}
            onUpdateStatus={(medicineId, medicineName, instructions) =>
              setAdministeringMed({ medicineId, medicineName, instructions })
            }
          />
        </div>
      ),
    },
    { value: "labs", label: "Lab Reports", content: <SectionLabReports reports={active.labReports} /> },
    {
      value: "notes",
      label: "Progress Notes",
      content: (
        <>
          <SectionAction title="Progress Notes" onClick={() => setAddingNote(true)} />
          <SectionProgressNotes notes={active.progressNotes} />
        </>
      ),
    },
    {
      value: "treatment",
      label: "Treatment",
      content: (
        <div>
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/50 p-3">
            <p className="text-sm font-bold text-blue-900">Treatment Plans (Doctor/RMO Orders)</p>
            <p className="text-xs text-slate-500">Mark if you are following each plan</p>
          </div>
          <div className="space-y-3">
            {active.treatmentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl border p-4 ${
                  plan.followStatus === "Following"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-amber-200 bg-amber-50/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800">{plan.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Ordered by {plan.orderedBy} ({plan.orderedByRole}) on {plan.orderedOn}
                    </p>
                  </div>
                  <button
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      plan.followStatus === "Following"
                        ? "border-emerald-300 text-emerald-700"
                        : "border-emerald-600 bg-emerald-600 text-white"
                    }`}
                    onClick={() => setUpdatingTreatment({ planId: plan.id, title: plan.title, currentStatus: plan.followStatus })}
                  >
                    {plan.followStatus === "Following" ? "Following" : "Mark Following"}
                  </button>
                </div>
              </div>
            ))}
            {active.treatmentPlans.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                No treatment plans ordered by doctor/RMO yet.
              </div>
            )}
          </div>
        </div>
      ),
    },
    { value: "nurses", label: "Nurses", content: <SectionAssignedNurses assignments={active.assignedNurses} /> },
    { value: "handover", label: "Handover & Police", content: <SectionHandoverPolice handovers={active.handovers} police={active.police} onInformPolice={() => undefined} /> },
  ];

  return (
    <>
      <PatientDetailShell
        patient={patientData}
        patientList={patientList}
        patientsPath="/nurse/emergency/all-patients"
        tabs={tabs}
        defaultTab="registration"
      />

      {administeringMed && (
        <NurseMedicineAdministerDrawer
          medicineId={administeringMed.medicineId}
          medicineName={administeringMed.medicineName}
          instructions={administeringMed.instructions}
          onClose={() => setAdministeringMed(null)}
          onAdminister={handleMedicineAdminister}
        />
      )}

      {updatingTreatment && (
        <NurseTreatmentFollowDrawer
          planId={updatingTreatment.planId}
          title={updatingTreatment.title}
          currentStatus={updatingTreatment.currentStatus}
          onClose={() => setUpdatingTreatment(null)}
          onUpdate={handleTreatmentFollow}
        />
      )}

      {addingVital && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setAddingVital(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl">
            <NurseVitalForm onSubmit={handleAddVital} onClose={() => setAddingVital(false)} />
          </div>
        </div>
      )}

      {addingNote && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setAddingNote(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl">
            <NurseProgressNoteForm onSubmit={handleAddNote} onClose={() => setAddingNote(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function SectionAction({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
      <p className="text-sm font-bold text-emerald-900">{title}</p>
      <button
        className="h-8 shrink-0 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
        onClick={onClick}
      >
        Add New
      </button>
    </div>
  );
}
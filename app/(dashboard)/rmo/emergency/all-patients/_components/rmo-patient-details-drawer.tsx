// app/(dashboard)/rmo/emergency/all-patients/_components/rmo-patient-details-drawer.tsx
"use client";
import { useState } from "react";
import {
  Activity,
  ClipboardList,
  FilePlus2,
  FlaskConical,
  HeartPulse,
  Pill,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmergencyPatient, TreatmentPlanItem } from "@/types/emergency/emergency-types";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import { EntryKind, RmoEntryDrawer } from "./rmo-entry-drawers";
import { EmergencyStatusBadge } from "@/app/(dashboard)/admission/emergency/all-patients/_components/emergency-badges";
import { SectionRegistration } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-registration";
import { SectionVitals } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-vitals";
import { SectionDiagnosis } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-diagnosis";
import { SectionMedicines } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-medicines";
import { SectionLabReports } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-lab-reports";
import { SectionProgressNotes } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-progress-notes";
import { SectionTreatmentPlan } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-treatment-plan";
import { SectionAssignedNurses } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-assigned-nurses";
import { SectionHandoverPolice } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-handover-police";
import { EmergencyStatusWorkflow } from "./emergency-status-workflow";
import { TreatmentPlanForm } from "./section-treatment-plan-form";


type SectionKey = "registration" | "vitals" | "diagnosis" | "medicines" | "labs" | "notes" | "treatment" | "nurses" | "handover" | "status";

const NAV: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: "registration", label: "Registration", icon: ClipboardList },
  { key: "vitals", label: "Vitals", icon: HeartPulse },
  { key: "diagnosis", label: "Diagnosis", icon: Stethoscope },
  { key: "medicines", label: "Medicines", icon: Pill },
  { key: "labs", label: "Labs", icon: FlaskConical },
  { key: "notes", label: "Progress Notes", icon: ClipboardList },
  { key: "treatment", label: "Treatment", icon: Activity },
  { key: "nurses", label: "Nurses", icon: Activity },
  { key: "handover", label: "Handover", icon: Activity },
  { key: "status", label: "Status Log", icon: Activity },
];

export function RmoPatientDetailsDrawer({ patient, onClose, onUpdate }: { patient: RmoEmergencyPatient | null; onClose: () => void; onUpdate: (patient: RmoEmergencyPatient) => void }) {
  const [section, setSection] = useState<SectionKey>("registration");
  const [entry, setEntry] = useState<EntryKind>(null);
  const [addingTreatment, setAddingTreatment] = useState(false);

  if (!patient) return null;
  const active = patient;

  function receive(payload: unknown) {
    onUpdate(appendPayload(active, entry, payload));
    setEntry(null);
  }

  function addTreatmentPlan(plan: Omit<TreatmentPlanItem, "id" | "orderedOn" | "followStatus">) {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const newPlan: TreatmentPlanItem = { ...plan, id: `T-${Date.now()}`, orderedOn: stamp, followStatus: "Following" };
    onUpdate({ ...active, treatmentPlans: [newPlan, ...active.treatmentPlans] });
    setAddingTreatment(false);
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[#f7f9fc] shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white">
              {(active.patientName || "U").charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{active.patientName || "Unidentified Patient"}</h2>
                <EmergencyStatusBadge status={active.status} />
              </div>
              <p className="text-xs text-slate-500">{active.uhid} · {active.emergencyNumber} · {active.bedOrBay}</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                section === key ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-5">
          {section === "registration" && <SectionRegistration patient={active} />}
          {section === "vitals" && (
            <>
              <SectionAction title="Vitals History" onClick={() => setEntry("vital")} />
              <SectionVitals vitals={active.vitals} />
            </>
          )}
          {section === "diagnosis" && (
            <>
              <SectionAction title="Diagnosis" onClick={() => setEntry("diagnosis")} />
              <SectionDiagnosis diagnoses={active.diagnoses} />
            </>
          )}
          {section === "medicines" && (
            <>
              <SectionAction title="Medicine Orders" onClick={() => setEntry("medicine")} />
              <SectionMedicines doses={active.doses} />
            </>
          )}
          {section === "labs" && (
            <>
              <SectionAction title="Lab Orders" onClick={() => setEntry("lab")} />
              <SectionLabReports reports={active.labReports} />
            </>
          )}
          {section === "notes" && (
            <>
              <SectionAction title="Progress Notes" onClick={() => setEntry("note")} />
              <SectionProgressNotes notes={active.progressNotes} />
            </>
          )}
          {section === "treatment" && (
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
          )}
          {section === "nurses" && <SectionAssignedNurses assignments={active.assignedNurses} />}
          {section === "handover" && <SectionHandoverPolice handovers={active.handovers} police={active.police} onInformPolice={() => undefined} />}
          {section === "status" && <EmergencyStatusWorkflow patient={active} onUpdate={(updated) => onUpdate(updated)} />}
        </div>
      </aside>

      <RmoEntryDrawer kind={entry} patient={active} onClose={() => setEntry(null)} onSubmit={receive} />
      {addingTreatment && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setAddingTreatment(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <TreatmentPlanForm onSubmit={addTreatmentPlan} onOpenChange={() => setAddingTreatment(false)} />
          </div>
        </div>
      )}
    </div>
  );
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
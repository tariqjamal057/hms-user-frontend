// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/rmo-detail-drawer.tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
    Activity, ClipboardList, FileText, FlaskConical, HeartPulse, LogOut, Pill, Stethoscope, UserCog, UserRound, Wallet, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
    DiagnosisEntry, DischargeForm, FluidBalanceEntry, MedicineDose, MedicineOrder, PatientStatus, ProgressNote, StatusChangeLog, VitalRecord, RmoPatient,
} from "@/types/rmo/ipd/rmo-types";
import { PatientStatusBadge } from "../rmo-badges";
import { SectionOverview } from "./section-overview";
import { SectionVitals } from "./section-vitals";
import { SectionDiagnosis } from "./section-diagnosis";
import { SectionMedicines } from "./section-medicines";
import { SectionLabReports } from "./section-lab-reports";
import { SectionProgressNotes } from "./section-progress-notes";
import { SectionFluidBalance } from "./section-fluid-balance";
import { SectionTreatmentPlan } from "./section-treatment-plan";
import { SectionAssignedNurses } from "./section-assigned-nurses";
import { SectionShiftHandover } from "./section-shift-handover";
import { SectionDischarge } from "./section-discharge";
import { SectionBilling } from "./section-billing";
import { SectionStatusChange } from "./section-status-change";
import { CURRENT_RMO } from "@/lib/rmo/ipd/rmo-data";

type SectionKey = "overview" | "vitals" | "diagnosis" | "medicines" | "labs" | "notes" | "fluid" | "treatment" | "nurses" | "handover" | "discharge" | "billing" | "status";

const NAV: { key: SectionKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "vitals", label: "Vitals", icon: HeartPulse },
    { key: "diagnosis", label: "Diagnosis", icon: Stethoscope },
    { key: "medicines", label: "Medicines", icon: Pill },
    { key: "labs", label: "Lab Reports", icon: FlaskConical },
    { key: "notes", label: "Progress Notes", icon: ClipboardList },
    { key: "fluid", label: "Fluid Balance", icon: Activity },
    { key: "treatment", label: "Treatment Plan", icon: ClipboardList },
    { key: "nurses", label: "Assigned Nurses", icon: UserCog },
    { key: "handover", label: "Shift Handover", icon: UserRound },
    { key: "discharge", label: "Discharge", icon: LogOut },
    { key: "billing", label: "Billing", icon: Wallet },
    { key: "status", label: "Status", icon: Activity },
];

export function RmoDetailDrawer({ patient, onClose, onPatientUpdate }: { patient: RmoPatient | null; onClose: () => void; onPatientUpdate: (patient: RmoPatient) => void }) {
    const [section, setSection] = useState<SectionKey>("overview");

    if (!patient) return null;
    const active = patient; // now active is definitely RmoPatient, not nullable

    function addVital(vital: VitalRecord) {
        onPatientUpdate({ ...active, vitals: [vital, ...active.vitals] } as RmoPatient);
        toast.success("Vitals recorded successfully.");
    }
    function addDiagnosis(entry: DiagnosisEntry) {
        onPatientUpdate({ ...active, diagnoses: [entry, ...active.diagnoses] } as RmoPatient);
        toast.success("Diagnosis added.");
    }
    function addMedicineOrder(order: MedicineOrder, generatedDoses: MedicineDose[]) {
        onPatientUpdate({ ...active, medicineOrders: [order, ...active.medicineOrders], doses: [...generatedDoses, ...active.doses] } as RmoPatient);
        toast.success(`${order.medicineName} added to queue for ${order.durationDays} days.`);
    }
    function addNote(note: ProgressNote) {
        onPatientUpdate({ ...active, progressNotes: [note, ...active.progressNotes] } as RmoPatient);
        toast.success("Progress note saved.");
    }
    function addFluidEntry(entry: FluidBalanceEntry) {
        onPatientUpdate({ ...active, fluidBalance: [entry, ...active.fluidBalance] } as RmoPatient);
        toast.success("Fluid balance entry recorded.");
    }
    function changeStatus(status: PatientStatus, reason?: string) {
        const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        onPatientUpdate({
            ...active, status,
            statusLog: [{ id: `S-${Date.now()}`, status, changedBy: CURRENT_RMO.name, changedAt: stamp, reason }, ...active.statusLog],
        } as RmoPatient);
        toast.success(status === "Critical" ? "Status set to Critical. Doctor notified immediately." : `Patient status updated to ${status}.`);
    }
    function dischargePatient(form: DischargeForm) {
        onPatientUpdate({ ...active, discharge: form, status: "Discharged" } as RmoPatient);
        toast.success(`${active.patientName} discharged successfully.`);
    }

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
            <aside className="absolute right-0 top-0 flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[#f7f9fc] shadow-2xl">
                <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white">{active.patientName.charAt(0)}</div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold text-slate-800">{active.patientName}</h2>
                                <PatientStatusBadge status={active.status} />
                            </div>
                            <p className="text-xs text-slate-500">{active.uhid} · {active.ward} · {active.room} · {active.bed}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
                </header>

                <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
                    {NAV.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setSection(key)} className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${section === key ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}>
                            <Icon className="h-3.5 w-3.5" />{label}
                        </button>
                    ))}
                </nav>

                <div className="flex-1 overflow-y-auto p-5">
                    {section === "overview" && <SectionOverview patient={active} />}
                    {section === "vitals" && <SectionVitals vitals={active.vitals} onAddVital={addVital} recordPath={`/rmo/ipd/all-patients/${active.uhid}/record-vitals`} />}
                    {section === "diagnosis" && <SectionDiagnosis diagnoses={active.diagnoses} onAddDiagnosis={addDiagnosis} />}
                    {section === "medicines" && <SectionMedicines doses={active.doses} orders={active.medicineOrders} onAddOrder={addMedicineOrder} />}
                    {section === "labs" && <SectionLabReports reports={active.labReports} />}
                    {section === "notes" && <SectionProgressNotes notes={active.progressNotes} onAddNote={addNote} />}
                    {section === "fluid" && <SectionFluidBalance entries={active.fluidBalance} onAddEntry={addFluidEntry} />}
                    {section === "treatment" && <SectionTreatmentPlan plans={active.treatmentPlans} />}
                    {section === "nurses" && <SectionAssignedNurses assignments={active.assignedNurses} />}
                    {section === "handover" && <SectionShiftHandover handovers={active.handovers} />}
                    {section === "discharge" && <SectionDischarge discharge={active.discharge} onDischarge={dischargePatient} />}
                    {section === "billing" && <SectionBilling billing={active.billing} />}
                    {section === "status" && <SectionStatusChange status={active.status} statusLog={active.statusLog} onChangeStatus={changeStatus} />}
                </div>
            </aside>
        </div>
    );
}
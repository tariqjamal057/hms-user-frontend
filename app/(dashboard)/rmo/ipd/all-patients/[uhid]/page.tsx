// app/(dashboard)/rmo/ipd/all-patients/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { PatientDetailShell, type PatientDetailData, type PatientTab, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import type {
  DiagnosisEntry, DischargeForm, FluidBalanceEntry, MedicineDose, MedicineOrder, PatientStatus, ProgressNote, RmoPatient, StatusChangeLog, VitalRecord,
} from "@/types/rmo/ipd/rmo-types";
import { RMO_PATIENTS, getRmoPatientByUhid } from "@/lib/rmo/ipd/rmo-data";
import { PatientStatusBadge } from "../_components/rmo-badges";
import { SectionOverview } from "../_components/drawer/section-overview";
import { SectionVitals } from "../_components/drawer/section-vitals";
import { SectionDiagnosis } from "../_components/drawer/section-diagnosis";
import { SectionMedicines } from "../_components/drawer/section-medicines";
import { SectionLabReports } from "../_components/drawer/section-lab-reports";
import { SectionProgressNotes } from "../_components/drawer/section-progress-notes";
import { SectionFluidBalance } from "../_components/drawer/section-fluid-balance";
import { SectionTreatmentPlan } from "../_components/drawer/section-treatment-plan";
import { SectionAssignedNurses } from "../_components/drawer/section-assigned-nurses";
import { SectionShiftHandover } from "../_components/drawer/section-shift-handover";
import { SectionDischarge } from "../_components/drawer/section-discharge";
import { SectionBilling } from "../_components/drawer/section-billing";

const patientsPath = "/rmo/ipd/all-patients";

export default function RmoPatientDetailPage() {
  const params = useParams();
  const uhid = params.uhid as string;
  const sourcePatient = getRmoPatientByUhid(uhid);
  const [patient, setPatient] = useState<RmoPatient | undefined>(sourcePatient);

  if (!patient) return notFound();

  const patientName = patient.patientName;

  function updatePatient(patch: (prev: RmoPatient) => Partial<RmoPatient>) {
    setPatient((prev) => (prev ? { ...prev, ...patch(prev) } : prev));
  }

  function addVital(vital: VitalRecord) {
    updatePatient((p) => ({ vitals: [vital, ...p.vitals] }));
    toast.success("Vitals recorded successfully.");
  }
  function addDiagnosis(entry: DiagnosisEntry) {
    updatePatient((p) => ({ diagnoses: [entry, ...p.diagnoses] }));
    toast.success("Diagnosis added.");
  }
  function addMedicineOrder(order: MedicineOrder, generatedDoses: MedicineDose[]) {
    updatePatient((p) => ({ medicineOrders: [order, ...p.medicineOrders], doses: [...generatedDoses, ...p.doses] }));
    toast.success(`${order.medicineName} added to queue for ${order.durationDays} days.`);
  }
  function addNote(note: ProgressNote) {
    updatePatient((p) => ({ progressNotes: [note, ...p.progressNotes] }));
    toast.success("Progress note saved.");
  }
  function addFluidEntry(entry: FluidBalanceEntry) {
    updatePatient((p) => ({ fluidBalance: [entry, ...p.fluidBalance] }));
    toast.success("Fluid balance entry recorded.");
  }
  function dischargePatient(form: DischargeForm) {
    updatePatient(() => ({ discharge: form, status: "Discharged" }));
    toast.success(`${patientName} discharged successfully.`);
  }

  const patientList: PatientListItem[] = RMO_PATIENTS.map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.ipdId} · ${p.ward} · ${p.bed}`,
  }));

  const detail: PatientDetailData = {
    uhid: patient.uhid,
    name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    acuity: patient.status === "Discharged" ? undefined : patient.status,
    moduleId: patient.ipdId,
    moduleIdLabel: "IPD ID",
    locationParts: [patient.ward, patient.room, patient.bed],
    contact: patient.contactNumber,
    fallbackInfoFields: [
      { label: "Doctor", value: patient.attendingDoctor },
      { label: "Department", value: patient.department },
      { label: "RMO Assigned", value: patient.rmoAssigned },
      { label: "Admitted On", value: patient.admissionDateTime },
    ],
  };

  const tabs: PatientTab[] = [
    { value: "overview", label: "Overview", content: <SectionOverview patient={patient} /> },
    { value: "vitals", label: "Vitals", content: <SectionVitals vitals={patient.vitals} onAddVital={addVital} /> },
    { value: "diagnosis", label: "Diagnosis", content: <SectionDiagnosis diagnoses={patient.diagnoses} onAddDiagnosis={addDiagnosis} /> },
    { value: "medicines", label: "Medicines", content: <SectionMedicines doses={patient.doses} orders={patient.medicineOrders} onAddOrder={addMedicineOrder} /> },
    { value: "labs", label: "Lab Reports", content: <SectionLabReports reports={patient.labReports} /> },
    { value: "notes", label: "Progress Notes", content: <SectionProgressNotes notes={patient.progressNotes} onAddNote={addNote} /> },
    { value: "fluid", label: "Fluid Balance", content: <SectionFluidBalance entries={patient.fluidBalance} onAddEntry={addFluidEntry} /> },
    { value: "treatment", label: "Treatment Plan", content: <SectionTreatmentPlan plans={patient.treatmentPlans} /> },
    { value: "nurses", label: "Assigned Nurses", content: <SectionAssignedNurses assignments={patient.assignedNurses} /> },
    { value: "handover", label: "Shift Handover", content: <SectionShiftHandover handovers={patient.handovers} /> },
    { value: "discharge", label: "Discharge", content: <SectionDischarge discharge={patient.discharge} onDischarge={dischargePatient} /> },
    { value: "billing", label: "Billing", content: <SectionBilling billing={patient.billing} /> },
    { value: "status", label: "Status", content: <StatusLogSection status={patient.status} statusLog={patient.statusLog} /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath={patientsPath}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}

function StatusLogSection({ status, statusLog }: { status: PatientStatus; statusLog: StatusChangeLog[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Current Status</p>
        <div className="mt-3 flex items-center gap-2">
          <PatientStatusBadge status={status} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Status changes are disabled for this profile. Current status is managed by the attending clinical team.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-bold text-slate-800">Status Change History</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-slate-200 text-left text-[10px] uppercase text-slate-400"><th className="py-2 pr-4">Date / Time</th><th className="pr-4">Status</th><th className="pr-4">Changed By</th><th>Reason</th></tr></thead>
            <tbody>
              {statusLog.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-slate-700">{log.changedAt}</td>
                  <td className="pr-4"><PatientStatusBadge status={log.status} /></td>
                  <td className="pr-4 text-slate-600">{log.changedBy}</td>
                  <td className="text-slate-500">{log.reason ?? "—"}</td>
                </tr>
              ))}
              {statusLog.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">No status changes recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
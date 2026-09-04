// app/(dashboard)/nurse/ipd/patients/[uhid]/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import type {
  DischargeSummaryForm, EmarDose, FluidBalanceEntry, ProgressNote, ShiftHandoverEntry, TreatmentPlanItem, VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";
import {
  getEmarForPatient, getFluidBalanceForPatient, getNursePatientByUhid, getNursePatients,
  getProgressNotesForPatient, getShiftHandoversForPatient, getTreatmentPlanForPatient, getVitalsForPatient,
} from "@/lib/nurse/ipd/nurse-ipd-data";
import { TabOverview } from "./_components/tab-overview";
import { TabVitals } from "./_components/tab-vitals";
import { TabEmar } from "./_components/tab-emar";
import { TabProgressNotes } from "./_components/tab-progress-notes";
import { TabFluidBalance } from "./_components/tab-fluid-balance";
import { TabTreatmentPlan } from "./_components/tab-treatment-plan";
import { TabShiftHandover } from "./_components/tab-shift-handover";
import { TabDischarge } from "./_components/tab-discharge";

export default function NursePatientDetailPage() {
  const params = useParams();
  const uhid = params.uhid as string;
  const patient = getNursePatientByUhid(uhid);

  const [, setTab] = useState("overview");
  const [vitals, setVitals] = useState<VitalRecord[]>(() => getVitalsForPatient(patient.uhid));
  const [doses, setDoses] = useState<EmarDose[]>(() => getEmarForPatient(patient.uhid));
  const [notes, setNotes] = useState<ProgressNote[]>(() => getProgressNotesForPatient(patient.uhid));
  const [fluidEntries, setFluidEntries] = useState<FluidBalanceEntry[]>(() => getFluidBalanceForPatient(patient.uhid));
  const [plans, setPlans] = useState<TreatmentPlanItem[]>(() => getTreatmentPlanForPatient(patient.uhid));
  const [handovers, setHandovers] = useState<ShiftHandoverEntry[]>(() => getShiftHandoversForPatient(patient.uhid));

  function addVital(vital: VitalRecord) {
    setVitals((previous) => [vital, ...previous]);
    toast.success("Vitals recorded successfully.");
  }
  function updateDose(dose: EmarDose) {
    setDoses((previous) => previous.map((item) => item.id === dose.id ? dose : item));
    toast.success(`${dose.medicineName} (${dose.slot}) marked as ${dose.status}.`);
  }
  function addNote(note: ProgressNote) {
    setNotes((previous) => [{ ...note, uhid: patient.uhid }, ...previous]);
    toast.success("Progress note saved and signed.");
  }
  function addFluidEntry(entry: FluidBalanceEntry) {
    setFluidEntries((previous) => [entry, ...previous]);
    toast.success("Fluid balance entry recorded.");
  }
  function toggleFollow(plan: TreatmentPlanItem) {
    setPlans((previous) => previous.map((item) => item.id === plan.id ? plan : item));
    toast.success(`Treatment plan marked as ${plan.followStatus}.`);
  }
  function handleHandover(entry: ShiftHandoverEntry) {
    setHandovers((previous) => [entry, ...previous]);
    toast.success(`Patient handed over to ${entry.toNurse}.`);
  }
  function handleDischarge(form: DischargeSummaryForm) {
    console.log("Discharge summary submitted:", { uhid: patient.uhid, ...form });
    toast.success(`${patient.patientName} discharged successfully.`);
  }

  const patientList: PatientListItem[] = useMemo(
    () =>
      getNursePatients().map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.ipdId} · ${p.ward} / ${p.bed}`,
      })),
    [],
  );

  const patientData: PatientDetailData = {
    uhid: patient.uhid,
    name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    acuity: patient.acuity,
    moduleId: patient.ipdId,
    moduleIdLabel: "IPD ID",
    locationParts: [patient.ward, patient.room, patient.bed],
    fallbackInfoFields: [
      { label: "Department", value: patient.department },
      { label: "Attending Doctor", value: patient.admittingDoctor },
      { label: "Admitted On", value: patient.admissionDateTime },
      { label: "Assigned Nurse", value: `${patient.assignedNurse} · ${patient.currentShift}` },
    ],
  };

  const tabs: PatientTab[] = [
    { value: "overview", label: "Overview", content: <TabOverview patient={patient} onNext={() => setTab("vitals")} /> },
    { value: "vitals", label: "Vitals Monitoring", content: <TabVitals vitals={vitals} onAddVital={addVital} /> },
    { value: "emar", label: "Orders & eMAR", content: <TabEmar doses={doses} onUpdateDose={updateDose} /> },
    { value: "notes", label: "Progress Notes", content: <TabProgressNotes notes={notes} onAddNote={addNote} /> },
    { value: "fluid", label: "Fluid Balance", content: <TabFluidBalance entries={fluidEntries} onAddEntry={addFluidEntry} /> },
    { value: "treatment", label: "Treatment Plan", content: <TabTreatmentPlan plans={plans} onToggleFollow={toggleFollow} /> },
    { value: "handover", label: "Shift Handover", content: <TabShiftHandover handovers={handovers} onHandover={handleHandover} /> },
    { value: "discharge", label: "Discharge", content: <TabDischarge patientName={patient.patientName} onDischarge={handleDischarge} /> },
  ];

  return (
    <PatientDetailShell
      patient={patientData}
      patientList={patientList}
      patientsPath="/nurse/ipd/patients"
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
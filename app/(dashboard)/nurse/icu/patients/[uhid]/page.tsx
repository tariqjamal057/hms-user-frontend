// app/(dashboard)/nurse/icu/patients/[uhid]/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import type {
  DischargeSummaryForm, EmarDose, FluidBalanceEntry, ProgressNote, ShiftHandoverEntry, TreatmentPlanItem, VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";
import type { OxygenAdministration, OxygenObservation } from "@/types/nurse/icu/oxygen-therapy-types";
import {
  getEmarForPatient, getFluidBalanceForPatient, getNursePatientByUhid, getNursePatients,
  getProgressNotesForPatient, getShiftHandoversForPatient, getTreatmentPlanForPatient, getVitalsForPatient,
} from "@/lib/nurse/icu/nurse-icu-data";
import { getActiveOxygenOrder, getOxygenOrderHistory, getActiveAdministration, getOxygenObservations } from "@/lib/nurse/icu/oxygen-therapy-data";

import { TabOverview } from "../../../ipd/patients/[uhid]/_components/tab-overview";
import { TabVitals } from "../../../ipd/patients/[uhid]/_components/tab-vitals";
import { TabEmar } from "../../../ipd/patients/[uhid]/_components/tab-emar";
import { TabProgressNotes } from "../../../ipd/patients/[uhid]/_components/tab-progress-notes";
import { TabFluidBalance } from "../../../ipd/patients/[uhid]/_components/tab-fluid-balance";
import { TabTreatmentPlan } from "../../../ipd/patients/[uhid]/_components/tab-treatment-plan";

import { TabVentilation } from "./_components/tab-ventilation";
import { TabOxygenTherapy } from "./_components/tab-oxygen-therapy";
import { TabMonitoring } from "./_components/monitoring-panel";
import { TabHandover } from "./_components/tab-handover";
import { CURRENT_NURSE } from "@/lib/nurse/icu/nurse-icu-data";
import { getActiveVentilatorAdministration, getActiveVentilatorOrder, getVentilatorObservations, getVentilatorOrderHistory } from "@/lib/nurse/icu/ventilation-data";
import { VentilatorAdministration, VentilatorObservation } from "@/types/nurse/icu/ventilation-types";
import { TabDischarge } from "../../../ipd/patients/[uhid]/_components/tab-discharge";

export default function NurseIcuPatientDetailPage() {
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

  const activeOrder = getActiveOxygenOrder(patient.uhid);
  const orderHistory = getOxygenOrderHistory(patient.uhid);
  const [administration, setAdministration] = useState<OxygenAdministration | undefined>(() => getActiveAdministration(patient.uhid));
  const [observations, setObservations] = useState<OxygenObservation[]>(() => getOxygenObservations(patient.uhid));

  const activeVentOrder = getActiveVentilatorOrder(patient.uhid);
  const ventOrderHistory = getVentilatorOrderHistory(patient.uhid);
  const [ventAdministration, setVentAdministration] = useState<VentilatorAdministration | undefined>(() => getActiveVentilatorAdministration(patient.uhid));
  const [ventObservations, setVentObservations] = useState<VentilatorObservation[]>(() => getVentilatorObservations(patient.uhid));

  function handleConfirmVentSetup(admin: VentilatorAdministration) {
    setVentAdministration(admin);
    toast.success("Ventilator setup confirmed.");
  }
  function handleSaveVentObservation(obs: VentilatorObservation) {
    setVentObservations((prev) => [obs, ...prev]);
  }

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

  function handleStartOxygen(admin: OxygenAdministration) {
    setAdministration(admin);
    toast.success("Oxygen therapy started.");
  }
  function handleSaveObservation(obs: OxygenObservation) {
    setObservations((prev) => [obs, ...prev]);
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
    moduleIdLabel: "ICU ID",
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
    { value: "vitals", label: "Vitals Monitoring", content: <TabVitals vitals={vitals} onAddVital={addVital} recordVitalsPath={`/nurse/icu/patients/${patient.uhid}/record-vitals`} /> },
    { value: "monitoring", label: "Monitoring", content: <TabMonitoring patientName={patient.patientName} vitals={vitals} /> },
    { value: "ventilation", label: "Ventilation", content: (
      <TabVentilation
        patientName={patient.patientName}
        nurseName={CURRENT_NURSE.name}
        activeOrder={activeVentOrder}
        orderHistory={ventOrderHistory}
        administration={ventAdministration}
        observations={ventObservations}
        onConfirmSetup={handleConfirmVentSetup}
        onSaveObservation={handleSaveVentObservation}
      />
    ) },
    { value: "oxygen", label: "Oxygen Therapy", content: (
      <TabOxygenTherapy
        patientName={patient.patientName}
        nurseName={CURRENT_NURSE.name}
        activeOrder={activeOrder}
        orderHistory={orderHistory}
        administration={administration}
        observations={observations}
        onStartOxygen={handleStartOxygen}
        onSaveObservation={handleSaveObservation}
      />
    ) },
    { value: "emar", label: "Medicines", content: <TabEmar doses={doses} onUpdateDose={updateDose} /> },
    { value: "notes", label: "Progress Notes", content: <TabProgressNotes notes={notes} onAddNote={addNote} /> },
    { value: "fluid", label: "Fluid Balance", content: <TabFluidBalance entries={fluidEntries} onAddEntry={addFluidEntry} /> },
    { value: "treatment", label: "Treatment Plan", content: <TabTreatmentPlan plans={plans} onToggleFollow={toggleFollow} /> },
    { value: "handover", label: "Handover", content: (
      <TabHandover
        patient={patient}
        vitals={vitals}
        doses={doses}
        notes={notes}
        fluidEntries={fluidEntries}
        handovers={handovers}
        onHandover={handleHandover}
      />
    ) },
    { value: "discharge", label: "Discharge", content: <TabDischarge patientName={patient.patientName} onDischarge={handleDischarge} /> },
  ];

  return (
    <PatientDetailShell
      patient={patientData}
      patientList={patientList}
      patientsPath="/nurse/icu/patients"
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
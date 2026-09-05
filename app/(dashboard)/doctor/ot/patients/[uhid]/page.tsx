// app/(dashboard)/doctor/ot/patients/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import type {
  OtHandoverEntry,
  OtStatus,
  SurgicalCount,
  SurgicalSafetyItem,
} from "@/types/doctor/ot/ot-types";
import {
  CURRENT_SURGEON,
  getAnesthesia,
  getCounts,
  getOtConsumables,
  getOtDocuments,
  getOtHandovers,
  getOtImplants,
  getOtMedications,
  getOtPatientByUhid,
  getOtPatients,
  getOtSpecimens,
  getPostOpNotes,
  getPreOp,
  getProcedures,
  getRecoveryAssessments,
  getSafetyItems,
} from "@/lib/doctor/ot/ot-data";

import { TabOverview } from "./_components/tab-overview";
import { TabPatientDetails } from "./_components/tab-patient-details";
import { TabPreOp } from "./_components/tab-pre-op";
import { TabSurgicalSafety } from "./_components/tab-surgical-safety";
import { TabProcedure } from "./_components/tab-procedure";
import { TabAnesthesia } from "./_components/tab-anesthesia";
import { TabMedications } from "./_components/tab-medications";
import { TabConsumables, TabImplants, TabSpecimens } from "./_components/tab-supplies";
import { TabPostOp, TabRecovery } from "./_components/tab-post-op";
import { TabHandover } from "./_components/tab-handover";
import { TabDocuments } from "./_components/tab-documents";

export default function DoctorOtPatientDetailPage() {
  const params = useParams();
  const uhid = params.uhid as string;
  const basePatient = getOtPatientByUhid(uhid);

  const [, setTab] = useState("overview");
  const [status, setStatus] = useState<OtStatus>(() => basePatient.status);
  const patient = { ...basePatient, status };

  const [preOp] = useState(() => getPreOp(patient.uhid)[0]);
  const [safetyItems, setSafetyItems] = useState<SurgicalSafetyItem[]>(() => getSafetyItems(patient.uhid));
  const [counts, setCounts] = useState<SurgicalCount[]>(() => getCounts(patient.uhid));
  const [procedure] = useState(() => getProcedures(patient.uhid)[0]);
  const [anesthesia] = useState(() => getAnesthesia(patient.uhid)[0]);
  const [medications] = useState(() => getOtMedications(patient.uhid));
  const [consumables] = useState(() => getOtConsumables(patient.uhid));
  const [implants] = useState(() => getOtImplants(patient.uhid));
  const [specimens] = useState(() => getOtSpecimens(patient.uhid));
  const [postOp] = useState(() => getPostOpNotes(patient.uhid)[0]);
  const [recovery] = useState(() => getRecoveryAssessments(patient.uhid)[0]);
  const [handovers, setHandovers] = useState<OtHandoverEntry[]>(() => getOtHandovers(patient.uhid));
  const [documents] = useState(() => getOtDocuments(patient.uhid));

  function toggleSafety(item: SurgicalSafetyItem) {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const completing = !item.completed;
    setSafetyItems((prev) =>
      prev.map((s) =>
        s.id === item.id
          ? {
              ...s,
              completed: completing,
              completedBy: completing ? CURRENT_SURGEON.name : undefined,
              completedAt: completing ? stamp : undefined,
            }
          : s,
      ),
    );
    toast.success(completing ? `Signed off: ${item.step}` : `Reopened: ${item.step}`);
  }

  function resolveCount(count: SurgicalCount) {
    setCounts((prev) => prev.map((c) => (c.id === count.id ? { ...c, status: "Correct" } : c)));
    toast.success(`${count.item} reconciled as correct.`);
  }

  function addHandover(entry: OtHandoverEntry) {
    setHandovers((prev) => [entry, ...prev]);
    toast.success(`Handed over to ${entry.toStaff}.`);
  }

  function transition(nextStatus: OtStatus) {
    setStatus(nextStatus);
    toast.success(`OT status updated to ${nextStatus}.`);
  }

  function handleTransfer(destination: string) {
    setStatus("Ready for Transfer");
    toast.success(`Patient ready for ${destination}.`);
  }

  const detail: PatientDetailData = {
    uhid: patient.uhid,
    name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    acuity: patient.status,
    moduleId: patient.otId,
    moduleIdLabel: "OT ID",
    locationParts: [patient.otRoom],
    fallbackInfoFields: [
      { label: "Procedure", value: patient.procedure, highlight: true },
      { label: "Surgeon", value: patient.surgeon },
      { label: "Anesthetist", value: patient.anesthetist },
      { label: "Scheduled On", value: patient.plannedDateTime },
    ],
  };

  const patientList: PatientListItem[] = getOtPatients().map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.otId} · ${p.procedure} · ${p.otRoom}`,
  }));

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <TabOverview patient={patient} safetyItems={safetyItems} counts={counts} onNext={() => setTab("pre-op")} onTransition={transition} />,
    },
    { value: "details", label: "Patient Details", content: <TabPatientDetails patient={patient} onNext={() => setTab("pre-op")} /> },
    { value: "pre-op", label: "Pre-Op Assessment", content: <TabPreOp assessment={preOp} onNext={() => setTab("safety")} /> },
    { value: "safety", label: "Surgical Safety", content: <TabSurgicalSafety safetyItems={safetyItems} onToggleSafety={toggleSafety} counts={counts} onResolveCount={resolveCount} /> },
    { value: "procedure", label: "Procedure", content: <TabProcedure record={procedure} /> },
    { value: "anesthesia", label: "Anesthesia", content: <TabAnesthesia record={anesthesia} /> },
    { value: "meds", label: "Medications", content: <TabMedications medications={medications} /> },
    { value: "consumables", label: "Consumables", content: <TabConsumables items={consumables} /> },
    { value: "implants", label: "Implants", content: <TabImplants items={implants} /> },
    { value: "specimens", label: "Specimens", content: <TabSpecimens items={specimens} /> },
    { value: "post-op", label: "Post-Op Notes", content: <TabPostOp note={postOp} /> },
    { value: "recovery", label: "Recovery / PACU", content: <TabRecovery assessment={recovery} onTransfer={handleTransfer} /> },
    { value: "handover", label: "Handover", content: <TabHandover handovers={handovers} onAdd={addHandover} /> },
    { value: "documents", label: "Documents", content: <TabDocuments documents={documents} /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath="/doctor/ot/patients"
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
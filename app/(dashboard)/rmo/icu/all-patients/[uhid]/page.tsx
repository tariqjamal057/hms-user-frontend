// app/(dashboard)/rmo/icu/all-patients/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardCheck, Pill, Stethoscope, TestTube, UserCog } from "lucide-react";
import { InfoTile } from "@/components/patient-detail/info-tile";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { DateField } from "@/components/forms/form-controls";
import type {
  FluidBalanceEntry,
  ProgressNote,
  VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";
import type {
  OxygenAdministration,
  OxygenObservation,
} from "@/types/nurse/icu/oxygen-therapy-types";
import type {
  VentilatorAdministration,
  VentilatorObservation,
} from "@/types/nurse/icu/ventilation-types";
import type {
  DoctorLabOrder,
  DiagnosisItem,
} from "@/types/doctor/icu/doctor-icu-types";
import {
  getEmarForPatient,
  getFluidBalanceForPatient,
  getNursePatientByUhid,
  getProgressNotesForPatient,
  getTreatmentPlanForPatient,
  getVitalsForPatient,
  NURSE_SHIFT_ASSIGNMENTS,
} from "@/lib/nurse/icu/nurse-icu-data";
import {
  getActiveOxygenOrder,
  getOxygenOrderHistory,
  getActiveAdministration,
  getOxygenObservations,
} from "@/lib/nurse/icu/oxygen-therapy-data";
import {
  getActiveVentilatorAdministration,
  getActiveVentilatorOrder,
  getVentilatorObservations,
  getVentilatorOrderHistory,
} from "@/lib/nurse/icu/ventilation-data";
import {
  CURRENT_NURSE,
  NURSE_ICU_PATIENTS,
} from "@/lib/nurse/icu/nurse-icu-data";

import { TabOverview } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-overview";
import { TabVitals } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-vitals";
import { ProgressNotesSection } from "@/components/patient-detail/progress-notes-section";
import { FluidBalanceSection } from "@/components/patient-detail/fluid-balance-section";
import { CURRENT_RMO } from "@/lib/rmo/ipd/rmo-data";

import { TabVentilation } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-ventilation";
import { TabOxygenTherapy } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-oxygen-therapy";

import {
  PatientDetailShell,
  type PatientDetailData,
  type PatientListItem,
  type PatientTab,
} from "@/components/patient-detail/patient-detail-shell";

export default function RmoIcuPatientDetailPage() {
  const params = useParams();
  const uhid = params.uhid as string;
  const patient = getNursePatientByUhid(uhid);

  const [vitals, setVitals] = useState<VitalRecord[]>(() =>
    getVitalsForPatient(patient.uhid),
  );
  const doses = getEmarForPatient(patient.uhid);
  const [notes, setNotes] = useState<ProgressNote[]>(() =>
    getProgressNotesForPatient(patient.uhid),
  );
  const [fluidEntries, setFluidEntries] = useState<FluidBalanceEntry[]>(() =>
    getFluidBalanceForPatient(patient.uhid),
  );
  const plans = getTreatmentPlanForPatient(patient.uhid);

  // Oxygen Therapy state
  const activeOrder = getActiveOxygenOrder(patient.uhid);
  const orderHistory = getOxygenOrderHistory(patient.uhid);
  const [administration, setAdministration] = useState<
    OxygenAdministration | undefined
  >(() => getActiveAdministration(patient.uhid));
  const [observations, setObservations] = useState<OxygenObservation[]>(() =>
    getOxygenObservations(patient.uhid),
  );

  // Ventilation state
  const activeVentOrder = getActiveVentilatorOrder(patient.uhid);
  const ventOrderHistory = getVentilatorOrderHistory(patient.uhid);
  const [ventAdministration, setVentAdministration] = useState<
    VentilatorAdministration | undefined
  >(() => getActiveVentilatorAdministration(patient.uhid));
  const [ventObservations, setVentObservations] = useState<
    VentilatorObservation[]
  >(() => getVentilatorObservations(patient.uhid));

  // Doctor-specific state
  const labOrders: DoctorLabOrder[] = [];
  const diagnoses: DiagnosisItem[] = [];

  const [selectedMedicineDate, setSelectedMedicineDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Filter medicines for selected date
  const filteredDoses = doses.filter((dose) => {
    const doseDate = dose.givenAt
      ? new Date(dose.givenAt).toISOString().split("T")[0]
      : null;
    return (
      selectedMedicineDate === doseDate ||
      (!dose.givenAt &&
        selectedMedicineDate === new Date().toISOString().split("T")[0])
    );
  });

  // Get nurse shift assignments for this patient
  const nurseAssignments = NURSE_SHIFT_ASSIGNMENTS[uhid] || [];

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

  function addNote(note: ProgressNote) {
    setNotes((previous) => [{ ...note, uhid: patient.uhid }, ...previous]);
    toast.success("Progress note saved and signed.");
  }
  function addFluidEntry(entry: FluidBalanceEntry) {
    setFluidEntries((previous) => [entry, ...previous]);
    toast.success("Fluid balance entry recorded.");
  }

  // Oxygen handlers
  function handleStartOxygen(admin: OxygenAdministration) {
    setAdministration(admin);
    toast.success("Oxygen therapy started.");
  }
  function handleSaveObservation(obs: OxygenObservation) {
    setObservations((prev) => [obs, ...prev]);
  }

  const fallbackInfoFields: { label: string; value: string; highlight?: boolean }[] = [];
  if (patient.admittingDoctor) fallbackInfoFields.push({ label: "Doctor", value: patient.admittingDoctor });
  if (patient.department) fallbackInfoFields.push({ label: "Department", value: patient.department });
  if (patient.currentDiagnosis) fallbackInfoFields.push({ label: "Diagnosis", value: patient.currentDiagnosis, highlight: true, });
  if (patient.admissionDateTime) fallbackInfoFields.push({ label: "Admitted On", value: patient.admissionDateTime });
  if (patient.assignedNurse) fallbackInfoFields.push({ label: "Assigned Nurse", value: patient.assignedNurse });
  if (patient.currentShift) fallbackInfoFields.push({ label: "Current Shift", value: patient.currentShift });

  const detail: PatientDetailData = {
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
    fallbackInfoFields,
  };

  const patientList: PatientListItem[] = NURSE_ICU_PATIENTS.map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.ipdId} · ${p.ward} · ${p.bed}`,
  }));

  const diagnosisTabStatusStyle = (v: string) =>
    v === "Active"
      ? "bg-emerald-50 text-emerald-700"
      : v === "Resolved"
        ? "bg-slate-100 text-slate-700"
        : v === "Chronic"
          ? "bg-amber-50 text-amber-700"
          : "bg-blue-50 text-blue-700";

  // ====== Tables ======

  const medicineColumns: DataColumn<(typeof filteredDoses)[number]>[] = [
    {
      key: "medicineName",
      label: "Medicine",
      render: (d) => (
        <div>
          <p className="font-semibold text-slate-800">{d.medicineName}</p>
          <p className="text-xs text-slate-400">{d.strength} · {d.route}</p>
        </div>
      ),
    },
    {
      key: "slot",
      label: "Slot",
      render: (d) => (
        <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
          {d.slot}
        </Badge>
      ),
    },
    {
      key: "scheduledTime",
      label: "Scheduled",
      render: (d) => (
        <span className="text-slate-600">
          {d.scheduledTime} · Qty {d.qtyRequired}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (d) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={
              d.status === "Given"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : d.status === "Pending"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
            }
          >
            {d.status}
          </Badge>
          {d.urgency === "Urgent" && (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
              Urgent
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "given",
      label: "Given",
      render: (d) =>
        d.givenBy && d.givenAt ? (
          <span className="flex items-center gap-1 text-xs text-slate-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {d.givenBy} · {d.givenAt}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  const labColumns: DataColumn<DoctorLabOrder>[] = [
    {
      key: "tests",
      label: "Tests",
      render: (o) => (
        <div className="space-y-1">
          {o.orders.map((lab, idx) => (
            <p key={idx} className="text-sm">
              <span className="font-semibold text-slate-800">{lab.testName}</span>
              <span className="ml-1 text-xs text-slate-400">{lab.category}</span>
            </p>
          ))}
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (o) => {
        const first = o.orders[0]?.priority;
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            {first ?? "—"}
          </Badge>
        );
      },
    },
    {
      key: "orderedBy",
      label: "Ordered",
      render: (o) => (
        <span className="text-xs text-slate-500">
          {o.orderedBy}
          <br />
          <span className="text-[10px] text-slate-400">
            {new Date(o.orderedAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (o) => (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
          {o.status}
        </Badge>
      ),
    },
  ];

  const planColumns: DataColumn<(typeof plans)[number]>[] = [
    {
      key: "title",
      label: "Plan",
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-800">{p.title}</p>
          <p className="mt-0.5 line-clamp-2 max-w-[420px] text-xs text-slate-500">
            {p.description}
          </p>
        </div>
      ),
    },
    {
      key: "ordered",
      label: "Ordered",
      render: (p) => (
        <span className="text-xs text-slate-500">
          {p.orderedBy} · {p.orderedOn}
        </span>
      ),
    },
    {
      key: "follow",
      label: "Status",
      render: (p) =>
        p.followStatus === "Following" ? (
          <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Following
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-600">
            Not Following
          </Badge>
        ),
    },
  ];

  const diagnosisColumns: DataColumn<DiagnosisItem>[] = [
    {
      key: "name",
      label: "Diagnosis",
      render: (d) => (
        <div>
          <p className="font-semibold text-slate-800">{d.name}</p>
          <p className="text-xs text-slate-400">Code: {d.code}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (d) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${diagnosisTabStatusStyle(d.status)}`}>
          {d.status}
        </span>
      ),
    },
    {
      key: "notedBy",
      label: "Noted By",
      render: (d) => (
        <span className="text-xs text-slate-500">
          {d.notedBy}
          <br />
          <span className="text-[10px] text-slate-400">
            {new Date(d.notedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </span>
      ),
    },
  ];

  const shiftColumns: DataColumn<(typeof nurseAssignments)[number]>[] = [
    {
      key: "date",
      label: "Date",
      render: (a) => (
        <span className="text-slate-700">
          {new Date(a.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "shift",
      label: "Shift",
      render: (a) => (
        <Badge
          variant="outline"
          className={
            a.shift === "Morning"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : a.shift === "Afternoon"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-indigo-200 bg-indigo-50 text-indigo-700"
          }
        >
          {a.shift}
        </Badge>
      ),
    },
    {
      key: "nurseName",
      label: "Nurse",
      render: (a) => <span className="font-medium text-slate-800">{a.nurseName}</span>,
    },
    {
      key: "nurseId",
      label: "Nurse ID",
      render: (a) => <span className="text-slate-600">{a.nurseId}</span>,
    },
    {
      key: "ward",
      label: "Ward",
      render: (a) => <span className="text-slate-700">{a.ward}</span>,
    },
  ];

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <TabOverview patient={patient} onNext={() => {}} />,
    },
    {
      value: "vitals",
      label: "Vitals",
      content: <TabVitals vitals={vitals} onAddVital={addVital} recordVitalsPath={`/rmo/icu/all-patients/${patient.uhid}/record-vitals`} />,
    },
    {
      value: "ventilation",
      label: "Ventilation",
      content: (
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
      ),
    },
    {
      value: "oxygen",
      label: "Oxygen Therapy",
      content: (
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
      ),
    },
    {
      value: "medicines",
      label: "Medicines",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <InfoTile label="Given" value={String(filteredDoses.filter((d) => d.status === "Given").length)} tone="emerald" />
            <InfoTile label="Pending" value={String(filteredDoses.filter((d) => d.status === "Pending").length)} tone="amber" />
            <InfoTile label="Total" value={String(filteredDoses.length)} tone="slate" />
          </div>
          <div className="w-full sm:w-56">
            <DateField
              label="Filter by date"
              value={selectedMedicineDate}
              onChange={setSelectedMedicineDate}
            />
          </div>
          <DataTable
            card
            title="Medicine Administration"
            titleIcon={<Pill className="h-4 w-4" />}
            rows={filteredDoses}
            columns={medicineColumns}
            rowKey={(d) => d.id}
            countLabel="doses"
            emptyText={`No medicines administered on ${new Date(selectedMedicineDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
          />
        </div>
      ),
    },
    {
      value: "laboratory",
      label: "Laboratory",
      content: (
        <DataTable
          card
          title="Lab Orders"
          titleIcon={<TestTube className="h-4 w-4" />}
          rows={labOrders}
          columns={labColumns}
          rowKey={(o) => o.id}
          countLabel="orders"
          emptyText="No lab orders yet."
        />
      ),
    },
    {
      value: "fluid",
      label: "Fluid Balance",
      content: (
        <FluidBalanceSection
          entries={fluidEntries}
          onAddEntry={addFluidEntry}
          authorName={CURRENT_RMO.name}
          title="Fluid Balance Chart"
        />
      ),
    },
    {
      value: "notes",
      label: "Progress Notes",
      content: (
        <ProgressNotesSection
          notes={notes}
          onAddNote={addNote}
          authorName={CURRENT_RMO.name}
          authorRole="RMO"
          soap
          accent="violet"
          categories={["RMO Review", "Doctor Round", "Nursing Update", "General"]}
          title="ICU Progress Notes"
        />
      ),
    },
    {
      value: "treatment",
      label: "Treatment Plan",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Status updated by nursing staff.</p>
          <DataTable
            card
            title="Treatment Plan"
            titleIcon={<ClipboardCheck className="h-4 w-4" />}
            rows={plans}
            columns={planColumns}
            rowKey={(p) => p.id}
            countLabel="plans"
            emptyText="No treatment plans yet."
          />
        </div>
      ),
    },
    {
      value: "diagnosis",
      label: "Diagnosis",
      content: (
        <DataTable
          card
          title="Diagnosis"
          titleIcon={<Stethoscope className="h-4 w-4" />}
          rows={diagnoses}
          columns={diagnosisColumns}
          rowKey={(d) => d.id}
          countLabel="diagnoses"
          emptyText="No diagnosis added yet."
        />
      ),
    },
    {
      value: "nurses-shift",
      label: "Nurse Shift",
      content: (
        <DataTable
          card
          title="Nurse Shift Assignments"
          titleIcon={<UserCog className="h-4 w-4" />}
          rows={nurseAssignments}
          columns={shiftColumns}
          rowKey={(a) => a.id}
          countLabel="assignments"
          emptyText="No nurse shift assignments recorded yet."
        />
      ),
    },
    {
      value: "change-status",
      label: "Change Status",
      content: (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-bold text-slate-800">
            Patient Status
          </h3>
          <p className="mb-6 text-sm text-slate-500">
            Current condition of the patient.
          </p>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Current Status
            </p>
            <p className="mt-1 text-lg font-bold text-blue-600">
              {patient.acuity}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        <PatientDetailShell
          patient={detail}
          patientList={patientList}
          patientsPath="/rmo/icu/all-patients"
          tabs={tabs}
          defaultTab="overview"
        />
      </div>
    </div>
  );
}
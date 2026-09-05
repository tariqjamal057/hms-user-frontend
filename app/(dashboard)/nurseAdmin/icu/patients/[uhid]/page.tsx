// app/(dashboard)/nurseAdmin/icu/patients/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Pill } from "lucide-react";
import type {
  EmarDose,
  FluidBalanceEntry,
  ProgressNote,
  TreatmentPlanItem,
  VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTile } from "@/components/patient-detail/info-tile";
import { CareStatusStepper, type CareStatus } from "@/components/patient-detail/care-status";
import { DateField } from "@/components/forms/form-controls";
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
import { TabProgressNotes } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-progress-notes";
import { TabFluidBalance } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-fluid-balance";
import { TabTreatmentPlan } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-treatment-plan";

import { TabVentilation } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-ventilation";
import { TabOxygenTherapy } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-oxygen-therapy";
import { TabMonitoring } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/monitoring-panel";
import { TabHandover } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-handover";

import {
  PatientDetailShell,
  type PatientDetailData,
  type PatientListItem,
  type PatientTab,
} from "@/components/patient-detail/patient-detail-shell";

export default function NurseAdminIcuPatientDetailPage() {
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
  const [plans, setPlans] = useState<TreatmentPlanItem[]>(() =>
    getTreatmentPlanForPatient(patient.uhid),
  );

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

  // Encounter / Care Status — admin workspaces may only change administrative
  // statuses (admission, movement, discharge, cancellation).
  const [encounterStatus, setEncounterStatus] = useState<CareStatus>("Admitted");

  // Filter medicines for selected date. `givenAt` is stored as a display
  // string (e.g. "27 Aug 2026, 08:05 AM") or "Ongoing", so it is parsed
  // manually rather than via `new Date()` which throws on invalid values.
  const filteredDoses = doses.filter((dose) => {
    const doseDate = dose.givenAt ? givenAtToIso(dose.givenAt) : null;
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
  function handleEncounterStatusChange(status: CareStatus) {
    setEncounterStatus(status);
    toast.success(`Encounter status updated to ${status}.`);
  }
  function addFluidEntry(entry: FluidBalanceEntry) {
    setFluidEntries((previous) => [entry, ...previous]);
    toast.success("Fluid balance entry recorded.");
  }

  function toggleFollow(plan: TreatmentPlanItem) {
    setPlans((previous) =>
      previous.map((item) => (item.id === plan.id ? plan : item)),
    );
    toast.success(`Treatment plan marked as ${plan.followStatus}.`);
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

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <TabOverview patient={patient} onNext={() => {}} />,
    },
    {
      value: "vitals",
      label: "Vitals",
      content: <TabVitals vitals={vitals} onAddVital={addVital} recordVitalsPath={`/nurseAdmin/icu/patients/${patient.uhid}/record-vitals`} />,
    },
    {
      value: "monitoring",
      label: "Monitoring",
      content: <TabMonitoring patientName={patient.patientName} vitals={vitals} />,
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
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Pill className="h-5 w-5 text-blue-600" />
                Medicine Orders
              </h3>
              <p className="text-xs text-slate-500">View doses administered for the selected date.</p>
            </div>
            <DateField label="" value={selectedMedicineDate} onChange={setSelectedMedicineDate} className="w-44" />
          </div>

          {filteredDoses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No medicines administered on{" "}
              {(() => {
                const d = new Date(`${selectedMedicineDate}T12:00:00`);
                return Number.isNaN(d.getTime())
                  ? selectedMedicineDate
                  : d.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
              })()}
            </div>
          ) : (
            <DataTable
              card
              title="Medicine Administration"
              titleIcon={<Pill className="h-4 w-4" />}
              rows={filteredDoses}
              columns={icuDoseColumns}
              rowKey={(dose) => dose.id}
              countLabel="doses"
              emptyText="No medicines administered on the selected date."
            />
          )}

          <div className="grid grid-cols-3 gap-3">
            <InfoTile label="Given" value={String(filteredDoses.filter((d) => d.status === "Given").length)} tone="emerald" />
            <InfoTile label="Pending" value={String(filteredDoses.filter((d) => d.status === "Pending").length)} tone="amber" />
            <InfoTile label="Total" value={String(filteredDoses.length)} tone="slate" />
          </div>
        </div>
      ),
    },
    {
      value: "laboratory",
      label: "Laboratory",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              Laboratory Orders
            </h3>
          </div>
          {labOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No lab orders yet. Click &quot;Order Lab Tests&quot; to create orders.
            </div>
          ) : (
            <div className="space-y-3">
              {labOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">
                        {order.orders.length} Tests Ordered
                      </p>
                      <p className="text-xs text-slate-500">
                        Ordered by {order.orderedBy} ·{" "}
                        {new Date(order.orderedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {order.orders.map((lab, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-slate-50 p-3 text-sm"
                      >
                        <p className="font-semibold text-slate-800">
                          {lab.testName} · {lab.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          Priority: {lab.priority} ·{" "}
                          {lab.clinicalNotes || "No notes"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      value: "fluid",
      label: "Fluid Balance",
      content: <TabFluidBalance entries={fluidEntries} onAddEntry={addFluidEntry} />,
    },
    {
      value: "notes",
      label: "Progress Notes",
      content: <TabProgressNotes notes={notes} onAddNote={addNote} />,
    },
    {
      value: "treatment",
      label: "Treatment Plan",
      content: <TabTreatmentPlan plans={plans} onToggleFollow={toggleFollow} />,
    },
    {
      value: "diagnosis",
      label: "Diagnosis",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Diagnosis</h3>
          </div>
          {diagnoses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No diagnosis added yet. Click &quot;Add Diagnosis&quot; to create entries.
            </div>
          ) : (
            <div className="space-y-3">
              {diagnoses.map((diag) => (
                <div
                  key={diag.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{diag.name}</p>
                      <p className="text-xs text-slate-500">
                        Code: {diag.code} · Noted by {diag.notedBy} ·{" "}
                        {new Date(diag.notedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${diagnosisTabStatusStyle(diag.status)}`}
                    >
                      {diag.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      value: "handover",
      label: "Handover",
      content: (
        <TabHandover
          patient={patient}
          vitals={vitals}
          doses={doses}
          notes={notes}
          fluidEntries={fluidEntries}
        />
      ),
    },
    {
      value: "nurses-shift",
      label: "Nurse Shift",
      content: (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            Nurse Shift Assignments
          </h3>
          {nurseAssignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No nurse shift assignments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="py-3 text-left font-semibold text-slate-600">
                      Date
                    </th>
                    <th className="py-3 text-left font-semibold text-slate-600">
                      Shift
                    </th>
                    <th className="py-3 text-left font-semibold text-slate-600">
                      Nurse Name
                    </th>
                    <th className="py-3 text-left font-semibold text-slate-600">
                      Nurse ID
                    </th>
                    <th className="py-3 text-left font-semibold text-slate-600">
                      Ward
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nurseAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-3 text-slate-800">
                        {new Date(assignment.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            assignment.shift === "Morning"
                              ? "bg-amber-50 text-amber-700"
                              : assignment.shift === "Afternoon"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {assignment.shift}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-slate-800">
                        {assignment.nurseName}
                      </td>
                      <td className="py-3 text-slate-600">{assignment.nurseId}</td>
                      <td className="py-3 text-slate-800">{assignment.ward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      value: "change-status",
      label: "Change Status",
      content: (
        <CareStatusStepper
          value={encounterStatus}
          onChange={handleEncounterStatusChange}
          authorityLabel="This workspace holds administrative authority — admission, patient movement, discharge and cancellation"
          allowedStatuses={[
            "Registered",
            "Waiting",
            "Admitted",
            "Transferred",
            "Discharged",
            "Cancelled",
          ]}
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
          patientsPath="/nurseAdmin/icu/patients"
          tabs={tabs}
          defaultTab="overview"
        />
      </div>
    </div>
  );
}

const GIVEN_AT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function givenAtToIso(givenAt: string): string | null {
  const match = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4})/.exec(givenAt);
  if (!match) return null;
  const monthLabel = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
  const monthIndex = GIVEN_AT_MONTHS.indexOf(monthLabel);
  if (monthIndex === -1) return null;
  const day = Number(match[1]);
  const year = Number(match[3]);
  if (day < 1 || day > 31) return null;
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const icuDoseColumns: DataColumn<EmarDose>[] = [
  {
    key: "medicineName",
    label: "Medicine",
    render: (dose) => (
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">{dose.medicineName}</p>
        <p className="text-xs text-slate-400">{dose.strength} · {dose.route} · Slot: {dose.slot}</p>
        {dose.instructions && <p className="mt-0.5 text-xs italic text-slate-500">{dose.instructions}</p>}
      </div>
    ),
  },
  {
    key: "scheduledTime",
    label: "Scheduled",
    render: (dose) => <span className="text-sm text-slate-600">{dose.scheduledTime}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (dose) => {
      const tone =
        dose.status === "Given"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : dose.status === "Pending"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-slate-100 text-slate-700";
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={tone}>{dose.status}</Badge>
          {dose.urgency === "Urgent" && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Urgent</Badge>}
        </div>
      );
    },
  },
  {
    key: "givenBy",
    label: "Given",
    render: (dose) =>
      dose.givenBy && dose.givenAt ? (
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {dose.givenBy} · {dose.givenAt}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
    hideOnMobile: true,
  },
];
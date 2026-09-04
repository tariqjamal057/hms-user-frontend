// app/(dashboard)/rmo/icu/all-patients/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
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
import { TabProgressNotes } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-progress-notes";
import { TabFluidBalance } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-fluid-balance";

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

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <TabOverview patient={patient} onNext={() => {}} />,
    },
    {
      value: "vitals",
      label: "Vitals",
      content: <TabVitals vitals={vitals} onAddVital={addVital} />,
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              Medicine Orders
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Date:</label>
              <input
                type="date"
                value={selectedMedicineDate}
                onChange={(e) => setSelectedMedicineDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {filteredDoses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No medicines administered on{" "}
              {new Date(selectedMedicineDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoses.map((dose) => (
                <div
                  key={dose.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">
                          {dose.medicineName}
                        </p>
                        <Badge
                          className={
                            dose.status === "Given"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : dose.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                          }
                        >
                          {dose.status}
                        </Badge>
                        {dose.urgency === "Urgent" && (
                          <Badge className="border-red-200 bg-red-50 text-red-700">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {dose.strength} · {dose.route} · Slot: {dose.slot}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Scheduled: {dose.scheduledTime} · Qty: {dose.qtyRequired}
                      </p>
                      {dose.instructions && (
                        <p className="mt-1 text-xs italic text-slate-600">
                          {dose.instructions}
                        </p>
                      )}
                      {dose.givenBy && dose.givenAt && (
                        <div className="mt-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <p className="text-xs text-slate-600">
                            Given by{" "}
                            <span className="font-semibold">{dose.givenBy}</span>{" "}
                            at{" "}
                            <span className="font-semibold">{dose.givenAt}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {filteredDoses.filter((d) => d.status === "Given").length}
                </p>
                <p className="text-xs text-slate-600">Given</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {filteredDoses.filter((d) => d.status === "Pending").length}
                </p>
                <p className="text-xs text-slate-600">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-600">
                  {filteredDoses.length}
                </p>
                <p className="text-xs text-slate-600">Total</p>
              </div>
            </div>
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
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Treatment Plan</h3>
            <p className="text-xs text-slate-500">
              Status updated by nursing staff
            </p>
          </div>
          {plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No treatment plans yet.
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{plan.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {plan.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Ordered by {plan.orderedBy} · {plan.orderedOn}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">
                      {plan.followStatus === "Following" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Following
                        </Badge>
                      ) : (
                        <Badge className="text-slate-600">Not Following</Badge>
                      )}
                      {plan.lastUpdatedBy && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          By {plan.lastUpdatedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
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
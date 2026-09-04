// app/(dashboard)/doctor/icu/patients/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import type {
  DischargeSummaryForm,
  EmarDose,
  FluidBalanceEntry,
  ProgressNote,
  ShiftHandoverEntry,
  TreatmentPlanItem,
  VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";
import type { VentilationRecord } from "@/types/nurse/icu/nurse-icu-types";
import type {
  OxygenAdministration,
  OxygenObservation,
  OxygenOrder,
} from "@/types/nurse/icu/oxygen-therapy-types";
import type {
  VentilatorOrder,
  VentilatorAdministration,
  VentilatorObservation,
} from "@/types/nurse/icu/ventilation-types";
import type {
  DoctorMedicineOrder,
  DoctorLabOrder,
  DiagnosisItem,
  NurseAssignment,
  MedicineDraft,
  LabDraft,
  PatientStatus,
} from "@/types/doctor/icu/doctor-icu-types";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import {
  getEmarForPatient,
  getFluidBalanceForPatient,
  getNursePatientByUhid,
  getProgressNotesForPatient,
  getShiftHandoversForPatient,
  getTreatmentPlanForPatient,
  getVitalsForPatient,
  getVentilationForPatient,
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
import { TabFluidBalance } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-fluid-balance";
import { TabProgressNotes } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-progress-notes";

import { TabVentilation } from "@/app/(dashboard)/doctor/icu/all-patients/[uhid]/_components/tab-ventilation";
import { TabOxygenTherapy } from "@/app/(dashboard)/doctor/icu/all-patients/[uhid]/_components/tab-oxygen-therapy";
import { MedicineForm } from "./_components/medicine-form";
import { LabForm } from "./_components/lab-form";
import { DiagnosisForm } from "./_components/diagnosis-form";
import { VentilatorOrderForm } from "./_components/ventilator-order-form";
import { OxygenOrderForm } from "./_components/oxygen-order-form";
import { TabDischarge } from "./_components/tab-discharge";
import { Badge, CheckCircle2 } from "lucide-react";

export default function DoctorIcuPatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uhid = params.uhid as string;
  const patient = getNursePatientByUhid(uhid);

  const [, setTab] = useState("overview");
  const [vitals, setVitals] = useState<VitalRecord[]>(() =>
    getVitalsForPatient(patient.uhid),
  );
  const [doses, setDoses] = useState<EmarDose[]>(() =>
    getEmarForPatient(patient.uhid),
  );
  const [notes, setNotes] = useState<ProgressNote[]>(() =>
    getProgressNotesForPatient(patient.uhid),
  );
  const [fluidEntries, setFluidEntries] = useState<FluidBalanceEntry[]>(() =>
    getFluidBalanceForPatient(patient.uhid),
  );
  const [plans, setPlans] = useState<TreatmentPlanItem[]>(() =>
    getTreatmentPlanForPatient(patient.uhid),
  );
  const [handovers, setHandovers] = useState<ShiftHandoverEntry[]>(() =>
    getShiftHandoversForPatient(patient.uhid),
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
  const [medicineOrders, setMedicineOrders] = useState<DoctorMedicineOrder[]>(
    [],
  );
  const [labOrders, setLabOrders] = useState<DoctorLabOrder[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [patientStatus, setPatientStatus] = useState<
    | "Stable"
    | "Under Observation"
    | "Critical"
    | "Discharge"
    | "Follow Up OPD"
    | "Shifted to Ward"
  >("Under Observation");
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [dischargeMedicines, setDischargeMedicines] = useState<
    DoctorMedicineOrder[]
  >([]);

  // Drawers
  const [showMedicineDrawer, setShowMedicineDrawer] = useState(false);
  const [showLabDrawer, setShowLabDrawer] = useState(false);
  const [showDiagnosisDrawer, setShowDiagnosisDrawer] = useState(false);
  const [showVentOrderDrawer, setShowVentOrderDrawer] = useState(false);
  const [showOxygenOrderDrawer, setShowOxygenOrderDrawer] = useState(false);
  const [showDischargeMedicineDrawer, setShowDischargeMedicineDrawer] =
    useState(false);

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
  function handleConfirmVentSetup(admin: VentilatorAdministration) {
    setVentAdministration(admin);
    toast.success("Ventilator setup confirmed.");
  }
  function handleSaveVentObservation(obs: VentilatorObservation) {
    setVentObservations((prev) => [obs, ...prev]);
  }
  function toggleFollow(plan: TreatmentPlanItem) {
    setPlans((previous) =>
      previous.map((item) => (item.id === plan.id ? plan : item)),
    );
    toast.success(`Treatment plan marked as ${plan.followStatus}.`);
  }
  function handleHandover(entry: ShiftHandoverEntry) {
    setHandovers((previous) => [entry, ...previous]);
    toast.success(`Patient handed over to ${entry.toNurse}.`);
  }
  function handleStartOxygen(admin: OxygenAdministration) {
    setAdministration(admin);
    toast.success("Oxygen therapy started.");
  }
  function handleSaveObservation(obs: OxygenObservation) {
    setObservations((prev) => [obs, ...prev]);
  }
  function handleDischarge(form: DischargeSummaryForm) {
    console.log("Discharge summary submitted:", {
      uhid: patient.uhid,
      ...form,
      dischargeMedicines,
    });
    toast.success(`${patient.patientName} discharged successfully.`);
    setShowDischargeForm(false);
  }

  // Doctor order handlers
  function handleSaveMedicineOrder(medicines: MedicineDraft[]) {
    const newOrder: DoctorMedicineOrder = {
      id: `MED-${Date.now()}`,
      uhid: patient.uhid,
      medicines,
      orderedBy: "Dr. Amit Verma",
      orderedAt: new Date().toISOString(),
      status: "Active",
    };
    setMedicineOrders((prev) => [...prev, newOrder]);
    setShowMedicineDrawer(false);
    toast.success("Medicine order saved successfully.");
  }

  function handleSaveDischargeMedicineOrder(medicines: MedicineDraft[]) {
    const newOrder: DoctorMedicineOrder = {
      id: `DISCH-MED-${Date.now()}`,
      uhid: patient.uhid,
      medicines,
      orderedBy: "Dr. Amit Verma",
      orderedAt: new Date().toISOString(),
      status: "Active",
    };
    setDischargeMedicines((prev) => [...prev, newOrder]);
    setShowDischargeMedicineDrawer(false);
    toast.success("Discharge medicine order saved successfully.");
  }

  function handleSaveLabOrder(labs: LabDraft[]) {
    const newOrder: DoctorLabOrder = {
      id: `LAB-${Date.now()}`,
      uhid: patient.uhid,
      orders: labs,
      orderedBy: "Dr. Amit Verma",
      orderedAt: new Date().toISOString(),
      status: "Pending",
    };
    setLabOrders((prev) => [...prev, newOrder]);
    setShowLabDrawer(false);
    toast.success("Lab orders sent to laboratory.");
  }

  function handleSaveDiagnosis(diagnosisItems: DiagnosisItem[]) {
    setDiagnoses((prev) => [...prev, ...diagnosisItems]);
    setShowDiagnosisDrawer(false);
    toast.success("Diagnosis added successfully.");
  }

  function handleSaveVentOrder(order: VentilatorOrder) {
    toast.success("Ventilator order created successfully.");
    setShowVentOrderDrawer(false);
  }

  function handleSaveOxygenOrder(order: OxygenOrder) {
    toast.success("Oxygen therapy order created successfully.");
    setShowOxygenOrderDrawer(false);
  }

  function handleStatusChange(status: typeof patientStatus) {
    setPatientStatus(status);
    if (status === "Discharge" || status === "Follow Up OPD") {
      setShowDischargeForm(true);
    } else if (status === "Shifted to Ward") {
      toast.success(
        "Patient shifted to Ward IPD. Patient list moved to IPD admissions.",
      );
    } else {
      toast.success(`Patient status updated to ${status}.`);
    }
  }

  const detail: PatientDetailData = {
    uhid: patient.uhid,
    name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies ?? [],
    acuity: patientStatus === "Stable" || patientStatus === "Critical" || patientStatus === "Under Observation" ? patientStatus : undefined,
    moduleId: patient.ipdId,
    moduleIdLabel: "ICU ID",
    locationParts: [patient.ward, patient.room, patient.bed],
    metaLine: `${patient.currentDiagnosis} (${patient.diagnosisCode})`,
    fallbackInfoFields: [
      { label: "Department", value: patient.department },
      { label: "Attending Doctor", value: patient.admittingDoctor },
      { label: "Admitted On", value: patient.admissionDateTime },
      { label: "Assigned Nurse", value: `${patient.assignedNurse} · ${patient.currentShift}` },
      { label: "Diagnosis", value: patient.currentDiagnosis, highlight: true },
      { label: "Diagnosis Code", value: patient.diagnosisCode },
    ],
  };

  const patientList: PatientListItem[] = NURSE_ICU_PATIENTS.map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.uhid} · ${p.ipdId} · ${p.ward} / ${p.room} / ${p.bed}`,
  }));

  const STATUS_OPTIONS: { label: string; value: string; color: string; dot: string }[] = [
    { label: "Stable", value: "Stable", color: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    { label: "Under Observation", value: "Under Observation", color: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    { label: "Critical", value: "Critical", color: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
    { label: "Discharge", value: "Discharge", color: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    { label: "Follow Up OPD", value: "Follow Up OPD", color: "border-purple-200 bg-purple-50 text-purple-700", dot: "bg-purple-500" },
    { label: "Shifted to Ward", value: "Shifted to Ward", color: "border-cyan-200 bg-cyan-50 text-cyan-700", dot: "bg-cyan-500" },
  ];

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <TabOverview patient={patient} onNext={() => setTab("vitals")} />,
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
          activeOrder={activeVentOrder}
          orderHistory={ventOrderHistory}
          administration={ventAdministration}
          observations={ventObservations}
          onCreateOrder={() => setShowVentOrderDrawer(true)}
        />
      ),
    },
    {
      value: "oxygen",
      label: "Oxygen Therapy",
      content: (
        <TabOxygenTherapy
          patientName={patient.patientName}
          activeOrder={activeOrder}
          orderHistory={orderHistory}
          administration={administration}
          observations={observations}
          onCreateOrder={() => setShowOxygenOrderDrawer(true)}
        />
      ),
    },
    {
      value: "medicines",
      label: "Medicines",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Medicine Orders</h3>
            <Drawer open={showMedicineDrawer} onOpenChange={setShowMedicineDrawer} direction="right">
              <DrawerTrigger asChild>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Add Medicines</button>
              </DrawerTrigger>
              <DrawerContent className="overflow-y-auto overflow-x-hidden">
                <div className="p-6">
                  <MedicineForm onSubmit={handleSaveMedicineOrder} onClose={() => setShowMedicineDrawer(false)} />
                </div>
              </DrawerContent>
            </Drawer>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Date:</label>
              <input type="date" value={selectedMedicineDate} onChange={(e) => setSelectedMedicineDate(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
            </div>
          </div>
          {filteredDoses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No medicines administered on {new Date(selectedMedicineDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoses.map((dose) => (
                <div key={dose.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{dose.medicineName}</p>
                        <Badge className={dose.status === "Given" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : dose.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200"}>{dose.status}</Badge>
                        {dose.urgency === "Urgent" && <Badge className="border-red-200 bg-red-50 text-red-700">Urgent</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{dose.strength} · {dose.route} · Slot: {dose.slot}</p>
                      <p className="mt-1 text-xs text-slate-500">Scheduled: {dose.scheduledTime} · Qty: {dose.qtyRequired}</p>
                      {dose.instructions && <p className="mt-1 text-xs italic text-slate-600">{dose.instructions}</p>}
                      {dose.givenBy && dose.givenAt && (
                        <div className="mt-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <p className="text-xs text-slate-600">Given by <span className="font-semibold">{dose.givenBy}</span> at <span className="font-semibold">{dose.givenAt}</span></p>
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
              <div><p className="text-2xl font-bold text-emerald-600">{filteredDoses.filter((d) => d.status === "Given").length}</p><p className="text-xs text-slate-600">Given</p></div>
              <div><p className="text-2xl font-bold text-amber-600">{filteredDoses.filter((d) => d.status === "Pending").length}</p><p className="text-xs text-slate-600">Pending</p></div>
              <div><p className="text-2xl font-bold text-slate-600">{filteredDoses.length}</p><p className="text-xs text-slate-600">Total</p></div>
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
            <h3 className="text-lg font-bold text-slate-800">Laboratory Orders</h3>
            <Drawer open={showLabDrawer} onOpenChange={setShowLabDrawer} direction="right">
              <DrawerTrigger asChild>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Order Lab Tests</button>
              </DrawerTrigger>
              <DrawerContent className="overflow-y-auto overflow-x-hidden">
                <div className="p-6">
                  <LabForm onSubmit={handleSaveLabOrder} onClose={() => setShowLabDrawer(false)} />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          {labOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No lab orders yet. Click "Order Lab Tests" to create orders.</div>
          ) : (
            <div className="space-y-3">
              {labOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{order.orders.length} Tests Ordered</p>
                      <p className="text-xs text-slate-500">Ordered by {order.orderedBy} · {new Date(order.orderedAt).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{order.status}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {order.orders.map((lab, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 p-3 text-sm">
                        <p className="font-semibold text-slate-800">{lab.testName} · {lab.category}</p>
                        <p className="text-xs text-slate-500">Priority: {lab.priority} · {lab.clinicalNotes || "No notes"}</p>
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
            <p className="text-xs text-slate-500">Status updated by nursing staff</p>
          </div>
          {plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No treatment plans yet.</div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{plan.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                      <p className="mt-2 text-xs text-slate-500">Ordered by {plan.orderedBy} · {plan.orderedOn}</p>
                    </div>
                    <div className="ml-4 shrink-0">
                      {plan.followStatus === "Following" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="mr-1 h-3 w-3" /> Following</Badge>
                      ) : (
                        <Badge className="text-slate-600">Not Following</Badge>
                      )}
                      {plan.lastUpdatedBy && <p className="mt-1 text-[10px] text-slate-400">By {plan.lastUpdatedBy}</p>}
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
            <Drawer open={showDiagnosisDrawer} onOpenChange={setShowDiagnosisDrawer} direction="right">
              <DrawerTrigger asChild>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Add Diagnosis</button>
              </DrawerTrigger>
              <DrawerContent className="overflow-y-auto overflow-x-hidden">
                <div className="p-6">
                  <DiagnosisForm onSubmit={handleSaveDiagnosis} onClose={() => setShowDiagnosisDrawer(false)} />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          {diagnoses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No diagnosis added yet. Click "Add Diagnosis" to create entries.</div>
          ) : (
            <div className="space-y-3">
              {diagnoses.map((diag) => (
                <div key={diag.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{diag.name}</p>
                      <p className="text-xs text-slate-500">Code: {diag.code} · Noted by {diag.notedBy} · {new Date(diag.notedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${diag.status === "Active" ? "bg-emerald-50 text-emerald-700" : diag.status === "Resolved" ? "bg-slate-100 text-slate-700" : diag.status === "Chronic" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{diag.status}</span>
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
          <h3 className="mb-4 text-lg font-bold text-slate-800">Nurse Shift Assignments</h3>
          {nurseAssignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No nurse shift assignments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="py-3 text-left font-semibold text-slate-600">Date</th>
                    <th className="py-3 text-left font-semibold text-slate-600">Shift</th>
                    <th className="py-3 text-left font-semibold text-slate-600">Nurse Name</th>
                    <th className="py-3 text-left font-semibold text-slate-600">Nurse ID</th>
                    <th className="py-3 text-left font-semibold text-slate-600">Ward</th>
                  </tr>
                </thead>
                <tbody>
                  {nurseAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-3 text-slate-800">{new Date(assignment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${assignment.shift === "Morning" ? "bg-amber-50 text-amber-700" : assignment.shift === "Afternoon" ? "bg-blue-50 text-blue-700" : "bg-indigo-50 text-indigo-700"}`}>{assignment.shift}</span></td>
                      <td className="py-3 font-medium text-slate-800">{assignment.nurseName}</td>
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
          <h3 className="mb-2 text-lg font-bold text-slate-800">Change Patient Status</h3>
          <p className="mb-6 text-sm text-slate-500">Select the current status of the patient. This will update the patient's record and trigger appropriate workflows.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value as PatientStatus)}
                className={`rounded-xl border-2 p-4 text-left transition ${patientStatus === opt.value ? "ring-2 " + opt.color.replace("border-", "") : `border-slate-200 ${opt.dot === "bg-emerald-500" ? "hover:border-emerald-300" : opt.dot === "bg-amber-500" ? "hover:border-amber-300" : opt.dot === "bg-red-500" ? "hover:border-red-300" : opt.dot === "bg-blue-500" ? "hover:border-blue-300" : opt.dot === "bg-purple-500" ? "hover:border-purple-300" : "hover:border-cyan-300"}`}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${opt.dot}`} />
                  <span className="font-semibold text-slate-800">{opt.label}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{opt.label === "Stable" ? "Patient condition is stable" : opt.label === "Under Observation" ? "Requires close monitoring" : opt.label === "Critical" ? "Critical condition - immediate attention" : opt.label === "Discharge" ? "Patient ready for discharge" : opt.label === "Follow Up OPD" ? "Discharge with OPD follow-up" : "Transfer to IPD ward"}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Current Status</p>
            <p className="mt-1 text-lg font-bold text-blue-600">{patientStatus}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath="/doctor/icu/all-patients"
        status={patientStatus}
        statusOptions={STATUS_OPTIONS}
        onStatusChange={(s) => handleStatusChange(s as typeof patientStatus)}
        onSwitchPatient={(u) => router.push(`/doctor/icu/all-patients/${u}`)}
        tabs={tabs}
        defaultTab="overview"
        subtitle="ICU Patient"
      />

      {/* Discharge Form */}
      {showDischargeForm && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              Discharge Summary
            </h3>
            <button
              onClick={() => {
                setShowDischargeMedicineDrawer(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add Discharge Medicines
            </button>
          </div>

          {/* Show discharge medicines if any */}
          {dischargeMedicines.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Discharge Medicines:
              </p>
              {dischargeMedicines.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="space-y-1">
                    {order.medicines.map((med, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-semibold text-slate-800">
                          {med.medicineName}
                        </span>
                        <span className="text-slate-600">
                          {" "}
                          - {med.dose} {med.frequency} ({med.duration})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <TabDischarge
            patientName={patient.patientName}
            onDischarge={handleDischarge}
          />
        </div>
      )}

      {/* Order Drawers */}
      <Drawer
        open={showVentOrderDrawer}
        onOpenChange={setShowVentOrderDrawer}
        direction="right"
      >
        <DrawerContent className="overflow-y-auto overflow-x-hidden">
          <div className="p-6">
            <VentilatorOrderForm
              uhid={patient.uhid}
              icuBed={patient.bed}
              patientName={patient.patientName}
              orderedBy="Dr. Amit Verma"
              orderedByRole="Doctor"
              onSubmit={handleSaveVentOrder}
              onClose={() => setShowVentOrderDrawer(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={showOxygenOrderDrawer}
        onOpenChange={setShowOxygenOrderDrawer}
        direction="right"
      >
        <DrawerContent className="overflow-y-auto overflow-x-hidden">
          <div className="p-6">
            <OxygenOrderForm
              uhid={patient.uhid}
              icuBed={patient.bed}
              patientName={patient.patientName}
              orderedBy="Dr. Amit Verma"
              orderedByRole="Doctor"
              onSubmit={handleSaveOxygenOrder}
              onClose={() => setShowOxygenOrderDrawer(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Discharge Medicine Drawer */}
      <Drawer
        open={showDischargeMedicineDrawer}
        onOpenChange={setShowDischargeMedicineDrawer}
        direction="right"
      >
        <DrawerContent className="overflow-y-auto overflow-x-hidden">
          <div className="p-6">
            <MedicineForm
              onSubmit={handleSaveDischargeMedicineOrder}
              onClose={() => setShowDischargeMedicineDrawer(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
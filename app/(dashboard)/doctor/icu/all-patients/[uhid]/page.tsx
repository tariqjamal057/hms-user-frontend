// app/(dashboard)/doctor/icu/patients/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FilePlus2,
  Pill,
  Stethoscope,
  TestTube,
} from "lucide-react";
import type {
  DischargeSummaryForm,
  EmarDose,
  FluidBalanceEntry,
  ProgressNote,
  TreatmentPlanItem,
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
  DoctorMedicineOrder,
  DoctorLabOrder,
  DiagnosisItem,
  MedicineDraft,
  LabDraft,
  PatientStatus,
} from "@/types/doctor/icu/doctor-icu-types";
import { PillButton } from "@/components/forms/pill-button";
import { DateField } from "@/components/forms/form-controls";
import { InfoTile } from "@/components/patient-detail/info-tile";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
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
import { NURSE_ICU_PATIENTS } from "@/lib/nurse/icu/nurse-icu-data";

import { TabOverview } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-overview";
import { TabVitals } from "../../../../nurse/ipd/patients/[uhid]/_components/tab-vitals";
import { ProgressNotesSection } from "@/components/patient-detail/progress-notes-section";
import { FluidBalanceSection } from "@/components/patient-detail/fluid-balance-section";
import { CURRENT_DOCTOR } from "@/lib/doctor/icu/doctor-icu-data";

import { TabVentilation } from "@/app/(dashboard)/doctor/icu/all-patients/[uhid]/_components/tab-ventilation";
import { TabOxygenTherapy } from "@/app/(dashboard)/doctor/icu/all-patients/[uhid]/_components/tab-oxygen-therapy";
import { TabMonitoring } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/monitoring-panel";
import { TabHandover } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-handover";
import { MedicineForm } from "./_components/medicine-form";
import { DiagnosisForm } from "./_components/diagnosis-form";
import { LabDrawer } from "@/components/consultation/lab-drawer";
import { VentilatorOrderForm } from "./_components/ventilator-order-form";
import { OxygenOrderForm } from "./_components/oxygen-order-form";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { TabDischarge } from "./_components/tab-discharge";
import { Activity, CheckCircle2, ClipboardCheck, UserCog } from "lucide-react";

export default function DoctorIcuPatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uhid = params.uhid as string;
  const patient = getNursePatientByUhid(uhid);

  const [, setTab] = useState("overview");
  const [vitals, setVitals] = useState<VitalRecord[]>(() => {
    const fetched = getVitalsForPatient(patient.uhid);
    if (fetched.length > 0) return fetched;
    return [
      { id: "V-ICU-1", dateTime: "27 Aug 2026, 08:00 AM", bp: "128/84", systolic: 128, diastolic: 84, pulse: 82, respRate: 18, spo2: 97, temp: 98.6, pain: 2, recordedBy: "Nurse Kavita" },
      { id: "V-ICU-2", dateTime: "26 Aug 2026, 08:00 PM", bp: "132/86", systolic: 132, diastolic: 86, pulse: 88, respRate: 20, spo2: 96, temp: 99.0, pain: 3, recordedBy: "Nurse Priya" },
      { id: "V-ICU-3", dateTime: "26 Aug 2026, 08:00 AM", bp: "126/82", systolic: 126, diastolic: 82, pulse: 84, respRate: 19, spo2: 97, temp: 98.8, pain: 2, recordedBy: "Nurse Anjali" },
    ];
  });
  const [doses, setDoses] = useState<EmarDose[]>(() => {
    const fetched = getEmarForPatient(patient.uhid);
    if (fetched.length > 0) return fetched;
    return [
      { id: "D-ICU-1", medicineName: "Tab. Aspirin 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "After breakfast", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 08:05 AM" },
      { id: "D-ICU-2", medicineName: "Tab. Atorvastatin 40mg", strength: "40 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Routine", instructions: "After breakfast", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 08:10 AM" },
      { id: "D-ICU-3", medicineName: "Inj. Heparin 5000 IU", strength: "5000 IU", route: "SC", slot: "Morning", scheduledTime: "09:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "As per ACS protocol", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 09:02 AM" },
      { id: "D-ICU-4", medicineName: "Inj. Pantoprazole 40mg", strength: "40 mg", route: "IV", slot: "Morning", scheduledTime: "10:00 AM", qtyRequired: 1, status: "Given", urgency: "Routine", instructions: "Slow IV push", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 10:05 AM" },
      { id: "D-ICU-5", medicineName: "Tab. Metoprolol 25mg", strength: "25 mg", route: "Oral", slot: "Afternoon", scheduledTime: "02:00 PM", qtyRequired: 1, status: "Not Given", urgency: "Urgent", instructions: "After lunch" },
      { id: "D-ICU-6", medicineName: "Tab. Aspirin 75mg", strength: "75 mg", route: "Oral", slot: "Afternoon", scheduledTime: "02:00 PM", qtyRequired: 1, status: "Not Given", urgency: "Routine", instructions: "After lunch" },
      { id: "D-ICU-7", medicineName: "Tab. Metoprolol 25mg", strength: "25 mg", route: "Oral", slot: "Night", scheduledTime: "08:00 PM", qtyRequired: 1, status: "Pending", urgency: "Urgent", instructions: "After dinner" },
      { id: "D-ICU-8", medicineName: "Tab. Atorvastatin 40mg", strength: "40 mg", route: "Oral", slot: "Night", scheduledTime: "09:00 PM", qtyRequired: 1, status: "Pending", urgency: "Routine", instructions: "At bedtime" },
      { id: "D-ICU-9", medicineName: "Tab. Clopidogrel 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Out of Stock", urgency: "Urgent", instructions: "After breakfast", remarks: "Batch exhausted, pharmacy notified" },
      { id: "D-ICU-10", medicineName: "Tab. Spironolactone 25mg", strength: "25 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Out of Stock", urgency: "Routine", instructions: "After breakfast", remarks: "Awaiting next pharmacy delivery" },
    ];
  });
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
  const [oxygenOrderMode, setOxygenOrderMode] = useState<"create" | "modify">(
    "create",
  );
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
      orderedBy: "Doctor",
      orderedAt: new Date().toISOString(),
      status: "Active",
    };
    setMedicineOrders((prev) => [...prev, newOrder]);
    toast.success("Medicine order saved successfully.");
  }

  function handleSaveDischargeMedicineOrder(medicines: MedicineDraft[]) {
    const newOrder: DoctorMedicineOrder = {
      id: `DISCH-MED-${Date.now()}`,
      uhid: patient.uhid,
      medicines,
      orderedBy: "Doctor",
      orderedAt: new Date().toISOString(),
      status: "Active",
    };
    setDischargeMedicines((prev) => [...prev, newOrder]);
    toast.success("Discharge medicine order saved successfully.");
  }

  function handleSaveLabOrder(labs: LabDraft[]) {
    const newOrder: DoctorLabOrder = {
      id: `LAB-${Date.now()}`,
      uhid: patient.uhid,
      orders: labs,
      orderedBy: "Doctor",
      orderedAt: new Date().toISOString(),
      status: "Pending",
    };
    setLabOrders((prev) => [...prev, newOrder]);
    toast.success("Lab orders sent to laboratory.");
  }

  // Adapter: shared `LabDrawer` payload (lowercase dept/priority) → ICU
  // `LabDraft` shape (capitalized `Pathology`/`Radiology`, `Routine`/`Urgent`/`Stat`).
  function handleSaveInvestigationOrder(items: import("@/components/consultation/lab-drawer").LabDraft[]) {
    const mapped: LabDraft[] = items.map((it) => ({
      category: it.department === "pathology" ? "Pathology" : "Radiology",
      testName: it.test,
      orderedBy: "Doctor",
      priority: it.priority === "priority" ? "Urgent" : "Routine",
      clinicalNotes: "",
      orderedAt: new Date().toISOString(),
    }));
    handleSaveLabOrder(mapped);
  }

  function handleSaveDiagnosis(diagnosisItems: DiagnosisItem[]) {
    setDiagnoses((prev) => [...prev, ...diagnosisItems]);
    toast.success("Diagnosis added successfully.");
  }

  function handleSaveVentOrder() {
    toast.success("Ventilator order created successfully.");
  }

  function handleSaveOxygenOrder() {
    toast.success("Oxygen therapy order created successfully.");
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

  const STATUS_OPTIONS: { label: string; value: string; color: string; dot: string; icon: string; chip: string; description: string; card: string }[] = [
    {
      label: "Stable",
      value: "Stable",
      color: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      icon: "from-emerald-500 to-teal-500",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      description: "Patient condition is stable, vitals within normal limits.",
      card: "border-emerald-200 hover:border-emerald-300",
    },
    {
      label: "Under Observation",
      value: "Under Observation",
      color: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
      icon: "from-amber-500 to-orange-500",
      chip: "border-amber-200 bg-amber-50 text-amber-700",
      description: "Requires close monitoring and frequent reassessment.",
      card: "border-amber-200 hover:border-amber-300",
    },
    {
      label: "Critical",
      value: "Critical",
      color: "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500",
      icon: "from-red-500 to-rose-500",
      chip: "border-red-200 bg-red-50 text-red-700",
      description: "Critical condition — requires immediate attention.",
      card: "border-red-200 hover:border-red-300",
    },
    {
      label: "Discharge",
      value: "Discharge",
      color: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
      icon: "from-blue-500 to-cyan-500",
      chip: "border-blue-200 bg-blue-50 text-blue-700",
      description: "Patient ready for discharge from ICU.",
      card: "border-blue-200 hover:border-blue-300",
    },
    {
      label: "Follow Up OPD",
      value: "Follow Up OPD",
      color: "border-purple-200 bg-purple-50 text-purple-700",
      dot: "bg-purple-500",
      icon: "from-purple-500 to-fuchsia-500",
      chip: "border-purple-200 bg-purple-50 text-purple-700",
      description: "Discharge with scheduled OPD follow-up visit.",
      card: "border-purple-200 hover:border-purple-300",
    },
    {
      label: "Shifted to Ward",
      value: "Shifted to Ward",
      color: "border-cyan-200 bg-cyan-50 text-cyan-700",
      dot: "bg-cyan-500",
      icon: "from-cyan-500 to-sky-500",
      chip: "border-cyan-200 bg-cyan-50 text-cyan-700",
      description: "Transfer to IPD ward for continued care.",
      card: "border-cyan-200 hover:border-cyan-300",
    },
  ];

  const activeStatus = STATUS_OPTIONS.find((s) => s.value === patientStatus);

  // ====== Tables ======

  const medicineColumns: DataColumn<EmarDose>[] = [
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
        <Badge
          variant="outline"
          className="border-slate-200 bg-white text-slate-600"
        >
          {d.slot}
        </Badge>
      ),
    },
    {
      key: "scheduledTime",
      label: "Scheduled",
      render: (d) => <span className="text-slate-600">{d.scheduledTime}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (d) => (
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
      ),
    },
    {
      key: "given",
      label: "Given",
      render: (d) =>
        d.givenBy && d.givenAt ? (
          <span className="flex items-center gap-1 text-slate-600">
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
            className={
              first === "Stat"
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : first === "Urgent"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
            }
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
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700"
        >
          {o.status}
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
        <Badge
          variant="outline"
          className={
            d.status === "Active"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : d.status === "Resolved"
                ? "border-slate-200 bg-slate-50 text-slate-600"
                : d.status === "Chronic"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
          }
        >
          {d.status}
        </Badge>
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

  const planColumns: DataColumn<TreatmentPlanItem>[] = [
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
          {p.orderedBy}
          <br />
          <span className="text-[10px] text-slate-400">{p.orderedOn}</span>
        </span>
      ),
    },
    {
      key: "follow",
      label: "Status",
      render: (p) =>
        p.followStatus === "Following" ? (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
          >
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

  const shiftColumns: DataColumn<typeof nurseAssignments[number]>[] = [
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

  const dischargeMedColumns: DataColumn<DoctorMedicineOrder>[] = [
    {
      key: "medicines",
      label: "Discharge Medicines",
      render: (o) => (
        <div className="space-y-1">
          {o.medicines.map((m, idx) => (
            <p key={idx} className="text-sm">
              <span className="font-semibold text-slate-800">{m.medicineName}</span>
              <span className="ml-1 text-slate-600">
                — {m.dose} {m.frequency} ({m.duration})
              </span>
            </p>
          ))}
        </div>
      ),
    },
    {
      key: "orderedBy",
      label: "Ordered By",
      render: (o) => <span className="text-slate-600">{o.orderedBy}</span>,
    },
  ];

  // ====== Tabs ======

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <TabOverview patient={patient} doses={doses} onNext={() => setTab("vitals")} />,
    },
    {
      value: "vitals",
      label: "Vitals",
      content: <TabVitals vitals={vitals} onAddVital={addVital} recordVitalsPath={`/doctor/icu/all-patients/${patient.uhid}/record-vitals`} />,
    },
    {
      value: "diagnosis",
      label: "Diagnosis",
      content: (
        <div className="space-y-4">
          <div className="flex justify-end">
            <PillButton icon={Stethoscope} onClick={() => setShowDiagnosisDrawer(true)}>
              Add Diagnosis
            </PillButton>
          </div>
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
        </div>
      ),
    },
    {
      value: "notes",
      label: "Progress Notes",
      content: (
        <ProgressNotesSection
          notes={notes}
          onAddNote={addNote}
          authorName={CURRENT_DOCTOR.name}
          authorRole="Doctor"
          soap
          accent="blue"
          categories={["Doctor Round", "Nursing Update", "ICU Review", "General"]}
          title="ICU Progress Notes"
        />
      ),
    },
    {
      value: "monitoring",
      label: "Continuous Monitoring",
      content: <TabMonitoring patientName={patient.patientName} vitals={vitals} />,
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
          onCreateOrder={() => {
            setOxygenOrderMode("create");
            setShowOxygenOrderDrawer(true);
          }}
          onModifyOrder={() => {
            setOxygenOrderMode("modify");
            setShowOxygenOrderDrawer(true);
          }}
        />
      ),
    },
    {
      value: "medicines",
      label: "Medicines",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            <InfoTile
              label="Given"
              value={String(filteredDoses.filter((d) => d.status === "Given").length)}
              tone="emerald"
            />
            <InfoTile
              label="Pending"
              value={String(filteredDoses.filter((d) => d.status === "Pending").length)}
              tone="amber"
            />
            <InfoTile
              label="Total"
              value={String(filteredDoses.length)}
              tone="slate"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="w-full sm:w-56">
              <DateField
                label="Filter by date"
                value={selectedMedicineDate}
                onChange={setSelectedMedicineDate}
              />
            </div>
            <PillButton
              icon={Pill}
              onClick={() => setShowMedicineDrawer(true)}
              className="shrink-0"
            >
              Add Medicines
            </PillButton>
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
        <div className="space-y-4">
          <div className="flex justify-end">
            <PillButton icon={TestTube} onClick={() => setShowLabDrawer(true)}>
              Order Lab Tests
            </PillButton>
          </div>
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
        </div>
      ),
    },
    {
      value: "fluid",
      label: "Fluid Balance",
      content: (
        <FluidBalanceSection
          entries={fluidEntries}
          onAddEntry={addFluidEntry}
          authorName={CURRENT_DOCTOR.name}
          title="Fluid Balance Chart"
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
      value: "change-status",
      label: "Encounter Status",
      content: (
        <div className="space-y-5">
          {/* Hero — current status */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${activeStatus?.icon ?? "from-slate-500 to-slate-600"}`}
              >
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Status
                </p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-800">
                  {patientStatus}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {activeStatus?.description ?? "Select a status to update."}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`self-start px-3 py-1 text-xs font-bold sm:self-auto ${
                activeStatus?.chip ?? "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <span
                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${activeStatus?.dot ?? "bg-slate-400"}`}
              />
              Live
            </Badge>
          </div>

          {/* Status grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <ClipboardCheck className="h-4 w-4 text-blue-600" />
                Update Patient Status
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Select the current status of the patient. This will update the
                patient&apos;s record and trigger appropriate workflows
                (discharge summary, ward transfer, etc.).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STATUS_OPTIONS.map((opt) => {
                const active = patientStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusChange(opt.value as PatientStatus)}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                      active
                        ? `${opt.card} bg-white shadow-md ring-2 ring-offset-1`
                        : `border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm ${opt.card}`
                    }`}
                  >
                    <span
                      className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        active
                          ? `${opt.dot.replace("bg-", "border-").replace("500", "600")} ${opt.dot.replace("500", "600")} text-white`
                          : "border-slate-200 bg-white text-transparent group-hover:border-slate-300"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${opt.icon}`}
                    >
                      <Activity className="h-5 w-5" />
                    </span>
                    <p className="mt-2.5 text-sm font-bold text-slate-800">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-slate-500">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow preview */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                What happens next?
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {patientStatus === "Discharge" || patientStatus === "Follow Up OPD"
                  ? "A discharge summary form will be opened so you can document the discharge plan, instructions and follow-up details."
                  : patientStatus === "Shifted to Ward"
                    ? "The patient will be removed from the ICU list and added to the IPD ward list with a transfer note."
                    : patientStatus === "Critical"
                      ? "The patient record is flagged as critical — emergency contact & intensivist on-call will be notified."
                      : patientStatus === "Under Observation"
                        ? "Nursing staff will be prompted to record vitals at increased frequency per protocol."
                        : "Patient is marked stable — continue standard monitoring schedule."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <UserCog className="h-4 w-4 text-violet-500" />
                Assigned Team
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Attending: <span className="font-semibold text-slate-800">{patient.admittingDoctor}</span>
                <br />
                Nurse: <span className="font-semibold text-slate-800">{patient.assignedNurse}</span> · {patient.currentShift}
                <br />
                ICU ID: <span className="font-semibold text-slate-800">{patient.ipdId}</span> · {patient.ward} / {patient.room} / {patient.bed}
              </p>
            </div>
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
            <p className="text-lg font-bold text-slate-800">Discharge Summary</p>
            <PillButton
              icon={FilePlus2}
              onClick={() => setShowDischargeMedicineDrawer(true)}
            >
              Add Discharge Medicines
            </PillButton>
          </div>

          <DataTable
            card
            title="Discharge Medicines"
            rows={dischargeMedicines}
            columns={dischargeMedColumns}
            rowKey={(o) => o.id}
            countLabel="orders"
            emptyText="No discharge medicines added yet."
          />

          <div className="mt-4">
            <TabDischarge
              patientName={patient.patientName}
              onDischarge={handleDischarge}
            />
          </div>
        </div>
      )}

      {/* Order Drawers */}
      <MedicineForm
        open={showMedicineDrawer}
        onOpenChange={setShowMedicineDrawer}
        onSubmit={handleSaveMedicineOrder}
      />
      <LabDrawer
        open={showLabDrawer}
        onOpenChange={setShowLabDrawer}
        onSubmit={handleSaveInvestigationOrder}
      />
      <DiagnosisForm
        open={showDiagnosisDrawer}
        onOpenChange={setShowDiagnosisDrawer}
        onSubmit={handleSaveDiagnosis}
      />
      <MedicineForm
        open={showDischargeMedicineDrawer}
        onOpenChange={setShowDischargeMedicineDrawer}
        onSubmit={handleSaveDischargeMedicineOrder}
      />

      <VentilatorOrderForm
        open={showVentOrderDrawer}
        onOpenChange={setShowVentOrderDrawer}
        uhid={patient.uhid}
        icuBed={patient.bed}
        patientName={patient.patientName}
        orderedBy="Doctor"
        orderedByRole="Doctor"
        onSubmit={handleSaveVentOrder}
      />

      <OxygenOrderForm
        open={showOxygenOrderDrawer}
        onOpenChange={setShowOxygenOrderDrawer}
        uhid={patient.uhid}
        icuBed={patient.bed}
        patientName={patient.patientName}
        orderedBy="Doctor"
        orderedByRole="Doctor"
        existingOrder={oxygenOrderMode === "modify" ? activeOrder : undefined}
        onSubmit={handleSaveOxygenOrder}
      />
    </div>
  );
}

// app/patient-detail-demo/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, UserRound, ShieldCheck, ClipboardList, Activity, ChefHat, BadgeCheck } from "lucide-react";
import { PatientDetailShell, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import {
  getNursePatientByUhid,
  getNursePatients,
} from "@/lib/nurse/icu/nurse-icu-data";
import { getNursePatientByUhid as getIpdPatient } from "@/lib/nurse/ipd/nurse-ipd-data";
import { getNursePatients as getIpdPatients } from "@/lib/nurse/ipd/nurse-ipd-data";

type RoleKey = "doctor" | "nurse" | "rmo" | "nurseadmin";
type ModuleKey = "opd" | "ipd" | "emergency" | "icu";

const ROLE_META: Record<RoleKey, { label: string; icon: React.ReactNode }> = {
  doctor: { label: "Doctor", icon: <Stethoscope className="h-4 w-4" /> },
  nurse: { label: "Nurse", icon: <UserRound className="h-4 w-4" /> },
  rmo: { label: "RMO", icon: <ShieldCheck className="h-4 w-4" /> },
  nurseadmin: { label: "Nurse Admin", icon: <BadgeCheck className="h-4 w-4" /> },
};

const MODULE_META: Record<ModuleKey, { label: string; icon: React.ReactNode; path: string; idLabel: string }> = {
  opd: { label: "OPD", icon: <ClipboardList className="h-4 w-4" />, path: "/doctor/opd/consultation", idLabel: "OPD ID" },
  ipd: { label: "IPD", icon: <Activity className="h-4 w-4" />, path: "/nurse/ipd/patients", idLabel: "IPD ID" },
  emergency: { label: "Emergency", icon: <ChefHat className="h-4 w-4" />, path: "/nurse/emergency/all-patients", idLabel: "EP ID" },
  icu: { label: "ICU", icon: <Activity className="h-4 w-4" />, path: "/doctor/icu/all-patients", idLabel: "ICU ID" },
};

const TAB_CONFIGS: Record<RoleKey, Record<ModuleKey, PatientTab[]>> = {
  doctor: {
    opd: [
      { value: "overview", label: "Overview", content: <Placeholder text="OPD · Overview — patient complaint & examination summary" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="OPD · Vitals — quick vitals captured at registration" /> },
      { value: "consultations", label: "Consultations", content: <Placeholder text="OPD · Consultations — history of OPD visits" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="OPD · Medicines — prescriptions issued" /> },
      { value: "lab", label: "Lab Reports", content: <Placeholder text="OPD · Lab — investigation results" /> },
    ],
    ipd: [
      { value: "medicines", label: "Medicines", content: <Placeholder text="Doctor · IPD — Medicines & eMAR overview" /> },
      { value: "lab", label: "Lab Reports", content: <Placeholder text="Doctor · IPD — Laboratory reports" /> },
      { value: "vitals", label: "Vitals History", content: <Placeholder text="Doctor · IPD — Vitals trend history" /> },
      { value: "logs", label: "Clinical Logs", content: <Placeholder text="Doctor · IPD — Clinical activity log" /> },
    ],
    emergency: [
      { value: "registration", label: "Registration", content: <Placeholder text="Doctor · Emergency — triage & registration details" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="Doctor · Emergency — vitals" /> },
      { value: "diagnosis", label: "Diagnosis", content: <Placeholder text="Doctor · Emergency — provisional diagnosis" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="Doctor · Emergency — medicines" /> },
      { value: "lab", label: "Lab Reports", content: <Placeholder text="Doctor · Emergency — lab reports" /> },
      { value: "progress", label: "Progress Notes", content: <Placeholder text="Doctor · Emergency — progress notes" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="Doctor · Emergency — treatment plan" /> },
      { value: "nurses", label: "Assigned Nurses", content: <Placeholder text="Doctor · Emergency — nurse assignments" /> },
    ],
    icu: [
      { value: "overview", label: "Overview", content: <Placeholder text="Doctor · ICU — overview" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="Doctor · ICU — vitals monitoring" /> },
      { value: "ventilation", label: "Ventilation", content: <Placeholder text="Doctor · ICU — ventilator orders & observations" /> },
      { value: "oxygen", label: "Oxygen Therapy", content: <Placeholder text="Doctor · ICU — oxygen therapy" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="Doctor · ICU — medicine orders" /> },
      { value: "laboratory", label: "Laboratory", content: <Placeholder text="Doctor · ICU — lab orders" /> },
      { value: "fluid", label: "Fluid Balance", content: <Placeholder text="Doctor · ICU — fluid balance" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="Doctor · ICU — progress notes" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="Doctor · ICU — treatment plan" /> },
      { value: "diagnosis", label: "Diagnosis", content: <Placeholder text="Doctor · ICU — diagnosis" /> },
      { value: "nurses-shift", label: "Nurse Shift", content: <Placeholder text="Doctor · ICU — nurse shift assignments" /> },
      { value: "change-status", label: "Change Status", content: <Placeholder text="Doctor · ICU — change patient status" /> },
    ],
  },
  nurse: {
    opd: [
      { value: "overview", label: "Overview", content: <Placeholder text="Nurse · OPD — patient overview" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="Nurse · OPD — vitals capture" /> },
      { value: "notes", label: "Notes", content: <Placeholder text="Nurse · OPD — nursing notes" /> },
    ],
    ipd: [
      { value: "overview", label: "Overview", content: <Placeholder text="Nurse · IPD — overview" /> },
      { value: "vitals", label: "Vitals Monitoring", content: <Placeholder text="Nurse · IPD — vitals" /> },
      { value: "emar", label: "Orders & eMAR", content: <Placeholder text="Nurse · IPD — eMAR" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="Nurse · IPD — progress notes" /> },
      { value: "fluid", label: "Fluid Balance", content: <Placeholder text="Nurse · IPD — fluid balance" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="Nurse · IPD — treatment plan" /> },
      { value: "handover", label: "Shift Handover", content: <Placeholder text="Nurse · IPD — shift handover" /> },
      { value: "discharge", label: "Discharge", content: <Placeholder text="Nurse · IPD — discharge summary" /> },
    ],
    emergency: [
      { value: "registration", label: "Registration", content: <Placeholder text="Nurse · Emergency — registration" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="Nurse · Emergency — vitals" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="Nurse · Emergency — medicines" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="Nurse · Emergency — progress notes" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="Nurse · Emergency — treatment plan" /> },
    ],
    icu: [
      { value: "overview", label: "Overview", content: <Placeholder text="Nurse · ICU — overview" /> },
      { value: "vitals", label: "Vitals Monitoring", content: <Placeholder text="Nurse · ICU — vitals" /> },
      { value: "ventilation", label: "Ventilation", content: <Placeholder text="Nurse · ICU — ventilation" /> },
      { value: "oxygen", label: "Oxygen Therapy", content: <Placeholder text="Nurse · ICU — oxygen therapy" /> },
      { value: "emar", label: "Orders & eMAR", content: <Placeholder text="Nurse · ICU — eMAR" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="Nurse · ICU — progress notes" /> },
      { value: "fluid", label: "Fluid Balance", content: <Placeholder text="Nurse · ICU — fluid balance" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="Nurse · ICU — treatment plan" /> },
      { value: "handover", label: "Shift Handover", content: <Placeholder text="Nurse · ICU — shift handover" /> },
      { value: "discharge", label: "Discharge", content: <Placeholder text="Nurse · ICU — discharge summary" /> },
    ],
  },
  rmo: {
    opd: [
      { value: "overview", label: "Overview", content: <Placeholder text="RMO · OPD — overview" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="RMO · OPD — vitals" /> },
    ],
    ipd: [
      { value: "overview", label: "Overview", content: <Placeholder text="RMO · IPD — overview" /> },
      { value: "vitals", label: "Vitals Monitoring", content: <Placeholder text="RMO · IPD — vitals" /> },
      { value: "emar", label: "Orders & eMAR", content: <Placeholder text="RMO · IPD — eMAR" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="RMO · IPD — progress notes" /> },
      { value: "fluid", label: "Fluid Balance", content: <Placeholder text="RMO · IPD — fluid balance" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="RMO · IPD — treatment plan" /> },
      { value: "handover", label: "Shift Handover", content: <Placeholder text="RMO · IPD — shift handover" /> },
      { value: "discharge", label: "Discharge", content: <Placeholder text="RMO · IPD — discharge" /> },
    ],
    emergency: [
      { value: "registration", label: "Registration", content: <Placeholder text="RMO · Emergency — registration" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="RMO · Emergency — vitals" /> },
      { value: "diagnosis", label: "Diagnosis", content: <Placeholder text="RMO · Emergency — diagnosis" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="RMO · Emergency — medicines" /> },
      { value: "lab", label: "Lab Reports", content: <Placeholder text="RMO · Emergency — lab reports" /> },
      { value: "progress", label: "Progress Notes", content: <Placeholder text="RMO · Emergency — progress notes" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="RMO · Emergency — treatment plan" /> },
      { value: "nurses", label: "Assigned Nurses", content: <Placeholder text="RMO · Emergency — nurse assignments" /> },
      { value: "handover", label: "Handover", content: <Placeholder text="RMO · Emergency — police/nurse handover" /> },
    ],
    icu: [
      { value: "overview", label: "Overview", content: <Placeholder text="RMO · ICU — overview" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="RMO · ICU — vitals" /> },
      { value: "ventilation", label: "Ventilation", content: <Placeholder text="RMO · ICU — ventilation" /> },
      { value: "oxygen", label: "Oxygen Therapy", content: <Placeholder text="RMO · ICU — oxygen therapy" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="RMO · ICU — medicines" /> },
      { value: "laboratory", label: "Laboratory", content: <Placeholder text="RMO · ICU — laboratory" /> },
      { value: "fluid", label: "Fluid Balance", content: <Placeholder text="RMO · ICU — fluid balance" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="RMO · ICU — progress notes" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="RMO · ICU — treatment plan" /> },
      { value: "diagnosis", label: "Diagnosis", content: <Placeholder text="RMO · ICU — diagnosis" /> },
      { value: "nurses-shift", label: "Nurse Shift", content: <Placeholder text="RMO · ICU — nurse shift" /> },
    ],
  },
  nurseadmin: {
    opd: [
      { value: "overview", label: "Overview", content: <Placeholder text="Nurse Admin · OPD — overview" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="Nurse Admin · OPD — vitals" /> },
    ],
    ipd: [
      { value: "overview", label: "Overview", content: <Placeholder text="Nurse Admin · IPD — ward detail overview" /> },
      { value: "vitals", label: "Vitals Monitoring", content: <Placeholder text="Nurse Admin · IPD — vitals" /> },
      { value: "emar", label: "Orders & eMAR", content: <Placeholder text="Nurse Admin · IPD — eMAR" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="Nurse Admin · IPD — progress notes" /> },
      { value: "fluid", label: "Fluid Balance", content: <Placeholder text="Nurse Admin · IPD — fluid balance" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="Nurse Admin · IPD — treatment plan" /> },
      { value: "handover", label: "Shift Handover", content: <Placeholder text="Nurse Admin · IPD — shift handover" /> },
      { value: "discharge", label: "Discharge", content: <Placeholder text="Nurse Admin · IPD — discharge" /> },
    ],
    emergency: [
      { value: "registration", label: "Registration", content: <Placeholder text="Nurse Admin · Emergency — registration" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="Nurse Admin · Emergency — vitals" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="Nurse Admin · Emergency — medicines" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="Nurse Admin · Emergency — progress notes" /> },
    ],
    icu: [
      { value: "overview", label: "Overview", content: <Placeholder text="Nurse Admin · ICU — overview" /> },
      { value: "vitals", label: "Vitals", content: <Placeholder text="Nurse Admin · ICU — vitals" /> },
      { value: "ventilation", label: "Ventilation", content: <Placeholder text="Nurse Admin · ICU — ventilation" /> },
      { value: "oxygen", label: "Oxygen Therapy", content: <Placeholder text="Nurse Admin · ICU — oxygen therapy" /> },
      { value: "medicines", label: "Medicines", content: <Placeholder text="Nurse Admin · ICU — medicines" /> },
      { value: "laboratory", label: "Laboratory", content: <Placeholder text="Nurse Admin · ICU — laboratory" /> },
      { value: "fluid", label: "Fluid Balance", content: <Placeholder text="Nurse Admin · ICU — fluid balance" /> },
      { value: "notes", label: "Progress Notes", content: <Placeholder text="Nurse Admin · ICU — progress notes" /> },
      { value: "treatment", label: "Treatment Plan", content: <Placeholder text="Nurse Admin · ICU — treatment plan" /> },
      { value: "diagnosis", label: "Diagnosis", content: <Placeholder text="Nurse Admin · ICU — diagnosis" /> },
      { value: "nurses-shift", label: "Nurse Shift", content: <Placeholder text="Nurse Admin · ICU — nurse shift" /> },
      { value: "change-status", label: "Change Status", content: <Placeholder text="Nurse Admin · ICU — change status" /> },
    ],
  },
};

const STATUS_OPTIONS = [
  { label: "Stable", value: "Stable", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  { label: "Under Observation", value: "Under Observation", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  { label: "Critical", value: "Critical", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  { label: "Discharge", value: "Discharge", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  { label: "Follow Up OPD", value: "Follow Up OPD", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  { label: "Shifted to Ward", value: "Shifted to Ward", color: "bg-cyan-100 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
];

export default function PatientDetailDemoPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleKey>("doctor");
  const [module, setModule] = useState<ModuleKey>("icu");
  const [uhid, setUhid] = useState("UHID12345685");

  const patientList = useMemo(() => {
    return module === "ipd" ? getIpdPatients() : getNursePatients();
  }, [module]);

  const patient = useMemo(() => {
    if (module === "ipd") return getIpdPatient(uhid);
    return getNursePatientByUhid(uhid);
  }, [module, uhid]);

  const [status, setStatus] = useState("Under Observation");

  const tabs = TAB_CONFIGS[role][module];
  const moduleMeta = MODULE_META[module];

  function handleBack() {
    router.push(moduleMeta.path);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Demo toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
              DEMO
            </span>
            <h1 className="text-sm font-bold text-slate-800">Unified Patient Detail Component</h1>
            <span className="text-xs text-slate-400">— temp page for review</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-400">User Type</span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ROLE_META) as RoleKey[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      role === r
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {ROLE_META[r].icon}
                    {ROLE_META[r].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Module</span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MODULE_META) as ModuleKey[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModule(m)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      module === m
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300"
                    }`}
                  >
                    {MODULE_META[m].icon}
                    {MODULE_META[m].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                {ROLE_META[role].label} · {MODULE_META[module].label}
              </span>{" "}
              → {tabs.length} tabs: {tabs.map((t) => t.label).join(" · ")}
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Back (demo)
            </button>
          </div>
        </div>

        {/* Unified component */}
        <PatientDetailShell
          patient={patient}
          patientList={patientList}
          patientsPath={moduleMeta.path}
          moduleIdLabel={moduleMeta.idLabel}
          status={status}
          statusOptions={STATUS_OPTIONS}
          onStatusChange={setStatus}
          tabs={tabs}
          showPatientSwitcher
          onSwitchPatient={setUhid}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Activity className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600">{text}</p>
      <p className="mt-1 text-xs text-slate-400">
        Placeholder — actual tab content will live in the page when implemented
      </p>
    </div>
  );
}

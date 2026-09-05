// components/patient-detail/patient-profile-card.tsx
// Unified compact patient profile info card — the single "top profile header"
// used across ALL doctor (OPD/IPD/ICU/Emergency/OT) and nurse (IPD/ICU/Emergency)
// module detail pages. PatientDetailShell composes this card + tabs; standalone
// module pages render it directly.
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QuickVitalsStrip } from "./quick-vitals-strip";
import type {
  InfoField,
  PatientDetailData,
  PatientListItem,
  StatusOption,
} from "./patient-detail-types";

export type PatientProfileCardProps = {
  patient: PatientDetailData;
  patientList?: PatientListItem[];
  patientsPath: string;
  status?: string;
  statusOptions?: StatusOption[];
  onStatusChange?: (status: string) => void;
  showStatusSelector?: boolean;
  showPatientSwitcher?: boolean;
  onSwitchPatient?: (uhid: string) => void;
  infoFields?: InfoField[];
  onBack?: () => void;
  subtitle?: string;
  // Extra custom buttons to render in the profile header's top-right actions row
  headerActions?: React.ReactNode;
  // Extra badges rendered next to the name / status pills (e.g. patient type)
  extraBadges?: React.ReactNode;
  // When true (default) the card is flush at the bottom so it joins the tab bar.
  // Set false when rendered standalone so the border closes cleanly.
  flush?: boolean;
};

export function PatientProfileCard({
  patient,
  patientList = [],
  patientsPath,
  status,
  statusOptions,
  onStatusChange,
  showStatusSelector = false,
  showPatientSwitcher = false,
  onSwitchPatient,
  infoFields,
  onBack,
  subtitle,
  headerActions,
  extraBadges,
  flush = true,
}: PatientProfileCardProps) {
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [search, setSearch] = useState("");

  const baseInfo = infoFields ?? patient.fallbackInfoFields ?? [];
  const shownInfo = useMemo<Array<{ label: string; value: string; highlight?: boolean }>>(
    () => {
      const list = [...baseInfo];
      if (patient.contact) list.push({ label: "Contact", value: patient.contact });
      if (patient.assignedNurse) list.push({ label: "Assigned Nurse", value: patient.assignedNurse });
      if (patient.currentShift) list.push({ label: "Current Shift", value: patient.currentShift });
      return list;
    },
    [baseInfo, patient.contact, patient.assignedNurse, patient.currentShift],
  );
  const currentStatusMeta = statusOptions?.find((s) => s.value === status);

  const location = (patient.locationParts ?? []).join(" / ");
  const subtitleLine = [location, patient.metaLine, subtitle].filter(Boolean).join(" · ");

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patientList;
    return patientList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q),
    );
  }, [patientList, search]);

  function handleSelectPatient(uhid: string) {
    setSwitcherOpen(false);
    setSearch("");
    if (onSwitchPatient) {
      onSwitchPatient(uhid);
    } else {
      router.push(`${patientsPath}/${uhid}`);
    }
  }

  function handleBack() {
    if (onBack) onBack();
    else router.push(patientsPath);
  }

  return (
    <div
      className={`border-slate-200 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/70 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ${
        flush ? "rounded-t-2xl border border-b-0" : "rounded-2xl border"
      }`}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3">
          {/* Top row: back + identity + actions */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Back to patients"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-base font-bold text-white shadow-md sm:h-14 sm:w-14 sm:text-lg">
                {patient.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                    {patient.name}
                  </h1>
                  {status && currentStatusMeta && (
                    <StatusPill label={status} color={currentStatusMeta.color} dot={currentStatusMeta.dot} />
                  )}
                  {patient.acuity && <AcuityBadge acuity={patient.acuity} />}
                  {extraBadges}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {patient.age} years · {patient.gender}
                  {patient.bloodGroup ? (
                    <> · Blood Group <span className="font-semibold">{patient.bloodGroup}</span></>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  UHID: {patient.uhid} · {patient.moduleIdLabel}: {patient.moduleId}
                  {subtitleLine ? ` · ${subtitleLine}` : ""}
                </p>
                {patient.causeOfProblem && (
                  <div className="mt-2 me-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-medium text-blue-800">
                    <Stethoscope className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <span className="truncate">Cause of problem: {patient.causeOfProblem}</span>
                  </div>
                )}
                {patient.allergies.length > 0 && (
                  <div className="mt-2 me-2 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                    <AlertTriangle className="h-3 w-3" />
                    Allergy: {patient.allergies.join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Actions — top right on desktop */}
            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:items-start">
              {headerActions}
              {showStatusSelector && statusOptions && onStatusChange && (
                <StatusSelector
                  status={status}
                  statusOptions={statusOptions}
                  currentStatusMeta={currentStatusMeta}
                  open={statusOpen}
                  onToggle={() => setStatusOpen((o) => !o)}
                  onSelect={(v) => {
                    onStatusChange(v);
                    setStatusOpen(false);
                  }}
                />
              )}
              {showPatientSwitcher && (
                <PatientSwitcher
                  open={switcherOpen}
                  onToggle={() => setSwitcherOpen((o) => !o)}
                  search={search}
                  setSearch={setSearch}
                  filteredPatients={filteredPatients}
                  patientCount={patientList.length}
                  currentUhid={patient.uhid}
                  onSelect={handleSelectPatient}
                />
              )}
            </div>
          </div>

          {/* Info grid (responsive) */}
          {shownInfo.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {shownInfo.map((f, i) => (
                <div key={i} className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {f.label}
                  </p>
                  <p
                    className={`mt-1 truncate text-sm ${
                      f.highlight ? "font-bold text-blue-600" : "font-semibold text-slate-800"
                    }`}
                  >
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Quick vitals strip */}
          {patient.quickVitals && patient.quickVitals.length > 0 && (
            <QuickVitalsStrip
              vitals={patient.quickVitals}
              className="border-t border-slate-100 pt-4"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusSelector({
  status,
  statusOptions,
  currentStatusMeta,
  open,
  onToggle,
  onSelect,
}: {
  status?: string;
  statusOptions: StatusOption[];
  currentStatusMeta?: StatusOption;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] ${currentStatusMeta?.color}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${currentStatusMeta?.dot}`} />
        <span className="max-w-[110px] truncate">{status}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Update Status
              </p>
            </div>
            <div className="p-1.5">
              {statusOptions.map((s) => {
                const active = s.value === status;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onSelect(s.value)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 hover:bg-slate-50 ${
                      active ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                    <span className="flex-1 text-left">{s.label}</span>
                    {active && <span className="text-xs font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PatientSwitcher({
  open,
  onToggle,
  search,
  setSearch,
  filteredPatients,
  patientCount,
  currentUhid,
  onSelect,
}: {
  open: boolean;
  onToggle: () => void;
  search: string;
  setSearch: (v: string) => void;
  filteredPatients: PatientListItem[];
  patientCount: number;
  currentUhid: string;
  onSelect: (uhid: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] ${
          open
            ? "border-blue-600 bg-blue-600 text-white shadow-md"
            : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md"
        }`}
      >
        <UserRound className="h-4 w-4" />
        <span className="hidden sm:inline">Switch Patient</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Select Patient
              </p>
              <button
                type="button"
                onClick={onToggle}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-b border-slate-100 p-2.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name / UHID / ID..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {filteredPatients.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-400">No patients found</p>
              ) : (
                filteredPatients.map((p) => {
                  const active = p.uhid === currentUhid;
                  return (
                    <button
                      key={p.uhid}
                      type="button"
                      onClick={() => onSelect(p.uhid)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 hover:bg-slate-50 ${
                        active ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {p.name}
                          </p>
                          {active && <Badge className="bg-blue-100 text-blue-700">Current</Badge>}
                        </div>
                        <p className="truncate text-xs text-slate-500">{p.subtitle}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-500">
              {patientCount} patients in list
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusPill({
  label,
  color,
  dot,
}: {
  label: string;
  color: string;
  dot: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function AcuityBadge({ acuity }: { acuity: string }) {
  if (acuity === "Critical")
    return <StatusPill label={acuity} color="border-red-200 bg-red-50 text-red-700" dot="bg-red-500" />;
  if (acuity === "Under Observation")
    return <StatusPill label={acuity} color="border-amber-200 bg-amber-50 text-amber-700" dot="bg-amber-500" />;
  return <StatusPill label={acuity} color="border-emerald-200 bg-emerald-50 text-emerald-700" dot="bg-emerald-500" />;
}
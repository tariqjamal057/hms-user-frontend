// app/(dashboard)/rmo/emergency/all-patients/_components/assignment-drawer.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  CheckCircle2,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { PillButton } from "@/components/forms/pill-button";
import { cn } from "@/lib/utils";
import type {
  AssignmentRole,
  AvailableDoctor,
  AvailableNurse,
  EmergencyDepartment,
  RmoEmergencyPatient,
} from "@/types/emergency/rmo-emergency-types";
import { RMO_DEPARTMENTS } from "@/lib/emergency/rmo-emergency-data";

const SHIFTS = ["Morning", "Evening", "Night"] as const;

export function AssignmentDrawer({
  patient,
  role,
  doctors,
  nurses,
  onClose,
  onAssign,
  onRoleChange,
}: {
  patient: RmoEmergencyPatient | null;
  role: AssignmentRole | null;
  doctors: AvailableDoctor[];
  nurses: AvailableNurse[];
  onClose: () => void;
  onAssign: (selection: AvailableDoctor | AvailableNurse, role: AssignmentRole) => void;
  onRoleChange?: (role: AssignmentRole) => void;
}) {
  const [activeRole, setActiveRole] = useState<AssignmentRole | null>(role);
  const [department, setDepartment] = useState<string>("All");
  const [shift, setShift] = useState<string>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setActiveRole(role);
  }, [role]);

  const open = Boolean(patient && activeRole);
  const isDoctor = activeRole === "Doctor";

  const existing = patient
    ? isDoctor
      ? patient.attendingDoctor ?? "Unassigned"
      : patient.assignedNurse ?? "Unassigned"
    : "Unassigned";

  const doctorRows = useMemo(
    () =>
      doctors.filter(
        (d) =>
          (department === "All" || d.department === (department as EmergencyDepartment)) &&
          d.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [doctors, department, query],
  );

  const nurseRows = useMemo(
    () =>
      nurses.filter(
        (n) =>
          (shift === "All" || n.shift === shift) &&
          n.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [nurses, shift, query],
  );

  const availableDoctorCount = useMemo(
    () => doctors.filter((d) => d.available && d.currentLoad < d.maxLoad).length,
    [doctors],
  );
  const availableNurseCount = useMemo(
    () => nurses.filter((n) => n.available && n.currentPatients < n.maxPatients).length,
    [nurses],
  );

  function handleRoleChange(next: AssignmentRole) {
    setActiveRole(next);
    setQuery("");
    onRoleChange?.(next);
  }

  function handleOpenChange(next: boolean) {
    if (!next) onClose();
  }

  function handleAssign(selection: AvailableDoctor | AvailableNurse) {
    if (!activeRole || !patient) return;
    onAssign(selection, activeRole);
    const roleLabel = activeRole === "Doctor" ? "doctor" : "nurse";
    toast.success(
      `${selection.name} has been assigned as ${roleLabel} to ${patient.patientName || "the patient"}.`,
    );
    onClose();
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={isDoctor ? <UserRoundCog className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
      accent={isDoctor ? "blue" : "violet"}
      title={`Assign ${isDoctor ? "Doctor" : "Nurse"}`}
      description={
        patient
          ? `${patient.patientName || "Unidentified Patient"} · ${patient.emergencyNumber} · ${patient.bedOrBay}`
          : ""
      }
      bodyClassName="space-y-4"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            Assignment is recorded as <span className="font-semibold text-slate-600">RMO</span> with a
            timestamp for the care team log.
          </p>
          <PillButton variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </PillButton>
        </div>
      }
    >
      {/* Role switch — one shared drawer for Doctor & Nurse assignment */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
        {(
          [
            { value: "Doctor", label: "Doctor", icon: UserRoundCog, count: availableDoctorCount },
            { value: "Nurse", label: "Nurse", icon: UserRound, count: availableNurseCount },
          ] as const
        ).map((opt) => {
          const selected = activeRole === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleRoleChange(opt.value as AssignmentRole)}
              aria-pressed={selected}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all",
                selected
                  ? opt.value === "Doctor"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm shadow-blue-500/30"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/30"
                  : "text-slate-500 hover:bg-white hover:text-slate-700",
              )}
            >
              <Icon className="h-4 w-4" />
              {opt.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  selected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600",
                )}
              >
                {opt.count} free
              </span>
            </button>
          );
        })}
      </div>

      {/* Current assignment */}
      <DrawerSection
        title="Current Assignment"
        caption={`${isDoctor ? "Attending doctor" : "Primary nurse"} assigned to this patient`}
        icon={isDoctor ? <Stethoscope className="h-4 w-4 text-blue-500" /> : <BadgeCheck className="h-4 w-4 text-violet-500" />}
        action={
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              existing === "Unassigned"
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700",
            )}
          >
            {existing === "Unassigned" ? "Unassigned" : "Assigned"}
          </span>
        }
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-800">
            {existing}
          </p>
          {patient &&
            (isDoctor ? patient.doctorAssignment : patient.nurseAssignment) && (
              <p className="text-[11px] text-slate-400">
                {isDoctor
                  ? `${patient.doctorAssignment?.assignedBy} · ${patient.doctorAssignment?.assignedAt}`
                  : `${patient.nurseAssignment?.assignedBy} · ${patient.nurseAssignment?.assignedAt}`}
              </p>
            )}
        </div>
      </DrawerSection>

      {/* Search & filter */}
      <DrawerSection
        title="Find Staff"
        caption={isDoctor ? "Filter by department or search by name" : "Filter by shift or search by name"}
        icon={<Search className="h-4 w-4 text-slate-400" />}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            placeholder={`Search ${isDoctor ? "doctor" : "nurse"}...`}
          />
        </div>

        {isDoctor ? (
          <div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="All">All Departments</SelectItem>
                {RMO_DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="All">All Shifts</SelectItem>
                {SHIFTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </DrawerSection>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {isDoctor ? "Available Doctors" : "Available Nurses"}
          </p>
          <span className="text-[11px] tabular-nums text-slate-400">
            {isDoctor ? doctorRows.length : nurseRows.length} shown
          </span>
        </div>

        {isDoctor ? (
          doctorRows.length > 0 ? (
            doctorRows.map((doctor) => (
              <StaffCard
                key={doctor.id}
                role="Doctor"
                name={doctor.name}
                primary={doctor.department}
                secondary={doctor.specialization}
                load={doctor.currentLoad}
                maxLoad={doctor.maxLoad}
                available={doctor.available && doctor.currentLoad < doctor.maxLoad}
                isAssigned={existing !== "Unassigned" && doctor.name === existing}
                onAssign={() => handleAssign(doctor)}
              />
            ))
          ) : (
            <EmptyRow text="No doctors match the selected filters." />
          )
        ) : nurseRows.length > 0 ? (
          nurseRows.map((nurse) => (
            <StaffCard
              key={nurse.id}
              role="Nurse"
              name={nurse.name}
              primary={`${nurse.shift} Shift`}
              secondary={nurse.ward}
              load={nurse.currentPatients}
              maxLoad={nurse.maxPatients}
              available={nurse.available && nurse.currentPatients < nurse.maxPatients}
              isAssigned={existing !== "Unassigned" && nurse.name === existing}
              onAssign={() => handleAssign(nurse)}
            />
          ))
        ) : (
          <EmptyRow text="No nurses match the selected filters." />
        )}
      </div>
    </ConsultationDrawer>
  );
}

function StaffCard({
  role,
  name,
  primary,
  secondary,
  load,
  maxLoad,
  available,
  isAssigned,
  onAssign,
}: {
  role: "Doctor" | "Nurse";
  name: string;
  primary: string;
  secondary: string;
  load: number;
  maxLoad: number;
  available: boolean;
  isAssigned: boolean;
  onAssign: () => void;
}) {
  const isDoctor = role === "Doctor";
  const pct = Math.min(100, Math.round((load / maxLoad) * 100));

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
        isAssigned
          ? isDoctor
            ? "border-blue-300 ring-1 ring-blue-200"
            : "border-violet-300 ring-1 ring-violet-200"
          : "border-slate-200",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm",
            isDoctor
              ? "bg-gradient-to-br from-blue-500 to-cyan-500"
              : "bg-gradient-to-br from-violet-500 to-purple-500",
          )}
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-bold text-slate-800">{name}</p>
            {isAssigned && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  isDoctor ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700",
                )}
              >
                <CheckCircle2 className="h-3 w-3" /> Currently Assigned
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">{primary}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="h-3 w-3" />
            {secondary}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isDoctor
                    ? pct >= 100
                      ? "bg-red-400"
                      : "bg-gradient-to-r from-blue-500 to-cyan-400"
                    : pct >= 100
                      ? "bg-red-400"
                      : "bg-gradient-to-r from-violet-500 to-purple-400",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-400">
              {load}/{maxLoad} {isDoctor ? "patients" : "patients"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <PillButton
          variant={available ? "gradient" : "outline"}
          disabled={!available}
          onClick={onAssign}
          className="flex-1"
          icon={available ? CheckCircle2 : undefined}
        >
          {available
            ? isAssigned
              ? "Reassign"
              : "Assign to Patient"
            : "Unavailable"}
        </PillButton>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold",
            available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400",
          )}
        >
          {available ? "Available" : pct >= 100 ? "At Capacity" : "Off Duty"}
        </span>
      </div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
      <Users className="h-5 w-5 text-slate-300" />
      <p className="mt-2 text-xs text-slate-400">{text}</p>
    </div>
  );
}

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Nurse)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
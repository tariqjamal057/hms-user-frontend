// app/(dashboard)/nurseAdmin/ipd/new-admissions/_components/assign-nurse-drawer.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  SunMedium,
  Sunset,
  MoonStar,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { DateField } from "@/components/forms/form-controls";
import { PillButton } from "@/components/forms/pill-button";
import type {
  AdmittedPatient,
  DailyShiftAssignment,
  ShiftName,
} from "@/types/nurse-admin/ipd/nurse-admin-types";
import {
  NURSE_DIRECTORY,
  SHIFTS,
} from "@/lib/nurse-admin/ipd/nurse-admin-data";

interface Props {
  patient: AdmittedPatient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (uhid: string, assignments: DailyShiftAssignment[]) => void;
}

const shiftIcon: Record<ShiftName, React.ElementType> = {
  Morning: SunMedium,
  Evening: Sunset,
  Night: MoonStar,
};
const shiftTone: Record<ShiftName, string> = {
  Morning: "border-amber-200 bg-amber-50 text-amber-700",
  Evening: "border-orange-200 bg-orange-50 text-orange-700",
  Night: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

function toIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function toDisplay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AssignNurseDrawer({ patient, open, onOpenChange, onSave }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => toIso(new Date()));
  const [draftByDate, setDraftByDate] = useState<Record<string, Record<ShiftName, string[]>>>({});

  useEffect(() => {
    if (patient) {
      setSelectedDate(toIso(new Date()));
      setDraftByDate({});
    }
  }, [patient]);

  const relevantNurses = useMemo(
    () => NURSE_DIRECTORY.filter((nurse) => nurse.ward === patient?.ward),
    [patient?.ward],
  );
  const otherNurses = useMemo(
    () => NURSE_DIRECTORY.filter((nurse) => nurse.ward !== patient?.ward),
    [patient?.ward],
  );

  function handleOpenChange(next: boolean) {
    if (!next) setDraftByDate({});
    onOpenChange(next);
  }

  function getShiftNurses(date: string, shift: ShiftName): string[] {
    if (draftByDate[date]?.[shift]) return draftByDate[date][shift];
    const existing = patient?.assignments.find((a) => a.date === date && a.shift === shift);
    return existing?.nurseIds ?? [];
  }

  function toggleNurse(date: string, shift: ShiftName, nurseId: string) {
    setDraftByDate((previous) => {
      const currentDay = previous[date] ?? {
        Morning: getShiftNurses(date, "Morning"),
        Evening: getShiftNurses(date, "Evening"),
        Night: getShiftNurses(date, "Night"),
      };
      const currentShiftList = currentDay[shift] ?? [];
      const updatedShiftList = currentShiftList.includes(nurseId)
        ? currentShiftList.filter((id) => id !== nurseId)
        : [...currentShiftList, nurseId];
      return {
        ...previous,
        [date]: { ...currentDay, [shift]: updatedShiftList },
      };
    });
  }

  function shiftDate(days: number) {
    const next = new Date(`${selectedDate}T12:00:00`);
    next.setDate(next.getDate() + days);
    setSelectedDate(toIso(next));
  }

  function handleSaveAll() {
    if (!patient) return;
    const merged: DailyShiftAssignment[] = [];
    const seenKeys = new Set<string>();

    patient.assignments.forEach((a) => {
      const key = `${a.date}-${a.shift}`;
      if (!draftByDate[a.date]) {
        merged.push(a);
        seenKeys.add(key);
      }
    });

    Object.entries(draftByDate).forEach(([date, shiftsMap]) => {
      SHIFTS.forEach((shift) => {
        const key = `${date}-${shift.name}`;
        if (seenKeys.has(key)) return;
        merged.push({
          date,
          shift: shift.name,
          nurseIds: shiftsMap[shift.name] ?? [],
        });
        seenKeys.add(key);
      });
    });

    onSave(patient.uhid, merged);
    handleOpenChange(false);
  }

  const totalAssignedToday = patient
    ? SHIFTS.reduce((sum, shift) => sum + getShiftNurses(selectedDate, shift.name).length, 0)
    : 0;

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={
        <UserRoundPlus className="h-5 w-5" aria-hidden />
      }
      title={patient ? `Assign Nurses` : "Assign Nurses"}
      description={
        patient
          ? `${patient.patientName} · ${patient.uhid} · ${patient.ward} · ${patient.room} · ${patient.bed}`
          : undefined
      }
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <PillButton
            variant="outline"
            className="flex-1"
            onClick={handleOpenChange.bind(null, false)}
          >
            Cancel
          </PillButton>
          <PillButton
            icon={Save}
            className="flex-1"
            onClick={handleSaveAll}
            disabled={!patient || Object.keys(draftByDate).length === 0}
          >
            Save Assignment
          </PillButton>
        </div>
      }
    >
      {/* Date selector */}
      <DrawerSection
        title="Select Date"
        caption={`${toDisplay(selectedDate)} · ${totalAssignedToday} nurse assignment(s) across all shifts`}
        icon={<CalendarDays className="h-4 w-4 text-blue-600" aria-hidden />}
      >
        <div className="flex items-center gap-2">
          <PillButton
            variant="outline"
            size="sm"
            icon={ChevronLeft}
            onClick={() => shiftDate(-1)}
            className="shrink-0 px-2"
          >
            Prev
          </PillButton>
          <DateField
            label=""
            value={selectedDate}
            onChange={setSelectedDate}
            className="flex-1"
          />
          <PillButton
            variant="outline"
            size="sm"
            onClick={() => shiftDate(1)}
            className="shrink-0 px-3"
          >
            Next
          </PillButton>
        </div>
      </DrawerSection>

      {/* Shift-wise assignment */}
      {SHIFTS.map((shift) => {
        const Icon = shiftIcon[shift.name];
        const assignedIds = patient ? getShiftNurses(selectedDate, shift.name) : [];
        return (
          <DrawerSection
            key={shift.name}
            title={`${shift.name} Shift`}
            caption={shift.timeRange}
            icon={<Icon className="h-4 w-4 text-slate-400" aria-hidden />}
            action={
              <Badge variant="outline" className={shiftTone[shift.name]}>
                {shift.timeRange}
              </Badge>
            }
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {relevantNurses.map((nurse) => {
                const selected = assignedIds.includes(nurse.id);
                return (
                  <NurseToggle
                    key={nurse.id}
                    selected={selected}
                    onClick={() => toggleNurse(selectedDate, shift.name, nurse.id)}
                    name={nurse.name}
                    subtitle={nurse.designation}
                    avatarColor={nurse.avatarColor}
                  />
                );
              })}
            </div>

            {otherNurses.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-blue-600">
                  Show nurses from other wards
                </summary>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {otherNurses.map((nurse) => {
                    const selected = assignedIds.includes(nurse.id);
                    return (
                      <NurseToggle
                        key={nurse.id}
                        selected={selected}
                        onClick={() => toggleNurse(selectedDate, shift.name, nurse.id)}
                        name={nurse.name}
                        subtitle={`${nurse.designation} · ${nurse.ward}`}
                        avatarColor={nurse.avatarColor}
                      />
                    );
                  })}
                </div>
              </details>
            )}
          </DrawerSection>
        );
      })}

      {/* Assignment summary across touched dates */}
      {Object.keys(draftByDate).length > 0 && (
        <DrawerSection
          title={`Unsaved changes for ${Object.keys(draftByDate).length} date(s)`}
          icon={<UserRound className="h-4 w-4 text-blue-600" aria-hidden />}
        >
          <div className="flex flex-wrap gap-2">
            {Object.keys(draftByDate)
              .sort()
              .map((date) => (
                <Badge key={date} variant="outline" className="border-blue-200 bg-white text-blue-700">
                  {toDisplay(date)}
                </Badge>
              ))}
          </div>
        </DrawerSection>
      )}
    </ConsultationDrawer>
  );
}

function NurseToggle({
  selected,
  onClick,
  name,
  subtitle,
  avatarColor,
}: {
  selected: boolean;
  onClick: () => void;
  name: string;
  subtitle: string;
  avatarColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition",
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 hover:border-blue-200 hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
          avatarColor,
        )}
      >
        {name.split(" ")[1]?.charAt(0) ?? name.charAt(0)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-800">{name}</span>
        <span className="block truncate text-xs text-slate-400">{subtitle}</span>
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />}
    </button>
  );
}
// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-assigned-nurses.tsx
"use client";
import { useMemo, useState } from "react";
import { Calendar1, Check, ChevronDown, ChevronUp, Lock, Moon, Plus, Sunrise, Sunset, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import { SectionHeader } from "./section-header";
import type { DailyShiftAssignment, ShiftName } from "@/types/nurse-admin/ipd/nurse-admin-types";
import { NURSE_DIRECTORY, SHIFTS } from "@/lib/nurse-admin/ipd/nurse-admin-data";
import { getNurseName } from "@/lib/nurse-admin/ipd/ward-detail-data";

const shiftIcon: Record<ShiftName, React.ElementType> = { Morning: Sunrise, Evening: Sunset, Night: Moon };

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function toDisplay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  ward: string;
  assignments: DailyShiftAssignment[];
  onUpdateAssignments: (assignments: DailyShiftAssignment[]) => void;
}

export function SectionAssignedNurses({ ward, assignments, onUpdateAssignments }: Props) {
  const today = todayIso();
  const [extendedDays, setExtendedDays] = useState<string[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [expandedPast, setExpandedPast] = useState(false);

  const relevantNurses = useMemo(() => NURSE_DIRECTORY.filter((n) => n.ward === ward), [ward]);

  const allDates = useMemo(() => {
    const set = new Set<string>(assignments.map((a) => a.date));
    extendedDays.forEach((d) => set.add(d));
    return Array.from(set).sort();
  }, [assignments, extendedDays]);

  const pastDates = allDates.filter((d) => d < today);
  const futureDates = allDates.filter((d) => d >= today);
  const lastFutureDate = futureDates[futureDates.length - 1] ?? addDays(today, -1);

  function getNursesFor(date: string, shift: ShiftName) {
    return assignments.find((a) => a.date === date && a.shift === shift)?.nurseIds ?? [];
  }

  function toggleNurse(date: string, shift: ShiftName, nurseId: string) {
    const existing = getNursesFor(date, shift);
    const updated = existing.includes(nurseId) ? existing.filter((id) => id !== nurseId) : [...existing, nurseId];
    const withoutThis = assignments.filter((a) => !(a.date === date && a.shift === shift));
    onUpdateAssignments([...withoutThis, { date, shift, nurseIds: updated }]);
  }

  function extendMoreDays(count: number) {
    const newDays: string[] = [];
    for (let i = 1; i <= count; i++) newDays.push(addDays(lastFutureDate, i));
    setExtendedDays((previous) => Array.from(new Set([...previous, ...newDays])));
    setEditingDate(newDays[0]);
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<UserCog className="h-5 w-5" />}
        title="Assigned Nurses"
        subtitle="Past assignments are locked for audit. Today and future shifts can be edited."
      />

      {pastDates.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <button className="flex w-full items-center justify-between text-left" onClick={() => setExpandedPast((v) => !v)}>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><Lock className="h-4 w-4 text-slate-400" />Previous Days ({pastDates.length}) — Locked</p>
            {expandedPast ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {expandedPast && (
            <div className="mt-3 space-y-3">
              {pastDates.map((date) => (
                <div key={date} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Calendar1 className="h-3.5 w-3.5" />{toDisplay(date)}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {SHIFTS.map((shift) => {
                      const ids = getNursesFor(date, shift.name);
                      return (
                        <div key={shift.name} className="rounded-lg border border-slate-200 bg-white p-2">
                          <p className="text-[10px] uppercase text-slate-400">{shift.name}</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-700">{ids.length > 0 ? ids.map((id) => getNurseName(id)).join(", ") : "Unassigned"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800"><UserCog className="h-4 w-4" />Today & Future Days — Editable</p>
        <div className="space-y-3">
          {futureDates.map((date) => (
            <div key={date} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800"><Calendar1 className="h-4 w-4 text-blue-600" />{toDisplay(date)}{date === today && <Badge variant="outline" className="ml-1 border-blue-200 bg-blue-50 text-blue-700">Today</Badge>}</p>
                <PillButton size="sm" variant="outline" onClick={() => setEditingDate(editingDate === date ? null : date)}>{editingDate === date ? "Done" : "Edit"}</PillButton>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SHIFTS.map((shift) => {
                  const Icon = shiftIcon[shift.name];
                  const ids = getNursesFor(date, shift.name);
                  return (
                    <div key={shift.name} className="rounded-lg border border-slate-100 p-2.5">
                      <p className="flex items-center gap-1 text-[10px] uppercase text-slate-400"><Icon className="h-3 w-3" />{shift.name}</p>
                      {editingDate === date ? (
                        <div className="mt-2 space-y-1.5">
                          {relevantNurses.map((nurse) => {
                            const selected = ids.includes(nurse.id);
                            return (
                              <button key={nurse.id} onClick={() => toggleNurse(date, shift.name, nurse.id)} className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs ${selected ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                                {nurse.name}{selected && <Check className="h-3.5 w-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs font-semibold text-slate-700">{ids.length > 0 ? ids.map((id) => getNurseName(id)).join(", ") : "Unassigned"}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {futureDates.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No upcoming assignments yet. Extend the roster to add nurses.</p>}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <PillButton size="sm" variant="outline" className="gap-2 border-blue-300 text-blue-700" onClick={() => extendMoreDays(5)}><Plus className="h-4 w-4" />Extend Roster by 5 Days</PillButton>
          <PillButton size="sm" variant="outline" className="gap-2 border-blue-300 text-blue-700" onClick={() => extendMoreDays(1)}><Plus className="h-4 w-4" />Add 1 More Day</PillButton>
        </div>
      </div>
    </div>
  );
}
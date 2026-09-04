// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-assigned-nurses.tsx
"use client";
import { useMemo, useState } from "react";
import { Moon, Sunrise, Sunset, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ShiftAssignment, ShiftName } from "@/types/rmo/ipd/rmo-types";
import { DateField } from "@/components/forms/form-controls";

const shiftIcon: Record<ShiftName, React.ElementType> = { Morning: Sunrise, Evening: Sunset, Night: Moon };
const shiftTone: Record<ShiftName, string> = {
  Morning: "border-amber-200 bg-amber-50 text-amber-700",
  Evening: "border-orange-200 bg-orange-50 text-orange-700",
  Night: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export function SectionAssignedNurses({ assignments }: { assignments: ShiftAssignment[] }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(() => date ? assignments.filter((a) => a.date === date) : assignments, [assignments, date]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, ShiftAssignment[]>();
    filtered.forEach((a) => { const rows = map.get(a.date) ?? []; rows.push(a); map.set(a.date, rows); });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><UserCog className="h-4 w-4 text-blue-600" />Assigned Nurses</p>
        <p className="mt-1 text-xs text-slate-500">Read-only view of nurse assignments — managed by the Nurse Admin.</p>
        <div className="mt-3"><DateField label="Filter by date" value={date} onChange={setDate} /></div>
      </div>

      <div className="space-y-3">
        {groupedByDate.map(([groupDate, rows]) => (
          <div key={groupDate} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-sm font-bold text-slate-700">{new Date(`${groupDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {rows.map((assignment) => {
                const Icon = shiftIcon[assignment.shift];
                return (
                  <div key={assignment.shift} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <Badge variant="outline" className={`gap-1 ${shiftTone[assignment.shift]}`}><Icon className="h-3 w-3" />{assignment.shift}</Badge>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{assignment.nurseNames.join(", ") || "Unassigned"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {groupedByDate.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No nurse assignments found.</div>}
      </div>
    </div>
  );
}
// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-shift-handover.tsx
"use client";
import { useMemo, useState } from "react";
import { ArrowRightLeft, UserRound } from "lucide-react";
import type { ShiftHandoverEntry } from "@/types/rmo/ipd/rmo-types";
import { DateField } from "@/components/forms/form-controls";

export function SectionShiftHandover({ handovers }: { handovers: ShiftHandoverEntry[] }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(() => date ? handovers.filter((h) => h.handoverDateTime.startsWith(date)) : handovers, [handovers, date]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><ArrowRightLeft className="h-4 w-4 text-blue-600" />Shift Handover Logs</p>
        <p className="mt-1 text-xs text-slate-500">When a nurse hands over the shift to the next nurse, with date and time.</p>
        <div className="mt-3"><DateField label="Filter by date" value={date} onChange={setDate} /></div>
      </div>

      <div className="space-y-3">
        {filtered.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1 font-semibold text-slate-800"><UserRound className="h-3.5 w-3.5 text-slate-400" />{entry.fromNurse}</span>
              <span className="text-xs text-slate-400">({entry.fromShift})</span>
              <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500" />
              <span className="flex items-center gap-1 font-semibold text-slate-800"><UserRound className="h-3.5 w-3.5 text-slate-400" />{entry.toNurse}</span>
              <span className="text-xs text-slate-400">({entry.toShift})</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{entry.handoverDateTime}</p>
            {entry.notes && <p className="mt-2 text-sm italic text-slate-600">&quot;{entry.notes}&quot;</p>}
          </div>
        ))}
        {filtered.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No shift handovers recorded.</div>}
      </div>
    </div>
  );
}
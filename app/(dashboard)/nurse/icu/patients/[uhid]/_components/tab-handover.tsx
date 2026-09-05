// app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-handover.tsx
"use client";

import { ArrowRightLeft, ClipboardList } from "lucide-react";
import type {
  EmarDose,
  FluidBalanceEntry,
  NurseIpdPatient,
  ProgressNote,
  ShiftHandoverEntry,
  VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";
import { HandoverSnapshot } from "./handover-snapshot";
import { TabShiftHandover } from "../../../../ipd/patients/[uhid]/_components/tab-shift-handover";

type TabHandoverProps = {
  patient: NurseIpdPatient;
  vitals: VitalRecord[];
  doses: EmarDose[];
  notes: ProgressNote[];
  fluidEntries: FluidBalanceEntry[];
  handovers?: ShiftHandoverEntry[];
  onHandover?: (entry: ShiftHandoverEntry) => void;
};

/**
 * ICU "Handover" tab — combines the at-a-glance Handover Snapshot for the
 * incoming team with the shift handover log/form when performed by a nurse.
 */
export function TabHandover({
  patient,
  vitals,
  doses,
  notes,
  fluidEntries,
  handovers,
  onHandover,
}: TabHandoverProps) {
  return (
    <div className="space-y-5">
      <HandoverSnapshot
        patient={patient}
        vitals={vitals}
        doses={doses}
        notes={notes}
        fluidEntries={fluidEntries}
      />

      {handovers && onHandover && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 px-1">
            <ArrowRightLeft className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Shift Handover Log & Form
            </p>
          </div>
          <TabShiftHandover handovers={handovers} onHandover={onHandover} />
        </div>
      )}
    </div>
  );
}
// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-shift-handover.tsx
"use client";
import { useState } from "react";
import { ArrowRightLeft, CheckCircle2, UserRound } from "lucide-react";
import { SingleSelect } from "@/components/forms/select";
import { FormTextarea } from "@/components/forms/form-controls";
import { PillButton } from "@/components/forms/pill-button";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import type { ShiftHandoverEntry } from "@/types/nurse/ipd/nurse-ipd-types";
import { AVAILABLE_NEXT_SHIFT_NURSES, CURRENT_NURSE } from "@/lib/nurse/ipd/nurse-ipd-data";

export function TabShiftHandover({ handovers, onHandover }: { handovers: ShiftHandoverEntry[]; onHandover: (entry: ShiftHandoverEntry) => void }) {
  const [nextNurse, setNextNurse] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit() {
    if (!nextNurse) return;
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const [name, shiftPart] = nextNurse.split(" (");
    onHandover({
      id: `H-${Date.now()}`, fromNurse: CURRENT_NURSE.name, fromShift: CURRENT_NURSE.shift,
      toNurse: name, toShift: shiftPart?.replace(")", "") ?? "", handoverDateTime: stamp, notes: notes.trim() || undefined,
    });
    setDone(true);
    setTimeout(() => setDone(false), 3000);
    setNextNurse(""); setNotes("");
  }

  const columns: DataColumn<ShiftHandoverEntry>[] = [
    {
      key: "from",
      label: "Handover From",
      render: (e) => (
        <div>
          <p className="flex items-center gap-1 font-semibold text-slate-800"><UserRound className="h-3.5 w-3.5 text-slate-400" />{e.fromNurse}</p>
          <p className="text-xs text-slate-400">{e.fromShift}</p>
        </div>
      ),
    },
    {
      key: "to",
      label: "Handover To",
      render: (e) => (
        <div>
          <p className="flex items-center gap-1 font-semibold text-slate-800"><UserRound className="h-3.5 w-3.5 text-slate-400" />{e.toNurse}</p>
          <p className="text-xs text-slate-400">{e.toShift}</p>
        </div>
      ),
    },
    {
      key: "when",
      label: "Handover Time",
      render: (e) => <span className="text-sm text-slate-600">{e.handoverDateTime}</span>,
    },
    {
      key: "notes",
      label: "Notes",
      render: (e) =>
        e.notes ? (
          <span className="max-w-[280px] whitespace-normal text-xs italic text-slate-600">&quot;{e.notes}&quot;</span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <ArrowRightLeft className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">Shift Handover</p>
            <p className="text-xs text-slate-500">
              Handing over from <span className="font-semibold text-slate-700">{CURRENT_NURSE.name}</span> ({CURRENT_NURSE.shift})
            </p>
          </div>
        </div>
      </div>

      {/* Handover form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="space-y-4">
          <SingleSelect
            label="Handover To (Next Shift Nurse) *"
            value={nextNurse}
            onChange={setNextNurse}
            placeholder="Select next shift nurse"
            options={AVAILABLE_NEXT_SHIFT_NURSES.map((nurse) => ({ value: nurse, label: nurse }))}
          />
          <FormTextarea
            label="Handover Notes (Optional)"
            value={notes}
            onChange={setNotes}
            rows={3}
            maxLength={300}
            placeholder="Any specific instructions or observations for the next shift..."
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <PillButton variant="gradient" icon={ArrowRightLeft} onClick={handleSubmit} disabled={!nextNurse}>
              Complete Handover
            </PillButton>
            {done && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />Handover completed successfully.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Handover history — unified DataTable */}
      <DataTable
        card
        title="Handover History"
        titleIcon={<UserRound className="h-4 w-4" />}
        rows={handovers}
        columns={columns}
        rowKey={(e) => e.id}
        countLabel="handovers"
        emptyText="No shift handovers recorded for this patient yet."
      />
    </div>
  );
}
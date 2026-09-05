// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-handover.tsx
"use client";

import { useState } from "react";
import { ArrowRightLeft, UserRound } from "lucide-react";
import { SingleSelect } from "@/components/forms/select";
import { FormTextarea } from "@/components/forms/form-controls";
import { PillButton } from "@/components/forms/pill-button";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import type { OtHandoverEntry } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";

const OT_HANDOVER_TARGETS = [
  { value: "ICU Nurse Kavita ( Intensivist Team )", label: "ICU Nurse Kavita — Intensivist Team" },
  { value: "ICU Nurse Anjali ( Intensivist Team )", label: "ICU Nurse Anjali — Intensivist Team" },
  { value: "Ward Nurse Priya ( General Ward )", label: "Ward Nurse Priya — General Ward" },
  { value: "Recovery Nurse Meena ( PACU )", label: "Recovery Nurse Meena — PACU" },
];

export function TabHandover({
  handovers,
  onAdd,
}: {
  handovers: OtHandoverEntry[];
  onAdd: (entry: OtHandoverEntry) => void;
}) {
  const [target, setTarget] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit() {
    if (!target) return;
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    onAdd({
      id: `OH-${Date.now()}`,
      toStaff: target.split(" — ")[0],
      toRole: target.split(" — ")[1] ?? "",
      handoverDateTime: stamp,
      notes: notes.trim() || undefined,
    });
    setTarget("");
    setNotes("");
  }

  const columns: DataColumn<OtHandoverEntry>[] = [
    { key: "to", label: "Handover To", render: (h) => <div><p className="font-semibold text-slate-800">{h.toStaff}</p><p className="text-xs text-slate-400">{h.toRole}</p></div> },
    { key: "time", label: "Time", render: (h) => <span className="text-slate-600">{h.handoverDateTime}</span> },
    { key: "notes", label: "Notes", render: (h) => <span className="text-slate-600">{h.notes ?? "—"}</span>, hideOnMobile: true },
  ];

  return (
    <div className="space-y-5">
      <OtSectionHeader icon={<ArrowRightLeft className="h-5 w-5" />} title="OT Handover" subtitle="Hand the patient over to Recovery / ICU / Ward after the procedure" tone="from-teal-500 to-emerald-600" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <UserRound className="h-4 w-4 text-teal-600" /> Hand Over Patient
        </p>
        <div className="space-y-3">
          <SingleSelect
            label="To (Teams)"
            options={OT_HANDOVER_TARGETS}
            value={target}
            onChange={setTarget}
            placeholder="Select receiving team..."
          />
          <FormTextarea label="Handover Notes" value={notes} onChange={setNotes} placeholder="E.g. puncture site, drains, monitoring to continue..." rows={3} />
          <PillButton icon={ArrowRightLeft} onClick={handleSubmit} disabled={!target}>
            Hand Over
          </PillButton>
        </div>
      </div>

      <DataTable card title="Handover Log" titleIcon={<ArrowRightLeft className="h-4 w-4" />} rows={handovers} columns={columns} rowKey={(h) => h.id} countLabel="handovers" emptyText="No handover recorded yet." />
    </div>
  );
}
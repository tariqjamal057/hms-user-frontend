// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-diagnosis.tsx
"use client";
import { useState } from "react";
import { Plus, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiagnosisDrawer, type DiagnosisDraft } from "@/components/consultation/diagnosis-drawer";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { PillButton } from "@/components/forms/pill-button";
import type { DiagnosisEntry } from "@/types/rmo/ipd/rmo-types";
import { CURRENT_RMO } from "@/lib/rmo/ipd/rmo-data";

const TYPE_CLASS: Record<DiagnosisEntry["type"], string> = {
  Confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Provisional: "border-amber-200 bg-amber-50 text-amber-700",
  Differential: "border-slate-200 bg-slate-50 text-slate-600",
};

const DRAFT_TYPE: Record<DiagnosisDraft["type"], DiagnosisEntry["type"]> = {
  provisional: "Provisional",
  active: "Confirmed",
  chronic: "Differential",
};

export function SectionDiagnosis({ diagnoses, onAddDiagnosis }: { diagnoses: DiagnosisEntry[]; onAddDiagnosis: (entry: DiagnosisEntry) => void }) {
  const [open, setOpen] = useState(false);

  function handleSubmit(drafts: DiagnosisDraft[]) {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    drafts.forEach((d) =>
      onAddDiagnosis({
        id: `DG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: d.name,
        code: d.icd10,
        type: DRAFT_TYPE[d.type],
        addedBy: CURRENT_RMO.name,
        addedAt: stamp,
      }),
    );
    setOpen(false);
  }

  const columns: DataColumn<DiagnosisEntry>[] = [
    {
      key: "diagnosis",
      label: "Diagnosis",
      render: (d, index) => (
        <div>
          <div className="flex items-center gap-2">
            {index === 0 && <Badge className="bg-violet-600 text-white">Current</Badge>}
            <span className="font-semibold text-slate-800">{d.name}</span>
          </div>
          <p className="text-xs text-slate-400">ICD-10: {d.code}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (d) => (
        <Badge variant="outline" className={TYPE_CLASS[d.type]}>{d.type}</Badge>
      ),
    },
    {
      key: "notes",
      label: "Clinical Notes",
      render: (d) => <span className="text-slate-600">{d.notes ?? "—"}</span>,
    },
    {
      key: "added",
      label: "Added By",
      render: (d) => (
        <span className="text-xs text-slate-500">
          <span className="font-medium">{d.addedBy}</span>
          <br />
          <span className="text-[10px] text-slate-400">{d.addedAt}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">Diagnosis</p>
            <p className="text-xs text-slate-500">Most recent diagnosis is shown first. All entries remain in the patient&apos;s history.</p>
          </div>
        </div>
        <PillButton icon={Plus} onClick={() => setOpen(true)} className="self-start sm:self-auto">
          Add Diagnosis
        </PillButton>
      </div>

      <DataTable
        card
        title="Diagnosis Details"
        titleIcon={<Stethoscope className="h-4 w-4" />}
        rows={diagnoses}
        columns={columns}
        rowKey={(d) => d.id}
        countLabel="diagnoses"
        emptyText="No diagnosis recorded yet."
      />

      <DiagnosisDrawer open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </div>
  );
}
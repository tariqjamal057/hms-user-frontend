// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-procedure.tsx
"use client";

import {
  ClipboardList,
  FileText,
  FlaskConical,
  Scissors,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { ProcedureRecord } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";
import { Badge } from "@/components/ui/badge";

export function TabProcedure({ record }: { record?: ProcedureRecord }) {
  if (!record) {
    return (
      <>
        <OtSectionHeader icon={<Scissors className="h-5 w-5" />} title="Procedure & Intra-Operative Notes" subtitle="Procedure details, findings and intra-operative documentation" tone="from-rose-500 to-red-500" />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <Scissors className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">No procedure record entered yet.</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <OtSectionHeader
        icon={<Scissors className="h-5 w-5" />}
        title="Procedure & Intra-Operative Notes"
        subtitle={record.procedureName}
        tone="from-rose-500 to-red-500"
        right={<Badge variant="outline" className="border-slate-200 bg-white text-slate-600">{record.documentedBy}</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard title="Start" icon={<ClipboardList className="h-3.5 w-3.5" />} tone="blue" value={record.startedAt ?? "—"} />
        <InfoTileCard title="End" icon={<ClipboardList className="h-3.5 w-3.5" />} tone="purple" value={record.endedAt ?? "—"} />
        <InfoTileCard title="Surgeons" icon={<UserRound className="h-3.5 w-3.5" />} tone="slate" value={record.surgeons.join(", ")} />
        <InfoTileCard title="Specimen" icon={<FlaskConical className="h-3.5 w-3.5" />} tone="amber" value={record.specimenRemoved || "None"} />
      </div>

      {record.complications && record.complications.toLowerCase() !== "none" && (
        <InfoAlertCard
          tone="red"
          icon={<Stethoscope className="h-4 w-4" />}
          title="Intra-Operative Complication"
          body={record.complications}
        />
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InfoTileCard title="Findings" icon={<ClipboardList className="h-3.5 w-3.5" />} tone="emerald" value={record.findings} multiline />
        <InfoTileCard title="Notes" icon={<FileText className="h-3.5 w-3.5" />} tone="cyan" value={record.notes} multiline />
      </div>
    </div>
  );
}
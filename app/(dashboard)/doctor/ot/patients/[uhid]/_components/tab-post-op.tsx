// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-post-op.tsx
"use client";

import {
  Activity,
  Bed,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  HeartPulse,
  Stethoscope,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { PostOpNote, RecoveryAssessment } from "@/types/doctor/ot/ot-types";
import { cn } from "@/lib/utils";
import { OtSectionHeader } from "./ot-section-header";

/* ---------- Post-Operative Notes ---------- */

export function TabPostOp({ note }: { note?: PostOpNote }) {
  if (!note) {
    return (
      <>
        <OtSectionHeader icon={<ClipboardList className="h-5 w-5" />} title="Post-Operative Notes" subtitle="Immediate post-procedure summary and instructions" tone="from-fuchsia-500 to-pink-600" />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <ClipboardList className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">No post-operative note entered yet.</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <OtSectionHeader icon={<ClipboardList className="h-5 w-5" />} title="Post-Operative Notes" subtitle={`${note.documentedBy} · ${note.documentedAt}`} tone="from-fuchsia-500 to-pink-600" />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InfoTileCard title="Patient Condition" icon={<HeartPulse className="h-3.5 w-3.5" />} tone="emerald" value={note.patientCondition} subtitle={`Vitals: ${note.vitals}`} multiline />
        <InfoTileCard title="Wound Status" icon={<Stethoscope className="h-3.5 w-3.5" />} tone="rose" value={note.woundStatus} />
        <InfoTileCard title="Medications" icon={<ClipboardList className="h-3.5 w-3.5" />} tone="blue" value={note.medications} />
        <InfoTileCard title="Instructions" icon={<FileText className="h-3.5 w-3.5" />} tone="cyan" value={note.instructions} multiline />
      </div>
    </div>
  );
}

/* ---------- Recovery / PACU ---------- */

export function TabRecovery({
  assessment,
  onTransfer,
}: {
  assessment?: RecoveryAssessment;
  onTransfer?: (destination: string) => void;
}) {
  if (!assessment) {
    return (
      <>
        <OtSectionHeader icon={<Bed className="h-5 w-5" />} title="Recovery / PACU" subtitle="Post-anesthesia recovery assessment" tone="from-cyan-500 to-teal-600" />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <Bed className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">No recovery assessment yet.</p>
        </div>
      </>
    );
  }

  const criteriaMet = assessment.dischargeCriteriaMet;

  return (
    <div className="space-y-5">
      <OtSectionHeader
        icon={<Bed className="h-5 w-5" />}
        title="Recovery / PACU"
        subtitle={`${assessment.assessedBy} · ${assessment.assessedAt}`}
        tone="from-cyan-500 to-teal-600"
        right={
          criteriaMet ? (
            <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Discharge Criteria Met
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Still in Recovery</Badge>
          )
        }
      />

      {!criteriaMet && (
        <InfoAlertCard
          tone="amber"
          icon={<Activity className="h-4 w-4" />}
          title="Patient Not Yet Ready for Discharge from PACU"
          body="Continue monitoring until discharge criteria are met before transferring to the ward / ICU."
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <InfoTileCard title="GCS" icon={<Gauge className="h-3.5 w-3.5" />} tone="blue" value={`${assessment.gcs}/15`} />
        <InfoTileCard title="Pain" icon={<HeartPulse className="h-3.5 w-3.5" />} tone="rose" value={`${assessment.painScore}/10`} />
        <InfoTileCard title="SpO₂" icon={<Wind className="h-3.5 w-3.5" />} tone="cyan" value={`${assessment.spo2}%`} />
        <InfoTileCard title="BP" icon={<Activity className="h-3.5 w-3.5" />} tone="red" value={assessment.bp} />
        <InfoTileCard title="Pulse" icon={<HeartPulse className="h-3.5 w-3.5" />} tone="rose" value={`${assessment.pulse}/min`} />
        <InfoTileCard title="Awareness" icon={<Gauge className="h-3.5 w-3.5" />} tone="purple" value={assessment.awareness} subtitle={assessment.airway} />
      </div>

      {onTransfer && (
        <div className="flex flex-wrap gap-2">
          {["Ward Transfer", "ICU Transfer"].map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => onTransfer(dest)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90",
                dest === "ICU Transfer" ? "bg-gradient-to-r from-rose-500 to-red-600" : "bg-gradient-to-r from-indigo-500 to-blue-600",
              )}
            >
              {dest} →
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
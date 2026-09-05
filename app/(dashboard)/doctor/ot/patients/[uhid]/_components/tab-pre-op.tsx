// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-pre-op.tsx
"use client";

import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  FileSignature,
  ShieldCheck,
  Stethoscope,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { PreOpAssessment } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";

export function TabPreOp({ assessment, onNext }: { assessment?: PreOpAssessment; onNext?: () => void }) {
  if (!assessment) {
    return (
      <>
        <OtSectionHeader
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="Pre-Operative Assessment"
          subtitle="Assessment, consent and baseline evaluation"
          tone="from-teal-500 to-emerald-600"
        />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <ClipboardCheck className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">No pre-operative assessment recorded yet.</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <OtSectionHeader
        icon={<ClipboardCheck className="h-5 w-5" />}
        title="Pre-Operative Assessment"
        subtitle={`${assessment.assessedBy} · ${assessment.assessedAt} · ${assessment.procedure}`}
        tone="from-teal-500 to-emerald-600"
        right={
          <Badge variant="outline" className={assessment.consentTaken ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
            {assessment.consentTaken ? <CheckCircle2 className="h-3 w-3" /> : null}
            {assessment.consentTaken ? "Consent Signed" : "Consent Pending"}
          </Badge>
        }
      />

      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
        >
          Open Surgical Safety →
        </button>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTileCard title="Consent" icon={<FileSignature className="h-3.5 w-3.5" />} tone="emerald" value={assessment.consentSignedBy} subtitle="Consent signed by" />
        <InfoTileCard title="Fasting Since" icon={<Utensils className="h-3.5 w-3.5" />} tone="amber" value={assessment.fastingFrom} subtitle="Nil by mouth start" />
        <InfoTileCard title="Risk Score" icon={<ShieldCheck className="h-3.5 w-3.5" />} tone="red" value={assessment.riskScore} subtitle="ASA grade" />
        {assessment.comorbidConditions.length > 0 && (
          <InfoTileCard title="Co-morbidities" icon={<Activity className="h-3.5 w-3.5" />} tone="purple" value={assessment.comorbidConditions.join(", ")} subtitle="Documented conditions" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard title="Baseline BP" icon={<Activity className="h-3.5 w-3.5" />} tone="blue" value={assessment.baselineBp} subtitle="mmHg" />
        <InfoTileCard title="Baseline Pulse" icon={<Activity className="h-3.5 w-3.5" />} tone="rose" value={assessment.baselinePulse} subtitle="per min" />
        <InfoTileCard title="Baseline SpO₂" icon={<Activity className="h-3.5 w-3.5" />} tone="cyan" value={assessment.baselineSpo2} subtitle="% on room air" />
        <InfoTileCard title="Baseline Temp" icon={<Stethoscope className="h-3.5 w-3.5" />} tone="amber" value={assessment.baselineTemp} subtitle="°F" />
      </div>

      {assessment.notes && (
        <InfoTileCard title="Assessment Notes" icon={<Stethoscope className="h-3.5 w-3.5" />} tone="slate" value={assessment.notes} multiline />
      )}
    </div>
  );
}
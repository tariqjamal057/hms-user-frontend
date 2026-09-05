// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-overview.tsx
"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Scissors,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Watch,
} from "lucide-react";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { OtPatient, OtStatus, SurgicalCount, SurgicalSafetyItem } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";
import { OtStatusBadge } from "./ot-status-badge";

type TabOverviewProps = {
  patient: OtPatient;
  safetyItems: SurgicalSafetyItem[];
  counts: SurgicalCount[];
  onNext?: () => void;
  onTransition?: (status: OtStatus) => void;
};

export function TabOverview({ patient, safetyItems, counts, onNext, onTransition }: TabOverviewProps) {
  const completedSafety = safetyItems.filter((s) => s.completed).length;
  const safetyPct = safetyItems.length ? Math.round((completedSafety / safetyItems.length) * 100) : 0;
  const reconciliation = counts.filter((c) => c.status === "Reconciliation Required");

  const transitions: { status: OtStatus; label: string; disabled?: boolean }[] = [];
  if (patient.status === "Scheduled") transitions.push({ status: "Pre-Op Ready", label: "Mark Pre-Op Ready" });
  if (patient.status === "Pre-Op Ready" || patient.status === "Scheduled") transitions.push({ status: "In Surgery", label: "Start Surgery" });
  if (patient.status === "In Surgery") transitions.push({ status: "In Recovery", label: "To Recovery" });
  if (patient.status === "In Recovery") transitions.push({ status: "Post-Operative", label: "Mark Post-Op" });
  if (patient.status === "Post-Operative") transitions.push({ status: "Ready for Transfer", label: "Ready for Transfer" });
  if (patient.status === "Ready for Transfer") transitions.push({ status: "Completed", label: "Complete Encounter" });
  if (["Scheduled", "Pre-Op Ready", "In Surgery", "In Recovery"].includes(patient.status)) transitions.push({ status: "Cancelled", label: "Cancel", disabled: true });

  return (
    <div className="space-y-5">
      <OtSectionHeader
        icon={<Scissors className="h-5 w-5" />}
        title="Operation Theatre — Overview"
        subtitle={`${patient.procedure} · ${patient.procedureCode} · ${patient.otRoom}`}
        tone="from-sky-500 to-indigo-500"
        right={<OtStatusBadge status={patient.status} />}
      />

      {reconciliation.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Surgical Count Reconciliation Required"
          body={`${reconciliation.map((c) => c.item).join(", ")} — final count does not match the pre-procedure count. Stop and reconcile before closing.`}
        />
      )}

      {onTransition && transitions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {transitions.map((t) => (
            <button
              key={t.status}
              type="button"
              disabled={t.disabled}
              onClick={() => onTransition(t.status)}
              className={
                t.disabled
                  ? "rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 line-through"
                  : "rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-bold text-sky-700 shadow-sm transition hover:bg-sky-50"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoTileCard
          title="Planned Procedure"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          tone="blue"
          value={patient.procedure}
          subtitle={`ICD / CPT ${patient.procedureCode}`}
        />
        <InfoTileCard
          title="Schedule"
          icon={<CalendarClock className="h-3.5 w-3.5" />}
          tone="purple"
          value={patient.plannedDateTime}
          subtitle={`${patient.otRoom} · ${patient.department}`}
        />
        <InfoTileCard
          title="Indications"
          icon={<ClipboardCheck className="h-3.5 w-3.5" />}
          tone="emerald"
          value={patient.indications}
          subtitle="Reason for procedure"
        />
        <InfoTileCard
          title="Surgeon"
          icon={<UserRound className="h-3.5 w-3.5" />}
          tone="slate"
          value={patient.surgeon}
          subtitle="Lead surgeon"
        />
        <InfoTileCard
          title="Anesthetist"
          icon={<Watch className="h-3.5 w-3.5" />}
          tone="cyan"
          value={patient.anesthetist}
          subtitle="Anesthesia team"
        />
        <InfoTileCard
          title="OT Team"
          icon={<MapPin className="h-3.5 w-3.5" />}
          tone="rose"
          value={`${patient.scrubNurse} · ${patient.otTechnician}`}
          subtitle="Scrub nurse · OT technician"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTileCard
          title="Surgical Safety Checklist"
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          tone={safetyPct === 100 ? "emerald" : "amber"}
          value={`${completedSafety} / ${safetyItems.length} signed off`}
          subtitle={`${safetyPct}% complete`}
        >
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
              style={{ width: `${safetyPct}%` }}
            />
          </div>
        </InfoTileCard>
        <InfoTileCard
          title="Surgical Counts"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone={reconciliation.length ? "red" : "emerald"}
          value={`${counts.length} item groups counted`}
          subtitle={
            reconciliation.length ? "Reconciliation required — see Surgical Safety tab" : "All counts correct"
          }
        >
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="mt-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Open OT Workspace →
            </button>
          )}
        </InfoTileCard>
      </div>
    </div>
  );
}
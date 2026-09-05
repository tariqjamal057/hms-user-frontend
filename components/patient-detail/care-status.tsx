// components/patient-detail/care-status.tsx
"use client";

import { Check, Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CareStatus =
  | "Registered"
  | "Waiting"
  | "Under Consultation"
  | "Admitted"
  | "Under Treatment"
  | "Transferred"
  | "Under Observation"
  | "Procedure Scheduled"
  | "Procedure In Progress"
  | "Recovery"
  | "Ready for Discharge"
  | "Discharged"
  | "Cancelled";

export const CARE_STATUSES: {
  value: CareStatus;
  description: string;
  authority: "Doctor" | "Nurse" | "Pharmacy" | "OT" | "Admin";
  tone: string;
  dot: string;
}[] = [
  { value: "Registered", description: "Patient registered in the system.", authority: "Admin", tone: "border-slate-200 bg-slate-50 text-slate-700", dot: "bg-slate-400" },
  { value: "Waiting", description: "Waiting for first consultation.", authority: "Admin", tone: "border-slate-200 bg-slate-50 text-slate-700", dot: "bg-slate-400" },
  { value: "Under Consultation", description: "Currently under clinical consultation.", authority: "Doctor", tone: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  { value: "Admitted", description: "Admitted to IPD / ICU ward.", authority: "Admin", tone: "border-indigo-200 bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  { value: "Under Treatment", description: "Active treatment plan is being executed.", authority: "Doctor", tone: "border-violet-200 bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  { value: "Transferred", description: "Moved between ward / ICU / OT.", authority: "Admin", tone: "border-cyan-200 bg-cyan-50 text-cyan-700", dot: "bg-cyan-500" },
  { value: "Under Observation", description: "Being observed for clinical decision.", authority: "Doctor", tone: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  { value: "Procedure Scheduled", description: "OT / procedure has been scheduled.", authority: "OT", tone: "border-teal-200 bg-teal-50 text-teal-700", dot: "bg-teal-500" },
  { value: "Procedure In Progress", description: "Surgery / procedure is underway.", authority: "OT", tone: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  { value: "Recovery", description: "In Recovery / PACU after procedure.", authority: "OT", tone: "border-pink-200 bg-pink-50 text-pink-700", dot: "bg-pink-500" },
  { value: "Ready for Discharge", description: "Clinically cleared for discharge.", authority: "Doctor", tone: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  { value: "Discharged", description: "Discharged from the facility.", authority: "Admin", tone: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-500" },
  { value: "Cancelled", description: "Encounter / admission cancelled.", authority: "Admin", tone: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
];

type CareStatusProps = {
  value: CareStatus;
  onChange?: (status: CareStatus) => void;
  /** Only these statuses may be selected by the current role. */
  allowedStatuses?: CareStatus[];
  /** Authority label describing what the current role may change. */
  authorityLabel: string;
};

/**
 * Encounter / Care Status stepper. Renders the full care journey; only the
 * statuses granted to the current role are actionable (permission-controlled).
 * Statuses the role may not touch render locked and read-only.
 */
export function CareStatusStepper({
  value,
  onChange,
  allowedStatuses,
  authorityLabel,
}: CareStatusProps) {
  const currentIndex = CARE_STATUSES.findIndex((s) => s.value === value);
  const current = CARE_STATUSES[currentIndex] ?? CARE_STATUSES[0];

  return (
    <div className="space-y-5">
      {/* Current status hero */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", "from-indigo-500 to-violet-500")}>
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Encounter / Care Status
            </p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-800">
              {current.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{current.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("self-start px-3 py-1 text-xs font-bold sm:self-auto", current.tone)}>
          <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", current.dot)} />
          {current.authority} authority
        </Badge>
      </div>

      {/* Role authority note */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-slate-700">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <p>
          <span className="font-bold text-amber-800">{authorityLabel}.</span> Only the
          statuses highlighted below are within this role&apos;s permission — other
          statuses are read-only on this workspace.
        </p>
      </div>

      {/* Status journey */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          Care Journey
        </p>
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CARE_STATUSES.map((s, idx) => {
            const actionable = !!onChange && (!allowedStatuses || allowedStatuses.includes(s.value));
            const active = s.value === value;
            const done = idx < currentIndex;
            return (
              <li key={s.value}>
                <button
                  type="button"
                  disabled={!actionable || active}
                  onClick={() => onChange?.(s.value)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                    active
                      ? cn("border-2", current.tone)
                      : done
                        ? "border-slate-200 bg-slate-50/70"
                        : actionable
                          ? "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
                          : "border-slate-100 bg-slate-50/50 opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
                      active ? "bg-gradient-to-br from-indigo-500 to-violet-500" : done ? "bg-emerald-500" : "bg-slate-300",
                    )}
                  >
                    {done && !active ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{s.value}</span>
                      <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                        {!actionable && <Lock className="h-2.5 w-2.5" />}
                        {s.authority}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                      {s.description}
                    </span>
                    {active && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                        Current
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
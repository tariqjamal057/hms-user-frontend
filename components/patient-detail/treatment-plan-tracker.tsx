// components/patient-detail/treatment-plan-tracker.tsx
"use client";

import { Fragment, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  History,
  Plus,
  TrendingUp,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { cn } from "@/lib/utils";

export type TreatmentStepState = "done" | "current" | "pending" | "overdue";

export type TreatmentActivityStatus =
  | "Completed"
  | "In Progress"
  | "Pending"
  | "Ongoing"
  | "Overdue"
  | "Cancelled"
  | "Held";

export type TreatmentModule =
  | "medicine"
  | "laboratory"
  | "vitals"
  | "diagnosis"
  | "fluid";

export type SourceTone =
  | "indigo"
  | "cyan"
  | "violet"
  | "emerald"
  | "orange"
  | "blue";

export type TreatmentStep = {
  label: string;
  state: TreatmentStepState;
  time?: string;
  by?: string;
};

export type TreatmentTimelineEvent = {
  time: string;
  title: string;
  detail?: string;
  tone: "emerald" | "amber" | "red" | "indigo" | "blue" | "slate";
};

export type TreatmentActivity = {
  id: string;
  name: string;
  subtitle: string;
  /** Semantic owning module — used to route "open in module" navigation. */
  module: TreatmentModule;
  sourceModule: string;
  sourceTone: SourceTone;
  progress: number;
  progressLabel: string;
  workflowLabel: string;
  owner: string;
  due: string;
  dueOverdue?: boolean;
  status: TreatmentActivityStatus;
  steps: TreatmentStep[];
  timeline: TreatmentTimelineEvent[];
  overdue?: { message: string };
};

export type ActiveProblem = {
  id: string;
  code: string;
  tag: string;
  tagTone: "red" | "blue";
  title: string;
  goal: string;
  modules: string[];
};

export type PendingAction = {
  id: string;
  label: string;
  meta: string;
  tone: "red" | "amber" | "slate";
};

export type TreatmentCondition = {
  status: string;
  statusTone: "red" | "amber" | "emerald" | "blue" | "slate";
  summary: string;
  description: string;
  careGoal: string;
  priority: string;
  location: string;
  planStarted: string;
};

export type OverallProgress = {
  percent: number;
  completed: number;
  total: number;
  pending: number;
  overdue: number;
  status: string;
  note: string;
};

export type TreatmentPlanTrackerData = {
  overall: OverallProgress;
  condition: TreatmentCondition;
  pendingActions: PendingAction[];
  problems: ActiveProblem[];
  activities: TreatmentActivity[];
};

export type TreatmentPlanTrackerProps = {
  data: TreatmentPlanTrackerData;
  title?: string;
  description?: string;
  updatedAt?: string;
  onAddActivity?: () => void;
  /** Called when the user clicks "Open in module" inside an activity detail. */
  onOpenActivity?: (activity: TreatmentActivity) => void;
};

const STATUS_TONE: Record<TreatmentActivityStatus, string> = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Ongoing: "border-blue-200 bg-blue-50 text-blue-700",
  Overdue: "border-red-200 bg-red-50 text-red-700",
  Cancelled: "border-slate-200 bg-slate-50 text-slate-500",
  Held: "border-slate-300 bg-slate-100 text-slate-600",
};

const SOURCE_TONE: Record<SourceTone, string> = {
  indigo: "bg-indigo-50 text-indigo-700",
  cyan: "bg-cyan-50 text-cyan-700",
  violet: "bg-violet-50 text-violet-700",
  emerald: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
  blue: "bg-blue-50 text-blue-700",
};

const ACTION_TONE: Record<PendingAction["tone"], string> = {
  red: "border-red-100 bg-red-50/50",
  amber: "border-amber-100 bg-amber-50/50",
  slate: "border-slate-100 bg-slate-50",
};

const ACTION_META_TONE: Record<PendingAction["tone"], string> = {
  red: "text-red-600",
  amber: "text-amber-600",
  slate: "text-slate-500",
};

const TIMELINE_DOT: Record<TreatmentTimelineEvent["tone"], string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  red: "bg-red-500",
  indigo: "bg-indigo-500",
  blue: "bg-blue-500",
  slate: "bg-slate-300",
};

const TIMELINE_TIME: Record<TreatmentTimelineEvent["tone"], string> = {
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  red: "text-red-600",
  indigo: "text-indigo-600",
  blue: "text-blue-600",
  slate: "text-slate-500",
};

const CONDITION_TONE: Record<TreatmentCondition["statusTone"], string> = {
  red: "border-red-200 bg-red-50 text-red-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

function progressBarTone(status: TreatmentActivityStatus): string {
  if (status === "Completed") return "bg-emerald-500";
  if (status === "Overdue") return "bg-red-500";
  if (status === "Pending") return "bg-amber-500";
  return "bg-blue-500";
}

function stepGlyph({ state, label }: TreatmentStep) {
  if (state === "done")
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  if (state === "overdue")
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        !
      </span>
    );
  if (state === "current")
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
        ●
      </span>
    );
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500">
      ○
    </span>
  );
}

function WorkflowMini({ steps }: { steps: TreatmentStep[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-[11px] font-bold">
      {steps.map((s, i) => (
        <Fragment key={`${s.label}-${i}`}>
          {i > 0 && <span className="text-slate-300">→</span>}
          <span
            className={
              s.state === "done"
                ? "text-emerald-600"
                : s.state === "overdue"
                  ? "text-red-600"
                  : s.state === "current"
                    ? "text-amber-500"
                    : "text-slate-300"
            }
          >
            {s.state === "done" ? "✓" : s.state === "current" ? "●" : "○"}
          </span>
        </Fragment>
      ))}
      <span className="ml-1 text-slate-400">
        {steps.map((s) => s.label).join(" → ")}
      </span>
    </span>
  );
}

// ============ Pending actions band ============

function PendingActionsBand({ actions }: { actions: PendingAction[] }) {
  const red = actions.filter((a) => a.tone === "red").length;
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Pending Actions — {actions.length} require attention
        </p>
        {red > 0 && (
          <Badge className="border-red-200 bg-red-100 text-red-700">
            {red} overdue
          </Badge>
        )}
      </div>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {actions.map((a) => (
          <li
            key={a.id}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm",
              ACTION_TONE[a.tone],
            )}
          >
            <span className="font-semibold text-slate-700">{a.label}</span>
            <span className={cn("shrink-0 text-xs", ACTION_META_TONE[a.tone])}>
              {a.meta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============ Overall execution progress ============

function ProgressPanel({ overall }: { overall: OverallProgress }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overall treatment execution
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-800">
            Active Care Plan
          </h3>
        </div>
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-xs font-bold text-blue-700"
        >
          {overall.status}
        </Badge>
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-8 border-slate-100">
          <span className="text-3xl font-extrabold text-indigo-600">
            {overall.percent}%
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Execution
          </span>
        </div>
        <div className="w-full flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Completed activities{" "}
              <b className="text-slate-700">
                {overall.completed} / {overall.total}
              </b>
            </span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700"
              style={{ width: `${overall.percent}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Treatment status · {overall.status}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <InfoTileCard
              title="Completed"
              tone="emerald"
              value={String(overall.completed)}
            />
            <InfoTileCard
              title="Pending"
              tone="amber"
              value={String(overall.pending)}
            />
            <InfoTileCard
              title="Overdue"
              tone="red"
              value={String(overall.overdue)}
            />
          </div>
        </div>
      </div>

      <InfoAlertCard
        className="mt-5"
        tone="amber"
        icon={<TrendingUp className="h-3.5 w-3.5" />}
        title="Important: execution ≠ recovery"
        body={overall.note}
      />
    </div>
  );
}

// ============ Patient condition ============

function ConditionPanel({ condition }: { condition: TreatmentCondition }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Clinical status
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-800">
            Patient Condition
          </h3>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs font-bold", CONDITION_TONE[condition.statusTone])}
        >
          <Activity className="mr-1 h-3 w-3" />
          {condition.status.toUpperCase()}
        </Badge>
      </div>

      <div className="mt-5 rounded-xl border border-red-100 bg-red-50/60 p-4">
        <p className="text-sm font-bold text-slate-800">{condition.summary}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          {condition.description}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase text-slate-400">Care goal</p>
          <b className="text-sm text-slate-800">{condition.careGoal}</b>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase text-slate-400">Priority</p>
          <b className="text-sm text-red-600">{condition.priority}</b>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase text-slate-400">Location</p>
          <b className="text-sm text-slate-800">{condition.location}</b>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase text-slate-400">Plan started</p>
          <b className="text-sm text-slate-800">{condition.planStarted}</b>
        </div>
      </div>
    </div>
  );
}

// ============ Active problems ============

function ProblemsPanel({ problems }: { problems: ActiveProblem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Active Problems &amp; Treatment Goals
          </h3>
          <p className="text-xs text-slate-500">
            Clinical objectives linked to this encounter.
          </p>
        </div>
      </div>
      {problems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-400">
          No active problems recorded.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {problems.map((p) => (
            <div
              key={p.id}
              className={cn(
                "rounded-xl border p-4",
                p.tagTone === "red"
                  ? "border-red-100 bg-red-50/40"
                  : "border-blue-100 bg-blue-50/40",
              )}
            >
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-[10px] font-bold",
                  p.tagTone === "red"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700",
                )}
              >
                {p.code} · {p.tag.toUpperCase()}
              </span>
              <h4 className="mt-2 text-sm font-bold text-slate-800">
                {p.title}
              </h4>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Treatment goal
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{p.goal}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.modules.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Activity detail (steps + timeline) ============

type ActivityDetailProps = {
  activity: TreatmentActivity;
  onClose: () => void;
  onOpenActivity?: (activity: TreatmentActivity) => void;
};

function ActivityDetailPanel({
  activity,
  onClose,
  onOpenActivity,
}: ActivityDetailProps) {
  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">{activity.name}</h3>
          <p className="text-xs text-slate-500">{activity.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-50 text-xs font-bold text-slate-600"
          >
            {activity.progress}% — {activity.status}
          </Badge>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close details"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Workflow stepper */}
      <div className="mt-5 flex items-start">
        {activity.steps.map((s, i) => (
          <Fragment key={`${s.label}-${i}`}>
            <div className="w-24 flex-none text-center">
              <div className="mx-auto">{stepGlyph(s)}</div>
              <p
                className={cn(
                  "mt-2 text-[10px] font-bold",
                  s.state === "overdue" || s.state === "current"
                    ? s.state === "overdue"
                      ? "text-red-600"
                      : "text-amber-600"
                    : s.state === "done"
                      ? "text-slate-700"
                      : "text-slate-400",
                )}
              >
                {s.label}
              </p>
              {s.time ? (
                <p className="text-[9px] text-slate-400">{s.time}</p>
              ) : null}
              {s.by ? (
                <p className="text-[9px] text-slate-400">{s.by}</p>
              ) : null}
            </div>
            {i < activity.steps.length - 1 && (
              <div
                className={cn(
                  "mt-3 h-0.5 flex-1 rounded-full",
                  activity.steps[i + 1].state === "done"
                    ? "bg-emerald-300"
                    : "bg-slate-200",
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {activity.workflowLabel}
      </p>

      {activity.overdue && (
        <div className="mt-4">
          <InfoAlertCard
            tone="red"
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            title="Overdue"
            body={activity.overdue.message}
          />
        </div>
      )}

      {/* Activity timeline */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <History className="h-4 w-4 text-indigo-600" />
          Activity Timeline
        </p>
        <ol className="relative ml-3 space-y-5 border-l-2 border-slate-200">
          {activity.timeline.map((ev, i) => (
            <li key={i} className="ml-6">
              <span
                className={cn(
                  "absolute -left-[9px] h-4 w-4 rounded-full border-2 border-white",
                  TIMELINE_DOT[ev.tone],
                )}
              />
              <p className={cn("text-xs font-bold", TIMELINE_TIME[ev.tone])}>
                {ev.time}
              </p>
              <p className="font-semibold text-slate-800">{ev.title}</p>
              {ev.detail && (
                <p className="text-xs text-slate-500">{ev.detail}</p>
              )}
            </li>
          ))}
        </ol>
      </div>

      {onOpenActivity && (
        <div className="mt-5 flex justify-end">
          <PillButton
            icon={ExternalLink}
            onClick={() => onOpenActivity(activity)}
          >
            Open {activity.sourceModule.split("→")[0]?.trim() ?? "Module"} page
          </PillButton>
        </div>
      )}
    </div>
  );
}

// ============ Status legend ============

function StatusLegend() {
  const items: { label: string; className: string }[] = [
    { label: "Completed", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    { label: "In Progress", className: "border-blue-200 bg-blue-50 text-blue-700" },
    { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
    { label: "Overdue", className: "border-red-200 bg-red-50 text-red-700" },
    { label: "Cancelled", className: "border-slate-200 bg-slate-50 text-slate-500" },
    { label: "Held", className: "border-slate-300 bg-slate-100 text-slate-600" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-slate-400">Status:</span>
      {items.map((it) => (
        <span
          key={it.label}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
            it.className,
          )}
        >
          {it.label}
        </span>
      ))}
    </div>
  );
}

// ============ Main ============

export function TreatmentPlanTracker({
  data,
  title = "Treatment Plan",
  description = "Centralized view of treatment goals, execution progress, pending actions and clinical response. Individual modules perform the work; this page tracks the complete treatment journey.",
  updatedAt,
  onAddActivity,
  onOpenActivity,
}: TreatmentPlanTrackerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeActivity = data.activities.find((a) => a.id === activeId) ?? null;

  const columns: DataColumn<TreatmentActivity>[] = [
    {
      key: "name",
      label: "Activity",
      render: (a) => (
        <div>
          <p className="font-semibold text-slate-800">{a.name}</p>
          <p className="text-[10px] text-slate-400">{a.subtitle}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {a.owner} · {a.due}
          </p>
        </div>
      ),
    },
    {
      key: "sourceModule",
      label: "Source Module",
      hideOnMobile: true,
      render: (a) => (
        <span
          className={cn(
            "inline-block rounded-md px-2 py-1 text-[10px] font-bold",
            SOURCE_TONE[a.sourceTone],
          )}
        >
          {a.sourceModule}
        </span>
      ),
    },
    {
      key: "workflow",
      label: "Workflow",
      hideOnMobile: true,
      render: (a) => (
        <div>
          <WorkflowMini steps={a.steps} />
          <p className="mt-0.5 text-[9px] text-slate-400">{a.workflowLabel}</p>
        </div>
      ),
    },
    {
      key: "progress",
      label: "Progress",
      cellClassName: "w-36",
      render: (a) => (
        <div className="w-32">
          <div className="flex justify-between text-[10px] font-bold">
            <span
              className={
                a.status === "Overdue" ? "text-red-600" : "text-slate-700"
              }
            >
              {a.progress}%
            </span>
            <span className="text-slate-400">{a.progressLabel}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
            <div
              className={cn("h-1.5 rounded-full", progressBarTone(a.status))}
              style={{ width: `${Math.min(100, a.progress)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (a) => (
        <Badge
          variant="outline"
          className={cn("text-[10px] font-bold", STATUS_TONE[a.status])}
        >
          {a.status}
        </Badge>
      ),
    },
    {
      key: "detail",
      label: "",
      render: (a) => {
        const open = a.id === activeId;
        return (
          <button
            type="button"
            onClick={() => setActiveId(open ? null : a.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:underline"
          >
            {open ? "Hide" : "Details"}
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                open && "rotate-90",
              )}
            />
          </button>
        );
      },
    },
  ];

  const overdueActivities = data.activities.filter(
    (a) => a.status === "Overdue" || a.status === "Pending",
  ).length;

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              {title}
            </p>
            <p className="max-w-3xl text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {updatedAt && (
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              Updated {updatedAt}
            </span>
          )}
          {/*<span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
            Plan: Active
          </span>*/}
          {onAddActivity && (
            <PillButton icon={Plus} onClick={onAddActivity}>
              Add Activity
            </PillButton>
          )}
        </div>
      </div>

      {/* Pending actions */}
      {data.pendingActions.length > 0 && (
        <PendingActionsBand actions={data.pendingActions} />
      )}

      {/* Execution progress + Patient condition */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProgressPanel overall={data.overall} />
        </div>
        <ConditionPanel condition={data.condition} />
      </div>

      {/* Active problems */}
      <ProblemsPanel problems={data.problems} />

      {/* Treatment activities */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <ClipboardList className="h-4 w-4" />
              </span>
              Treatment Activities
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Rolled up from the connecting modules —{" "}
              {overdueActivities > 0
                ? `${overdueActivities} need attention.`
                : "all on track."}
            </p>
          </div>
        </div>
        <DataTable
          rows={data.activities}
          columns={columns}
          rowKey={(a) => a.id}
          emptyText="No treatment activities recorded yet."
        />
      </div>

      {/* Expandable activity detail */}
      {activeActivity && (
        <ActivityDetailPanel
          activity={activeActivity}
          onClose={() => setActiveId(null)}
          onOpenActivity={onOpenActivity}
        />
      )}

      {/* Status legend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <StatusLegend />
      </div>
    </div>
  );
}
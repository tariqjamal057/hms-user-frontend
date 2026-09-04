// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-treatment-plan.tsx
"use client";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  History,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type { TreatmentPlanItem } from "@/types/nurse/ipd/nurse-ipd-types";
import { CURRENT_NURSE } from "@/lib/nurse/ipd/nurse-ipd-data";

export function TabTreatmentPlan({
  plans,
  onToggleFollow,
}: {
  plans: TreatmentPlanItem[];
  onToggleFollow: (plan: TreatmentPlanItem) => void;
}) {
  const followingCount = plans.filter((p) => p.followStatus === "Following").length;
  const notFollowingCount = plans.filter(
    (p) => p.followStatus === "Not Following",
  ).length;
  const completionPct = plans.length
    ? Math.round((followingCount / plans.length) * 100)
    : 0;

  const columns: DataColumn<TreatmentPlanItem>[] = [
    {
      key: "title",
      label: "Plan",
      render: (p) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-800">{p.title}</p>
          <p className="mt-0.5 line-clamp-2 max-w-[420px] text-xs text-slate-500">
            {p.description}
          </p>
        </div>
      ),
    },
    {
      key: "orderedBy",
      label: "Ordered",
      render: (p) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{p.orderedBy}</p>
          <p className="text-[10px] text-slate-400">{p.orderedOn}</p>
        </div>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Update",
      render: (p) =>
        p.lastUpdatedBy ? (
          <div className="text-xs">
            <p className="font-semibold text-slate-700">{p.lastUpdatedBy}</p>
            <p className="text-[10px] text-slate-400">{p.lastUpdatedAt}</p>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
      hideOnMobile: true,
    },
    {
      key: "followStatus",
      label: "Status",
      render: (p) =>
        p.followStatus === "Following" ? (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            <CheckCircle2 className="h-3 w-3" />
            Following
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 border-amber-200 bg-amber-50 text-amber-700"
          >
            <XCircle className="h-3 w-3" />
            Not Following
          </Badge>
        ),
    },
    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (p) => {
        const isFollowing = p.followStatus === "Following";
        return (
          <button
            type="button"
            onClick={() =>
              onToggleFollow({
                ...p,
                followStatus: isFollowing ? "Not Following" : "Following",
                lastUpdatedBy: CURRENT_NURSE.name,
                lastUpdatedAt: new Date().toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              isFollowing
                ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isFollowing ? (
              <>
                <RotateCcw className="h-3 w-3" />
                Mark Not Following
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Mark Following
              </>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Treatment Plan
            </p>
            <p className="text-xs text-slate-500">
              Doctor-prescribed plan items · mark each as followed once
              implemented on the ward
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Total Plans"
          icon={<ClipboardCheck className="h-3.5 w-3.5" />}
          tone="purple"
          value={String(plans.length)}
          subtitle="Doctor-prescribed"
        />
        <InfoTileCard
          title="Following"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          value={String(followingCount)}
          subtitle={`${completionPct}% adherence`}
        />
        <InfoTileCard
          title="Not Following"
          icon={<XCircle className="h-3.5 w-3.5" />}
          tone="amber"
          value={String(notFollowingCount)}
          subtitle="Needs attention"
        />
        <InfoTileCard
          title="Last Updated"
          icon={<Clock className="h-3.5 w-3.5" />}
          tone="slate"
          value={plans[0]?.lastUpdatedAt ?? "—"}
          subtitle={plans[0]?.lastUpdatedBy ?? "No updates yet"}
        />
      </div>

      {/* Low-adherence alert */}
      {plans.length > 0 && completionPct < 60 && (
        <InfoAlertCard
          tone="amber"
          icon={<History className="h-3.5 w-3.5" />}
          title="Plan Adherence Below Target"
          body={`Only ${completionPct}% of treatment plan items are currently marked as followed. Consider reviewing with the attending team.`}
        />
      )}

      {/* Plans table */}
      <DataTable
        card
        title="Doctor's Treatment Plan"
        titleIcon={<ClipboardCheck className="h-4 w-4" />}
        rows={plans}
        columns={columns}
        rowKey={(p) => p.id}
        countLabel="plans"
        emptyText="No treatment plan items recorded for this patient."
      />

      {plans.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <User className="h-3.5 w-3.5" />
          Updates are signed as <span className="font-semibold text-slate-700">{CURRENT_NURSE.name}</span> ({CURRENT_NURSE.shift})
        </p>
      )}
    </div>
  );
}

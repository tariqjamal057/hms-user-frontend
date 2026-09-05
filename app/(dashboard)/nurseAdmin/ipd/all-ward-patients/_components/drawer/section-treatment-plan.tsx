// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-treatment-plan.tsx
"use client";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { SectionHeader } from "./section-header";
import type { TreatmentPlanFull } from "@/types/nurse-admin/ipd/ward-detail-types";

export function SectionTreatmentPlan({ plans }: { plans: TreatmentPlanFull[] }) {
  const following = plans.filter((p) => p.followStatus === "Following").length;
  const notFollowing = plans.filter((p) => p.followStatus === "Not Following").length;

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<ClipboardCheck className="h-5 w-5" />}
        title="Doctor's Treatment Plan"
        subtitle="Read-only view — shows whether assigned nurses are following each plan item."
      />

      <div className="grid grid-cols-2 gap-3">
        <InfoTileCard title="Following" icon={<CheckCircle2 className="h-3.5 w-3.5" />} tone="emerald" value={String(following)} subtitle="Plan items on track" />
        <InfoTileCard title="Not Following" icon={<XCircle className="h-3.5 w-3.5" />} tone="amber" value={String(notFollowing)} subtitle="Items requiring attention" />
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-2xl border p-5 ${plan.followStatus === "Following" ? "border-emerald-200 bg-emerald-50/20" : "border-amber-200 bg-amber-50/20"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800">{plan.title}</p>
                <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                <p className="mt-2 text-xs text-slate-400">Ordered by {plan.orderedBy} · {plan.orderedOn}</p>
              </div>
              <Badge variant="outline" className={plan.followStatus === "Following" ? "gap-1 border-emerald-200 bg-emerald-50 text-emerald-700" : "gap-1 border-amber-200 bg-amber-50 text-amber-700"}>
                {plan.followStatus === "Following" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{plan.followStatus}
              </Badge>
            </div>
          </div>
        ))}
        {plans.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No treatment plan items recorded.</div>}
      </div>
    </div>
  );
}
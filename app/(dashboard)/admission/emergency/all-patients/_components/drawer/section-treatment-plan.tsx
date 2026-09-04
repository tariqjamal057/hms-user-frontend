// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-treatment-plan.tsx
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type { TreatmentPlanItem } from "@/types/emergency/emergency-types";

export function SectionTreatmentPlan({ plans }: { plans: TreatmentPlanItem[] }) {
  const columns: DataColumn<TreatmentPlanItem>[] = [
    {
      key: "title",
      label: "Plan",
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-800">{p.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{p.description}</p>
        </div>
      ),
    },
    {
      key: "orderedByRole",
      label: "Ordered By",
      render: (p) => (
        <div>
          <Badge
            variant="outline"
            className={
              p.orderedByRole === "Doctor"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-violet-200 bg-violet-50 text-violet-700"
            }
          >
            {p.orderedByRole}
          </Badge>
          <p className="mt-1 text-xs text-slate-500">
            {p.orderedBy} · {p.orderedOn}
          </p>
        </div>
      ),
    },
    {
      key: "followStatus",
      label: "Status",
      render: (p) => (
        <Badge
          variant="outline"
          className={
            p.followStatus === "Following"
              ? "gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
              : "gap-1 border-amber-200 bg-amber-50 text-amber-700"
          }
        >
          {p.followStatus === "Following" ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {p.followStatus}
        </Badge>
      ),
    },
  ];
  return (
    <DataTable
      card
      title="Treatment Plan"
      titleIcon={<ClipboardCheck className="h-4 w-4" />}
      rows={plans}
      columns={columns}
      rowKey={(p) => p.id}
      countLabel="plans"
      emptyText="No treatment plan items recorded."
    />
  );
}

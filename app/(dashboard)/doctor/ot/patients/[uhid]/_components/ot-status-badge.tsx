// app/(dashboard)/doctor/ot/patients/[uhid]/_components/ot-status-badge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import type { OtStatus } from "@/types/doctor/ot/ot-types";
import { cn } from "@/lib/utils";

const TONES: Record<OtStatus, string> = {
  Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  "Pre-Op Ready": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "In Surgery": "border-rose-200 bg-rose-50 text-rose-700",
  "In Recovery": "border-amber-200 bg-amber-50 text-amber-700",
  "Post-Operative": "border-violet-200 bg-violet-50 text-violet-700",
  "Ready for Transfer": "border-cyan-200 bg-cyan-50 text-cyan-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-red-200 bg-red-50 text-red-700",
};

export function OtStatusBadge({ status }: { status: OtStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", TONES[status])}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "In Surgery" ? "animate-pulse bg-rose-500" : "bg-current",
        )}
      />
      {status}
    </Badge>
  );
}
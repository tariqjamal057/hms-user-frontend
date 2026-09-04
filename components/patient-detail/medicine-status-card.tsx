// components/patient-detail/medicine-status-card.tsx
"use client";

import { CheckCircle2, Clock, PauseCircle, Ban, User, CalendarClock, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MedicineOrder } from "@/types/doctor/ipd/ward-round-types";

const STATUS_CONFIG: Record<
  MedicineOrder["status"],
  {
    border: string;
    bg: string;
    badge: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  Given: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-50/40",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Given",
  },
  Pending: {
    border: "border-l-amber-400",
    bg: "bg-amber-50/40",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Pending",
  },
  Held: {
    border: "border-l-orange-400",
    bg: "bg-orange-50/30",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <PauseCircle className="h-3.5 w-3.5" />,
    label: "Held",
  },
  Discontinued: {
    border: "border-l-red-400",
    bg: "bg-red-50/30",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: <Ban className="h-3.5 w-3.5" />,
    label: "Discontinued",
  },
};

export function MedicineStatusCard({ med }: { med: MedicineOrder }) {
  const cfg = STATUS_CONFIG[med.status] ?? STATUS_CONFIG.Pending;

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${cfg.border} ${cfg.bg} p-4 transition hover:shadow-sm`}
    >
      {/* Row 1: Name + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 truncate">{med.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {med.dosage} &middot; {med.route} &middot; {med.frequency}
          </p>
        </div>
        <Badge className={`shrink-0 border text-[11px] font-semibold ${cfg.badge}`}>
          {cfg.icon}
          <span className="ml-1">{cfg.label}</span>
        </Badge>
      </div>

      {/* Row 2: Context line */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        {med.status === "Given" && med.givenBy && (
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3 text-emerald-600" />
            Given by <span className="font-semibold text-slate-700">{med.givenBy}</span>
            {med.givenAt && <> at <span className="font-semibold text-slate-700">{med.givenAt}</span></>}
          </span>
        )}
        {med.status === "Pending" && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3 text-amber-600" />
            Scheduled: <span className="font-semibold text-slate-700">{med.scheduledTime}</span>
          </span>
        )}
        {med.status === "Held" && (
          <span className="inline-flex items-center gap-1">
            <PauseCircle className="h-3 w-3 text-orange-600" />
            On hold &middot; Scheduled: <span className="font-semibold text-slate-700">{med.scheduledTime}</span>
          </span>
        )}
        {med.status === "Discontinued" && (
          <span className="inline-flex items-center gap-1">
            <Ban className="h-3 w-3 text-red-600" />
            Discontinued &middot; Was scheduled: <span className="font-semibold text-slate-700">{med.scheduledTime}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Stethoscope className="h-3 w-3 text-slate-400" />
          Ordered by <span className="font-semibold text-slate-700">{med.orderedBy}</span>
        </span>
      </div>
    </div>
  );
}

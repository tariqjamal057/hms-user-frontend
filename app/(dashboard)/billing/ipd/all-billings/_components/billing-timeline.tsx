// app/(dashboard)/billing/ipd/all-billings/_components/billing-timeline.tsx
"use client";
import { CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BillingEvent,
  BillingEventKind,
} from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

const KIND_STYLE: Record<BillingEventKind, { dot: string; badge: string }> = {
  Admission: { dot: "bg-blue-500", badge: "border-blue-200 bg-blue-50 text-blue-700" },
  Charge: { dot: "bg-cyan-500", badge: "border-cyan-200 bg-cyan-50 text-cyan-700" },
  Discount: { dot: "bg-rose-500", badge: "border-rose-200 bg-rose-50 text-rose-700" },
  Payment: { dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  "Coverage Receipt": { dot: "bg-violet-500", badge: "border-violet-200 bg-violet-50 text-violet-700" },
  Refund: { dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  Deposit: { dot: "bg-indigo-500", badge: "border-indigo-200 bg-indigo-50 text-indigo-700" },
};

export function KindBadge({ kind }: { kind: BillingEventKind }) {
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        KIND_STYLE[kind].badge,
      )}
    >
      {kind}
    </span>
  );
}

export function BillingTimeline({ events }: { events: BillingEvent[] }) {
  if (events.length === 0) return null;

  return (
    <ol className="relative ml-2 space-y-4 border-l border-slate-200 pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span
            className={cn(
              "absolute -left-[31px] top-4 h-3 w-3 rounded-full ring-4 ring-white",
              KIND_STYLE[event.kind].dot,
            )}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <KindBadge kind={event.kind} />
                <p className="min-w-0 truncate text-sm font-bold text-slate-800">
                  {event.title}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  event.amount > 0
                    ? "text-emerald-600"
                    : event.amount < 0
                      ? "text-rose-600"
                      : "text-slate-400",
                )}
              >
                {event.amount === 0
                  ? "—"
                  : `${event.amount > 0 ? "+" : "-"} ${formatCurrency(Math.abs(event.amount))}`}
              </span>
            </div>
            {event.detail && (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {event.detail}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {event.dateTime ?? event.date}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {event.actor}
              </span>
              {event.reference && (
                <span className="text-slate-400">{event.reference}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export { KIND_STYLE };
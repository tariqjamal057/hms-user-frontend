"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AllergySeverity = "severe" | "moderate" | "mild";

export type AllergyAlertItem = {
  name: string;
  severity?: AllergySeverity;
  note?: string;
};

const SEVERITY_STYLES: Record<
  AllergySeverity,
  { badge: string; bar: string; ring: string }
> = {
  severe: {
    badge: "bg-red-100 text-red-700 border-red-200",
    bar: "bg-gradient-to-r from-red-500 to-rose-500",
    ring: "group-hover:border-red-300 group-hover:bg-red-50",
  },
  moderate: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    bar: "bg-gradient-to-r from-amber-500 to-orange-500",
    ring: "group-hover:border-amber-300 group-hover:bg-amber-50",
  },
  mild: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    ring: "group-hover:border-emerald-300 group-hover:bg-emerald-50",
  },
};

const DEGREE = { severe: "Severe", moderate: "Moderate", mild: "Mild" } as const;

type AllergyAlertCardProps = {
  items: AllergyAlertItem[];
  title?: string;
  emptyTitle?: string;
  className?: string;
};

/**
 * Unified "Allergies & Alerts" display. Danger-tinted gradient header with an
 * icon chip and count. Each allergy is a tappable card that expands to reveal a
 * severity pill and optional note. Shows a reassuring shield empty state when no
 * allergies are recorded. Works anywhere a patient's allergy summary is needed.
 */
export function AllergyAlertCard({
  items,
  title = "Allergies & Alerts",
  emptyTitle = "No known allergies recorded",
  className,
}: AllergyAlertCardProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const hasAny = items.length > 0;
  const severeCount = useMemo(
    () => items.filter((i) => i.severity === "severe").length,
    [items],
  );

  return (
    <Card
      className={cn(
        "border-slate-200 transition-shadow p-0",
        hasAny ? "border-red-200/70 shadow-sm shadow-red-100/50" : "border-emerald-200/70",
        className,
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white",
                hasAny
                  ? "bg-gradient-to-br from-red-500 to-rose-500 shadow-sm shadow-red-200"
                  : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm shadow-emerald-200",
              )}
            >
              {hasAny ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </span>
            <span className="truncate">{title}</span>
            {hasAny && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-700">
                {items.length}
              </span>
            )}
          </h3>
          {severeCount > 0 && (
            <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              {severeCount} Severe
            </span>
          )}
        </div>

        {hasAny ? (
          <ul className="space-y-2">
            {items.map((item) => {
              const severity = item.severity ?? "mild";
              const styles = SEVERITY_STYLES[severity];
              const isOpen = openKey === item.name;
              return (
                <li key={item.name}>
                  <div
                    className={cn(
                      "group overflow-hidden rounded-lg  bg-red-50 border border-red-200 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer",
                      styles.ring,
                    )}
                    onClick={() => setOpenKey(isOpen ? null : item.name)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-red-800">{item.name}</p>
                      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", styles.badge)}>
                        {DEGREE[severity]}
                      </span>
                    </div>
                    {item.note && (
                      <p
                        className={cn(
                          "grid overflow-hidden text-xs leading-snug text-slate-500 transition-all duration-200",
                          isOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <span className="min-h-0">{item.note}</span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">{emptyTitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// components/patient-detail/info-alert-card.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InfoAlertTone = "blue" | "amber" | "emerald" | "red" | "slate";

const TONE_STYLES: Record<InfoAlertTone, { box: string; icon: string; title: string; body: string }> = {
  blue: {
    box: "border-blue-200 bg-blue-50/60",
    icon: "bg-blue-100 text-blue-600",
    title: "text-blue-800",
    body: "text-slate-700",
  },
  amber: {
    box: "border-amber-200 bg-amber-50/60",
    icon: "bg-amber-100 text-amber-600",
    title: "text-amber-800",
    body: "text-slate-700",
  },
  emerald: {
    box: "border-emerald-200 bg-emerald-50/60",
    icon: "bg-emerald-100 text-emerald-600",
    title: "text-emerald-800",
    body: "text-slate-700",
  },
  red: {
    box: "border-red-200 bg-red-50/60",
    icon: "bg-red-100 text-red-600",
    title: "text-red-800",
    body: "text-slate-700",
  },
  slate: {
    box: "border-slate-200 bg-slate-50/60",
    icon: "bg-slate-100 text-slate-600",
    title: "text-slate-800",
    body: "text-slate-700",
  },
};

export type InfoAlertCardProps = {
  title: string;
  body: string;
  icon?: ReactNode;
  tone?: InfoAlertTone;
  className?: string;
  action?: ReactNode;
};

export function InfoAlertCard({
  title,
  body,
  icon,
  tone = "amber",
  className,
  action,
}: InfoAlertCardProps) {
  const style = TONE_STYLES[tone];
  return (
    <div className={cn("rounded-xl border p-4", style.box, className)}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("flex items-center gap-2 text-sm font-bold", style.title)}>
          {icon && (
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                style.icon,
              )}
              aria-hidden
            >
              {icon}
            </span>
          )}
          {title}
        </p>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <p className={cn("mt-2 text-sm leading-relaxed whitespace-pre-line", style.body)}>
        {body}
      </p>
    </div>
  );
}

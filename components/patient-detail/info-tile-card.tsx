// components/patient-detail/info-tile-card.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InfoTileCardTone =
  | "blue"
  | "purple"
  | "emerald"
  | "amber"
  | "red"
  | "cyan"
  | "rose"
  | "slate";

const TONE_STYLES: Record<
  InfoTileCardTone,
  { box: string; header: string; value: string; sub: string; chip: string }
> = {
  blue: {
    box: "border-blue-200 bg-blue-50/50",
    header: "text-blue-800",
    value: "text-blue-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
  purple: {
    box: "border-purple-200 bg-purple-50/50",
    header: "text-purple-800",
    value: "text-purple-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
  emerald: {
    box: "border-emerald-200 bg-emerald-50/50",
    header: "text-emerald-800",
    value: "text-emerald-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
  amber: {
    box: "border-amber-200 bg-amber-50/50",
    header: "text-amber-800",
    value: "text-amber-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
  red: {
    box: "border-red-200 bg-red-50/50",
    header: "text-red-800",
    value: "text-red-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
  cyan: {
    box: "border-cyan-200 bg-cyan-50/50",
    header: "text-cyan-800",
    value: "text-cyan-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
  rose: {
    box: "border-rose-200 bg-rose-50/50",
    header: "text-rose-800",
    value: "text-rose-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
  slate: {
    box: "border-slate-200 bg-slate-50/50",
    header: "text-slate-800",
    value: "text-slate-700",
    sub: "text-slate-500",
    chip: "bg-white/70",
  },
};

export type InfoTileCardProps = {
  title: string;
  icon?: ReactNode;
  tone?: InfoTileCardTone;
  count?: number;
  hint?: string;
  value?: string;
  subtitle?: string;
  multiline?: boolean;
  children?: ReactNode;
  className?: string;
};

/**
 * Unified tile card — a tone-tinted rounded card with an icon header, a
 * colored count badge (optional) and either a single label/value pair, a
 * subtitle line, or rich `children`. Used by the ICU Overview / Registration
 * sections (Current Diagnosis, Given, Not Given / Pending, Out of Stock).
 */
export function InfoTileCard({
  title,
  icon,
  tone = "slate",
  count,
  hint,
  value,
  subtitle,
  multiline,
  children,
  className,
}: InfoTileCardProps) {
  const style = TONE_STYLES[tone];
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-2xl border p-4",
        style.box,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn("flex items-center gap-2 text-sm font-bold", style.header)}>
          {icon && (
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                style.chip,
              )}
              aria-hidden
            >
              {icon}
            </span>
          )}
          {title}
          {typeof count === "number" && (
            <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {count}
            </span>
          )}
        </p>
        {hint && <span className={cn("text-[10px] font-medium", style.sub)}>{hint}</span>}
      </div>

      {children ? (
        <div className="flex-1">{children}</div>
      ) : value !== undefined ? (
        <div className="flex-1">
          <p
            className={cn(
              "text-base font-bold",
              style.value,
              multiline ? "whitespace-pre-line" : "truncate",
            )}
          >
            {value}
          </p>
          {subtitle && <p className={cn("mt-0.5 text-xs", style.sub)}>{subtitle}</p>}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import type { ComponentType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PillButton } from "@/components/forms/pill-button";
import { cn } from "@/lib/utils";

export type SummaryCardTone = "blue" | "purple" | "amber" | "emerald" | "red" | "slate";

const TONE_STYLES: Record<
  SummaryCardTone,
  {
    box: string;
    iconChip: string;
    chip: string;
    heading: string;
  }
> = {
  blue: {
    box: "border-blue-200 bg-gradient-to-br from-blue-200/70 via-blue-100/40 to-cyan-100/60",
    iconChip: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200",
    chip: "border-blue-200 bg-white/80 text-blue-700",
    heading: "text-blue-800",
  },
  purple: {
    box: "border-purple-200 bg-gradient-to-br from-purple-200/70 via-purple-100/40 to-violet-100/60",
    iconChip: "bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-sm shadow-purple-200",
    chip: "border-purple-200 bg-white/80 text-purple-700",
    heading: "text-purple-800",
  },
  amber: {
    box: "border-amber-200 bg-gradient-to-br from-amber-200/70 via-amber-100/40 to-orange-100/60",
    iconChip: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200",
    chip: "border-amber-200 bg-white/80 text-amber-700",
    heading: "text-amber-800",
  },
  emerald: {
    box: "border-emerald-200 bg-gradient-to-br from-emerald-200/70 via-emerald-100/40 to-teal-100/60",
    iconChip: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200",
    chip: "border-emerald-200 bg-white/80 text-emerald-700",
    heading: "text-emerald-800",
  },
  red: {
    box: "border-red-200 bg-gradient-to-br from-red-200/70 via-red-100/40 to-rose-100/60",
    iconChip: "bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm shadow-red-200",
    chip: "border-red-200 bg-white/80 text-red-700",
    heading: "text-red-800",
  },
  slate: {
    box: "border-slate-200 bg-gradient-to-br from-slate-200/70 via-slate-100/40 to-slate-100/60",
    iconChip: "bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-sm shadow-slate-200",
    chip: "border-slate-300 bg-white/80 text-slate-700",
    heading: "text-slate-800",
  },
};

type ChipsVariantProps = {
  variant?: "chips";
  title: string;
  tone?: SummaryCardTone;
  chips: string[];
  chipClassName?: string;
};

type ActionVariantProps = {
  variant: "action";
  title: string;
  description: string;
  tone?: SummaryCardTone;
  icon?: ReactNode;
  buttonLabel: string;
  buttonIcon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  onAction: () => void;
  actionDisabled?: boolean;
  note?: string;
};

export type SummaryCardProps = ChipsVariantProps | ActionVariantProps;

/**
 * Unified summary box used in patient detail views, rendered as a soft
 * gradient card. Two variants:
 *  - "chips": a title plus a row of rounded badge chips (e.g. Chronic Conditions).
 *  - "action": an icon chip, title, description and a unified PillButton
 *    (e.g. Download E-Prescription).
 */
export function SummaryCard(props: SummaryCardProps) {
  if (props.variant === "action") {
    const {
      title,
      description,
      tone = "blue",
      icon,
      buttonLabel,
      buttonIcon,
      onAction,
      actionDisabled = false,
      note,
    } = props;
    const style = TONE_STYLES[tone];
    return (
      <Card className={cn("border transition-shadow hover:shadow-md p-0", style.box)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12", style.iconChip)}>
                {icon}
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-bold sm:text-base", style.heading)}>{title}</p>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</p>
              </div>
            </div>
            <PillButton
              variant="gradient"
              size="sm"
              icon={buttonIcon}
              onClick={onAction}
              disabled={actionDisabled}
            >
              {buttonLabel}
            </PillButton>
          </div>
          {note && <p className="mt-3 text-xs text-slate-500">{note}</p>}
        </CardContent>
      </Card>
    );
  }

  const { title, tone = "blue", chips, chipClassName } = props;
  const style = TONE_STYLES[tone];
  return (
    <Card className={cn("border transition-shadow hover:shadow-md p-0", style.box)}>
      <CardContent className="px-4 py-3.5 sm:px-5 sm:py-4">
        <h3 className={cn("mb-2.5 text-sm font-bold sm:text-base", style.heading)}>{title}</h3>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, idx) => (
            <span
              key={idx}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-transform duration-150 hover:-translate-y-0.5",
                style.chip,
                chipClassName,
              )}
            >
              {chip}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

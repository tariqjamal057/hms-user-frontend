"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type InfoCardTone = "blue" | "purple" | "amber" | "emerald" | "red" | "slate";

export type InfoCardItem = {
  key: string;
  title: string;
  subtitle?: string;
  badges?: { label: string; tone?: InfoCardTone }[];
};

const TONE_STYLES: Record<
  InfoCardTone,
  { chip: string; item: string; accent: string; headerText: string }
> = {
  blue: {
    chip: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200",
    item: "group-hover:border-blue-200 group-hover:bg-blue-50/60",
    accent: "bg-gradient-to-b from-blue-400 to-blue-600",
    headerText: "text-blue-600",
  },
  purple: {
    chip: "bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-sm shadow-purple-200",
    item: "group-hover:border-purple-200 group-hover:bg-purple-50/60",
    accent: "bg-gradient-to-b from-purple-400 to-purple-600",
    headerText: "text-purple-600",
  },
  amber: {
    chip: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200",
    item: "group-hover:border-amber-200 group-hover:bg-amber-50/60",
    accent: "bg-gradient-to-b from-amber-400 to-orange-500",
    headerText: "text-amber-600",
  },
  emerald: {
    chip: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200",
    item: "group-hover:border-emerald-200 group-hover:bg-emerald-50/60",
    accent: "bg-gradient-to-b from-emerald-400 to-emerald-600",
    headerText: "text-emerald-600",
  },
  red: {
    chip: "bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm shadow-red-200",
    item: "group-hover:border-red-200 group-hover:bg-red-50/60",
    accent: "bg-gradient-to-b from-red-400 to-rose-500",
    headerText: "text-red-600",
  },
  slate: {
    chip: "bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-sm shadow-slate-200",
    item: "group-hover:border-slate-300 group-hover:bg-slate-50",
    accent: "bg-gradient-to-b from-slate-400 to-slate-600",
    headerText: "text-slate-600",
  },
};

const BADGE_TONES: Record<InfoCardTone, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

type InfoCardProps = {
  title: string;
  icon: ReactNode;
  tone?: InfoCardTone;
  items?: InfoCardItem[];
  emptyText?: string;
  limit?: number;
  extra?: ReactNode;
  className?: string;
};

/**
 * Unified scrollable/expandable data container used for patient clinical
 * sections such as Active Medicines, Recent Lab Reports and History Stats.
 * Renders a tone-tinted header (gradient icon chip + title + count) and a
 * list of items that can expand past an optional visible `limit`.
 */
export function InfoCard({
  title,
  icon,
  tone = "blue",
  items = [],
  emptyText = "No data recorded",
  limit = 3,
  extra,
  className,
}: InfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = TONE_STYLES[tone];

  const hasMore = items.length > limit;
  const visible = expanded ? items : items.slice(0, limit);

  const toggle = () => setExpanded((v) => !v);

  return (
    <Card className={cn("border-slate-200 transition-shadow hover:shadow-md p-0", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", style.chip)}>
              {icon}
            </span>
            <span className="truncate">{title}</span>
            {items.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600">
                {items.length}
              </span>
            )}
          </h3>
          {extra}
        </div>

        {items.length > 0 ? (
          <ul className="space-y-2">
            {visible.map((item) => (
              <li key={item.key}>
                <div className={cn(
                  "group flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-default",
                  style.item,
                )}>
                  <span className={cn("w-1 shrink-0 rounded-full", style.accent)} aria-hidden="true" />
                  <div className="min-w-0 flex-1 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{item.title}</p>
                      {item.badges && item.badges.length > 0 && (
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                          {item.badges.map((badge, i) => (
                            <span
                              key={i}
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                BADGE_TONES[badge.tone ?? "slate"],
                              )}
                            >
                              {badge.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.subtitle}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center">
            <p className="text-sm text-slate-400">{emptyText}</p>
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={toggle}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
          >
            {expanded ? "Show less" : `Show all ${items.length}`}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", expanded && "rotate-180")} />
          </button>
        )}
      </CardContent>
    </Card>
  );}

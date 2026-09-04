"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SelectedItemBadge = {
  label: string;
  className?: string;
};

export type SelectedItemCardProps = {
  id: string;
  title: string;
  badges?: SelectedItemBadge[];
  accentColor?: string;
  footer?: ReactNode;
  onRemove: (id: string) => void;
  className?: string;
};

/**
 * Unified card for an auto-added / selected item inside the side drawers.
 * Top row: colored accent bar, title, optional badge chips and delete icon.
 * Optional `footer` slot renders an editable section (e.g. a radio-group
 * type selector) below the divider. Reusable across modules.
 */
export function SelectedItemCard({
  id,
  title,
  badges,
  accentColor = "border-blue-500",
  footer,
  onRemove,
  className,
}: SelectedItemCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-l-4 bg-gradient-to-r from-blue-50/60 to-transparent px-3 py-2.5",
          accentColor,
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
          {badges && badges.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    badge.className ?? "border-slate-200 bg-slate-100 text-slate-600",
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="p-1.5 shrink-0 rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove ${title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
          {footer}
        </div>
      )}
    </div>
  );
}
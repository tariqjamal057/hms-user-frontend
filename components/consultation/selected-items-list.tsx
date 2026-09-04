"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

type SelectedItemBadge = {
  label: string;
  className?: string;
};

export type SelectedItem = {
  id: string;
  title: string;
  meta?: ReactNode;
  badges?: SelectedItemBadge[];
  trailing?: ReactNode;
  gradient?: "blue" | "violet" | "emerald" | "amber";
};

type SelectedItemsListProps = {
  items: SelectedItem[];
  onRemove: (id: string) => void;
  emptyMessage?: string;
  className?: string;
};

const GRADIENTS: Record<NonNullable<SelectedItem["gradient"]>, string> = {
  blue: "bg-gradient-to-r from-sky-50 to-blue-50 ring-blue-200",
  violet: "bg-gradient-to-r from-violet-50 to-fuchsia-50 ring-violet-200",
  emerald: "bg-gradient-to-r from-emerald-50 to-teal-50 ring-emerald-200",
  amber: "bg-gradient-to-r from-amber-50 to-orange-50 ring-amber-200",
};

const DEFAULT_GRADIENT = "bg-gradient-to-r from-slate-50 to-sky-50 ring-slate-200";

/**
 * Unified read-only list of values picked from the sidebar drawers.
 * Each row is a tidy card: title, optional meta line, optional inline
 * badge chips, and a trailing slot (before the remove action).
 * Used across step 2 (diagnosis), 3 (medicine) and 4 (lab orders).
 */
export function SelectedItemsList({
  items,
  onRemove,
  emptyMessage = "No items added yet.",
  className,
}: SelectedItemsListProps) {
  if (items.length === 0) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center ${className ?? ""}`.trim()}>
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`.trim()}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-3 ${item.gradient ? GRADIENTS[item.gradient] : DEFAULT_GRADIENT}`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
            {item.meta != null && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{item.meta}</p>
            )}
            {item.badges && item.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {item.badges.map((badge, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className ?? "border-slate-200 bg-slate-100 text-slate-600"}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.trailing}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              aria-label={`Remove ${item.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
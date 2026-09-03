"use client";

import { cn } from "@/lib/utils";
import type { ActivityCardProps } from "./types";

const COLUMNS_CLASS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export default function ActivityCard({
  title,
  description,
  action,
  items,
  children,
  columns = 1,
  emptyText = "No activity to show.",
  className,
}: ActivityCardProps) {
  const hasItems = items && items.length > 0;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.055)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 text-[11px] text-slate-500">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children ? (
        children
      ) : hasItems ? (
        <ul
          className={cn(
            "divide-y divide-slate-100",
            columns > 1 && `grid gap-px bg-slate-100 divide-y-0 ${COLUMNS_CLASS[columns]}`
          )}
        >
          {items!.map((item) => (
            <li key={item.id} className="bg-white">
              <div className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full bg-slate-300",
                    item.dotClassName
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-xs text-slate-700">
                  {item.title}
                  {item.description ? ` · ${item.description}` : ""}
                </span>
                {item.meta && (
                  <span className="shrink-0 text-[10px] font-medium text-slate-400">
                    {item.meta}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-6 text-center text-xs text-slate-400">{emptyText}</p>
      )}
    </section>
  );
}

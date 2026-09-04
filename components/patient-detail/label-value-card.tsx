// components/patient-detail/label-value-card.tsx
"use client";

import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LabelValueRow = {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string }>;
};

export type LabelValueCardProps = {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  subtitle?: string;
  rows: LabelValueRow[];
  className?: string;
  emptyText?: string;
};

export function LabelValueCard({
  title,
  icon: TitleIcon,
  subtitle,
  rows,
  className,
  emptyText = "No records available",
}: LabelValueCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex-col items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          {TitleIcon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <TitleIcon aria-hidden className="h-3.5 w-3.5" />
            </span>
          )}
          <p className="text-sm font-semibold text-slate-800">{title}</p>
        </div>
        {subtitle && (
          <span className="text-[11px] text-slate-400">{subtitle}</span>
        )}
      </div>

      <div className="px-4 py-3">
        {rows.length === 0 ? (
          <p className="py-2 text-center text-xs text-slate-400">
            {emptyText}
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.label}
                  className="flex items-center justify-between gap-3 rounded-lg px-1.5 py-1 text-sm transition-colors hover:bg-slate-50"
                >
                  <span className="flex min-w-0 items-center gap-2 text-slate-500">
                    {Icon && <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{r.label}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-slate-800">
                    {r.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

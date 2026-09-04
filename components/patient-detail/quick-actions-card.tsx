// components/patient-detail/quick-actions-card.tsx
"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { PillButton } from "@/components/forms/pill-button";

export type QuickActionItem = {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: "gradient" | "outline" | "danger";
};

export type QuickActionsCardProps = {
  actions: QuickActionItem[];
  title?: string;
  className?: string;
};

export function QuickActionsCard({
  actions,
  title = "Quick Actions",
  className,
}: QuickActionsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        {actions.map((a, i) => (
          <PillButton
            key={a.label}
            variant={a.variant ?? (i === 0 ? "gradient" : "outline")}
            icon={a.icon}
            onClick={a.onClick}
            className="w-full justify-start"
          >
            {a.label}
          </PillButton>
        ))}
      </div>
    </div>
  );
}

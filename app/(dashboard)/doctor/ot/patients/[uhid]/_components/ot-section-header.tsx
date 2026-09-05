// app/(dashboard)/doctor/ot/patients/[uhid]/_components/ot-section-header.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function OtSectionHeader({
  icon,
  title,
  subtitle,
  tone = "from-sky-500 to-indigo-500",
  right,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  tone?: string;
  right?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4",
        right ? "sm:flex-row sm:items-center sm:justify-between" : "",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            tone,
          )}
        >
          {icon}
        </span>
        <div>
          <p className="text-lg font-bold tracking-tight text-slate-800">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
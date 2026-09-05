// app/(dashboard)/nurseAdmin/ipd/all-ward-patients/_components/drawer/section-header.tsx
"use client";
import type { ReactNode } from "react";

export function SectionHeader({
  icon,
  title,
  subtitle,
  tone = "from-blue-500 to-cyan-500",
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  tone?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-sm`}>
          {icon}
        </span>
        <div>
          <p className="text-lg font-bold tracking-tight text-slate-800">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
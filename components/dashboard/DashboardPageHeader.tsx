import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardPageHeaderProps {
  /** Small eyebrow label above the title (uppercase) */
  eyebrow?: string;
  /** Main heading */
  title: string;
  /** Optional subtitle line */
  description?: ReactNode;
  /** Optional metadata, e.g. date/time, rendered in the description area */
  meta?: ReactNode;
  /** Right-aligned action buttons */
  actions?: ReactNode;
  className?: string;
}

export default function DashboardPageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 lg:text-[26px]">
          {title}
        </h1>
        {(description || meta) && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
            {description && meta ? " · " : ""}
            {meta}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

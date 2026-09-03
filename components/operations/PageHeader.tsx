import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Small eyebrow label above the title (uppercase) */
  eyebrow?: string;
  /** Main heading */
  title: string;
  /** Optional subtitle line */
  description?: ReactNode;
  /** Optional metadata (e.g. date), rendered in the description area */
  meta?: ReactNode;
  /** Right-aligned action buttons */
  actions?: ReactNode;
  /** Card vs plain display mode */
  variant?: "plain" | "card";
  className?: string;
}

/**
 * Unified page header used across all role screens.
 * "plain" renders an inline header; "card" wraps it in a white card.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  variant = "plain",
  className,
}: PageHeaderProps) {
  const inner = (
    <div
      className={cn(
        "flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        variant === "card" && "gap-5"
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[26px]",
            variant === "card" && "text-lg sm:text-xl"
          )}
        >
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
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          className
        )}
      >
        {inner}
      </div>
    );
  }

  return <div className={cn(className)}>{inner}</div>;
}
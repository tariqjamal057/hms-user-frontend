// components/patient-detail/info-tile.tsx
"use client";

import { isValidElement } from "react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InfoTileTone =
  | "blue"
  | "purple"
  | "amber"
  | "emerald"
  | "red"
  | "slate";

const TONE_STYLES: Record<
  InfoTileTone,
  { ring: string; icon: string; accent: string }
> = {
  blue: {
    ring: "border-blue-200/80 bg-blue-50/60 hover:border-blue-300 hover:bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    accent: "from-blue-500 to-cyan-500",
  },
  purple: {
    ring: "border-purple-200/80 bg-purple-50/60 hover:border-purple-300 hover:bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    accent: "from-purple-500 to-violet-500",
  },
  amber: {
    ring: "border-amber-200/80 bg-amber-50/60 hover:border-amber-300 hover:bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    accent: "from-amber-500 to-orange-500",
  },
  emerald: {
    ring: "border-emerald-200/80 bg-emerald-50/60 hover:border-emerald-300 hover:bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    accent: "from-emerald-500 to-teal-500",
  },
  red: {
    ring: "border-red-200/80 bg-red-50/60 hover:border-red-300 hover:bg-red-50",
    icon: "bg-red-100 text-red-600",
    accent: "from-red-500 to-rose-500",
  },
  slate: {
    ring: "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50",
    icon: "bg-slate-100 text-slate-600",
    accent: "from-slate-500 to-slate-700",
  },
};

export type InfoTileProps = {
  label: string;
  value: ReactNode;
  /** Optional icon shown in the colored chip above the value. */
  icon?: ComponentType<{ className?: string }> | ReactNode;
  tone?: InfoTileTone;
  /** When true, show a vertical accent stripe on the left edge. */
  accent?: boolean;
  /** Optional helper text rendered below the value. */
  hint?: string;
  /** When true, value is rendered with `whitespace-pre-line`. */
  multiline?: boolean;
  className?: string;
  /** Optional click handler — makes the tile keyboard-focusable. */
  onClick?: () => void;
};

/**
 * Unified interactive info tile used in patient detail sections (e.g. the
 * Emergency Registration card). Renders a tone-tinted rounded card with a
 * leading icon chip, label, and emphasized value. Hover lifts the tile
 * slightly. When `onClick` is provided the tile becomes a focusable button.
 */
export function InfoTile({
  label,
  value,
  icon,
  tone = "slate",
  accent = false,
  hint,
  multiline = false,
  className,
  onClick,
}: InfoTileProps) {
  const style = TONE_STYLES[tone];
  const interactive = Boolean(onClick);

  const content = (
    <>
      {accent && (
        <span
          className={cn(
            "absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b",
            style.accent,
          )}
          aria-hidden
        />
      )}
      <div className="flex items-start gap-2">
        {icon && (
          <span
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
              style.icon,
            )}
            aria-hidden
          >
            {renderIcon(icon)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold text-slate-800",
              multiline && "whitespace-pre-line",
            )}
          >
            {value || "—"}
          </p>
          {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
        </div>
      </div>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative w-full cursor-pointer overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
          style.ring,
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
        style.ring,
        className,
      )}
    >
      {content}
    </div>
  );
}

function renderIcon(icon: ComponentType<{ className?: string }> | ReactNode) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    const Cmp = icon as ComponentType<{ className?: string }>;
    try {
      return <Cmp className="h-3.5 w-3.5" />;
    } catch {
      return null;
    }
  }
  return null;
}

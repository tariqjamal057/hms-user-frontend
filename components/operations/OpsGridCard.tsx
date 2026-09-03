import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

type StatTone = "default" | "positive" | "negative" | "warning";

export interface OpsGridStat {
  label: string;
  value: ReactNode;
  tone?: StatTone;
}

export interface OpsGridAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline";
}

interface OpsGridCardProps {
  /** Gradient classes for the top accent bar, e.g. "from-blue-500 via-cyan-500 to-blue-500" */
  accent?: string;
  avatar?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Top-right badge (status / acuity / payment). */
  badge?: ReactNode;
  /** Optional contextual info panel (doctor / ward / specialty). */
  context?: ReactNode;
  /** Two-column label/value stat grid. */
  stats?: OpsGridStat[];
  /** Row of small badges rendered below the stats. */
  footerTags?: ReactNode;
  /** Footer action button. If omitted, no footer is shown. */
  action?: OpsGridAction;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

const statToneClass: Record<StatTone, string> = {
  default: "text-slate-700",
  positive: "text-emerald-600",
  negative: "text-red-600",
  warning: "text-amber-600",
};

/**
 * Unified grid-view card. Provides a consistent shell (accent bar, avatar +
 * title + badge header, context panel, stat grid, footer tags, action button)
 * that every list page reuses so grid cards look identical across modules.
 * Entity-specific content can be supplied via the `children` slot.
 */
export default function OpsGridCard({
  accent = "from-blue-500 via-cyan-500 to-blue-500",
  avatar,
  title,
  subtitle,
  badge,
  context,
  stats = [],
  footerTags,
  children,
  action,
  onClick,
  className,
}: OpsGridCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className={cn("h-1 bg-gradient-to-r", accent)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {avatar && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">
                {avatar}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-bold text-slate-800">{title}</div>
              {subtitle && (
                <div className="truncate text-xs text-slate-400">{subtitle}</div>
              )}
            </div>
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {context && <div className="mt-4 rounded-xl bg-slate-50 p-3">{context}</div>}

        {stats.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-lg border border-slate-100 p-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <p className={cn("mt-1 truncate text-sm font-bold", statToneClass[stat.tone ?? "default"])}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {footerTags && <div className="mt-3 flex items-center gap-2">{footerTags}</div>}

        {children}

        {action && (
          <Button
            variant={action.variant ?? "outline"}
            className="mt-4 w-full gap-2 border-blue-200 text-blue-700"
            onClick={action.onClick}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

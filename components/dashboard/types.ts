import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type TrendDirection = "up" | "down" | "neutral";
export type TrendTone = "positive" | "negative" | "warning" | "neutral";
/** Accent colour treatment used for a KPI card's icon tile, top accent and label */
export type KpiAccent =
  | "blue"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "violet";

export interface TrendInfo {
  /** A number like 12.8 or -6.2; sign is used when direction is not provided */
  value: number;
  /** Optional, forces the semantic direction if different from value sign */
  direction?: TrendDirection;
  /** Semantic colour treatment */
  tone?: TrendTone;
  /** Comparison label, e.g. "vs yesterday" */
  label?: string;
  /** Text rendered next to the arrow, e.g. "↑ 12.8%" */
  display?: string;
}

export interface SparklinePoint {
  value: number;
  color?: string;
}

export interface KpiCardProps {
  id?: string;
  /** Card title (uppercase eyebrow label) */
  label: string;
  /** Primary displayed value */
  value: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Icon tile colour classes (bg + text), defaults to blue */
  iconClassName?: string;
  /** Accent colour for the icon tile, top accent and label; adds visual variety */
  accent?: KpiAccent;
  /** Trend / change information */
  trend?: TrendInfo;
  /** Optional sparkline data (normalised 0-100 heights) */
  sparkline?: number[];
  /** Footer note line */
  footer?: string;
  /** Click handler for drill-down; makes card interactive when provided */
  onClick?: () => void;
  /** Optional href — renders an anchor instead of a button when provided */
  href?: string;
  /** Optional link/action label, e.g. "View all →" */
  actionLabel?: string;
  className?: string;
}

export interface ActivityItem {
  id: string;
  /** Primary title text */
  title: string;
  /** Secondary supporting text */
  description?: string;
  /** Small meta line (time / owner / department) */
  meta?: string;
  /** Accent dot colour */
  dotClassName?: string;
  /** Action label on the right, e.g. "Review", "Open" */
  actionLabel?: string;
  /** Action tone, e.g. "rose" | "amber" | "blue" | "emerald" */
  actionTone?: string;
  onClick?: () => void;
}

export interface ActivityCardProps {
  title: string;
  description?: string;
  /** Header action / right-side link */
  action?: ReactNode;
  items?: ActivityItem[];
  /** Custom content — takes precedence over items */
  children?: ReactNode;
  /** Column count for the items grid (for grid-style layouts) */
  columns?: 1 | 2 | 3 | 4;
  emptyText?: string;
  className?: string;
}

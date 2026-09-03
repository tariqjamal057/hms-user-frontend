import type { LucideIcon } from "lucide-react";

/** Tone keys for functional color on stat cards and badges. */
export type Tone = "blue" | "indigo" | "emerald" | "amber" | "rose" | "violet";

/** A single info stat rendered as one of the 4 stat cards. */
export interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Displays a small caption under the value (e.g. a delta or unit). */
  hint?: string;
  tone?: Tone;
  /** Optional click handler on the card. */
  onClick?: () => void;
}

/** A single select-based filter option. */
export interface SelectFilterOption {
  value: string;
  label: string;
}

/** A select-based filter field. */
export interface SelectFilterField {
  key: string;
  label: string;
  placeholder?: string;
  options: SelectFilterOption[];
  selected?: string;
}

/** The list/grid view toggle state. */
export type ViewMode = "list" | "grid";
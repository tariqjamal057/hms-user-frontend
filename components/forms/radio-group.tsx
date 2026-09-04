"use client";

import { cn } from "@/lib/utils";

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export type RadioGroupProps<T extends string> = {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
  showDot?: boolean;
  className?: string;
};

/**
 * Unified segmented radio group. Renders each option as a selectable pill with
 * an optional colored radio dot (only shown when `showDot` is true); the active
 * option is highlighted with a gradient fill/ring.
 */
export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  name = "radio-group",
  showDot = false,
  className,
}: RadioGroupProps<T>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "cursor-pointer inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-200",
              showDot && "gap-2",
              selected
                ? "border-blue-500 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 ring-1 ring-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]",
            )}
          >
            {showDot && (
              <span
                className={cn(
                  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                  selected
                    ? "border-white bg-white/20"
                    : "border-slate-300 bg-white",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all duration-200",
                    selected ? "bg-white scale-100" : "scale-0",
                  )}
                />
              </span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
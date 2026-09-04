// components/forms/form-controls.tsx
"use client";
import { useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SuffixedInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
  type?: string;
  className?: string;
};

// Unified labeled input with an optional unit suffix (e.g. BP 138/86 mmHg).
// Built on top of the base `Input` primitive.
export function SuffixedInput({
  label,
  value,
  onChange,
  suffix,
  placeholder,
  type = "text",
  className,
}: SuffixedInputProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1.5 flex h-9 items-center overflow-hidden rounded-lg border border-slate-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm placeholder:text-slate-400 focus-visible:ring-0"
          placeholder={placeholder}
        />
        {suffix && (
          <span className="flex shrink-0 items-center self-stretch border-l border-slate-200 bg-slate-100 px-2.5 py-0 text-xs font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export type FormTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  className?: string;
};

// Unified labeled textarea built on top of the base `Textarea` primitive.
// Uses the base field-sizing auto-grow and shows a live char counter when
// `maxLength` is provided.
export function FormTextarea({
  label,
  value,
  onChange,
  rows = 3,
  maxLength,
  placeholder,
  className,
}: FormTextareaProps) {
  const showCounter = typeof maxLength === "number" && maxLength > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {showCounter && (
          <span className="text-[10px] tabular-nums text-slate-400">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(maxLength ? v.slice(0, maxLength) : v);
        }}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className="border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

export type DateFieldProps = {
  label: string;
  value: string; // ISO yyyy-mm-dd
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  className?: string;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Custom interactive date selector: text input + calendar popover with
// month navigation and a day grid. Emits an ISO yyyy-mm-dd string.
export function DateField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  min,
  className,
}: DateFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [viewYear, setViewYear] = useState<number | null>(null);
  const [viewMonth, setViewMonth] = useState<number | null>(null); // 0-based

  const today = new Date();
  const parsed = parseIso(value);
  const year = viewYear ?? parsed?.year ?? today.getFullYear();
  const month = viewMonth ?? parsed?.month ?? today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const minParsed = parseIso(min ?? "");
  const minDate = minParsed
    ? new Date(minParsed.year, minParsed.month, minParsed.day)
    : null;

  function goMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  function pick(d: number) {
    const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
    onChange(iso);
    setOpen(false);
  }

  function toggle() {
    if (!open) setOpenUp(shouldFlipUp(rootRef.current));
    setOpen((o) => !o);
  }

  const display =
    parsed ? `${pad(parsed.day)} ${MONTHS[parsed.month]} ${parsed.year}` : value;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1.5 flex h-9 items-center overflow-hidden rounded-lg border border-slate-300 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
        <input
          type="text"
          value={display}
          readOnly
          onMouseDown={(e) => {
            e.preventDefault();
            toggle();
          }}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 cursor-pointer bg-transparent px-2.5 text-sm transition placeholder:text-slate-400 focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={toggle}
          aria-label="Open calendar"
          className="flex shrink-0 items-center justify-center self-stretch border-l border-slate-200 bg-slate-100 px-2.5 text-slate-500 transition hover:bg-slate-200 hover:text-blue-600"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className={cn(
          "absolute left-0 z-[100] w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl",
          openUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}>
          <div className="flex items-center justify-between px-2 pt-1.5">
            <span className="text-sm font-bold text-slate-700">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px border-b border-slate-100 bg-slate-50">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1.5 text-center text-[10px] font-bold uppercase text-slate-400"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-50">
            {Array.from({ length: firstDay }, (_, e) => (
              <div key={`e${e}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
              const isSelected = iso === value;
              const isToday =
                year === today.getFullYear() &&
                month === today.getMonth() &&
                d === today.getDate();
              const isPast =
                minDate && new Date(year, month, d) < minDate;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={!!isPast}
                  onClick={() => pick(d)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition",
                    isSelected
                      ? "bg-blue-600 font-bold text-white shadow"
                      : isToday
                        ? "border border-blue-400 font-semibold text-blue-600 hover:bg-blue-50"
                        : "text-slate-600 hover:bg-slate-100",
                    isPast ? "cursor-not-allowed text-slate-300" : "",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function parseIso(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function shouldFlipUp(
  el: HTMLElement | null,
  estimate = 340,
): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const below = window.innerHeight - r.bottom;
  const above = r.top;
  return below < estimate && above > below;
}

export type FormButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "gradient" | "outline";
  size?: "default" | "sm";
  disabled?: boolean;
  className?: string;
};

// Unified action button. `gradient` renders the primary blue->cyan CTA used
// across the consultation steps; `outline` renders a secondary action.
export function FormButton({
  children,
  onClick,
  variant = "gradient",
  size = "default",
  disabled = false,
  className,
}: FormButtonProps) {
  return (
<Button
      onClick={onClick}
      size={size}
      variant="ghost"
      disabled={disabled}
      className={cn(
        "transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 hover:scale-105",
        variant === "gradient"
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:text-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/30 hover:from-blue-700 hover:to-cyan-600 active:scale-[0.98]"
          : "border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-sm active:translate-y-0",
        className,
      )}
    >
      {children}
    </Button>
  );
}
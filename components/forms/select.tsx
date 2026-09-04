// components/forms/select.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectBaseProps = {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
};

export type SingleSelectProps = SelectBaseProps & {
  value: string;
  onChange: (value: string) => void;
};

// Unified interactive single-select dropdown with optional search.
export function SingleSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select option",
  searchable = false,
  searchPlaceholder = "Search...",
  className,
}: SingleSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);
  const filtered = filterOptions(options, query);

  function toggle() {
    if (!open) {
      setOpenUp(shouldOpenUp(rootRef.current));
      setQuery("");
    }
    setOpen((o) => !o);
  }
  function close() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <button
        type="button"
        onClick={toggle}
        className="mt-1.5 flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-2.5 text-sm shadow-sm transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        <span className={cn("min-w-0 flex-1 truncate text-left", selected ? "text-slate-800" : "text-slate-400")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      <Dropdown open={open} openUp={openUp}>
        {searchable && (
          <SearchInput
            query={query}
            onChange={setQuery}
            placeholder={searchPlaceholder}
          />
        )}
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-slate-400">No options found</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-1.5">
            {filtered.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    disabled={!!opt.disabled}
                    onClick={() => {
                      onChange(opt.value);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                      active
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-slate-700 hover:bg-slate-100",
                      opt.disabled ? "cursor-not-allowed text-slate-300" : "",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {active && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Dropdown>
    </div>
  );
}

export type MultiSelectProps = SelectBaseProps & {
  values: string[];
  onChange: (values: string[]) => void;
};

// Unified interactive multi-select dropdown with removable chips and optional search.
export function MultiSelect({
  label,
  values,
  options,
  onChange,
  placeholder = "Select options",
  searchable = false,
  searchPlaceholder = "Search...",
  className,
}: MultiSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOptions = options.filter((o) => values.includes(o.value));
  const filtered = filterOptions(options, query);

  function toggle() {
    if (!open) {
      setOpenUp(shouldOpenUp(rootRef.current));
      setQuery("");
    }
    setOpen((o) => !o);
  }
  function close() {
    setOpen(false);
    setQuery("");
  }
  function toggleValue(v: string) {
    onChange(
      values.includes(v)
        ? values.filter((x) => x !== v)
        : [...values, v],
    );
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "mt-1.5 flex min-h-9 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-2.5 text-sm shadow-sm transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
          selectedOptions.length === 0 ? "h-9" : "",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedOptions.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : selectedOptions.length === 1 ? (
            <span className="text-slate-800">{selectedOptions[0].label}</span>
          ) : (
            <span className="text-slate-800">
              {selectedOptions.length} selected
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {selectedOptions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              <span className="max-w-[10rem] truncate">{opt.label}</span>
              <button
                type="button"
                onClick={() => toggleValue(opt.value)}
                aria-label={`Remove ${opt.label}`}
                className="text-blue-600 transition hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Dropdown open={open} openUp={openUp}>
        {searchable && (
          <SearchInput
            query={query}
            onChange={setQuery}
            placeholder={searchPlaceholder}
          />
        )}
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-slate-400">No options found</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-1.5">
            {filtered.map((opt) => {
              const active = values.includes(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    disabled={!!opt.disabled}
                    onClick={() => toggleValue(opt.value)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                      active
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "hover:bg-slate-100 text-slate-700",
                      opt.disabled ? "cursor-not-allowed text-slate-300" : "",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white",
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Dropdown>
    </div>
  );
}

function SearchInput({
  query,
  onChange,
  placeholder,
}: {
  query: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative border-b border-slate-100 p-2">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
      />
    </div>
  );
}

function Dropdown({
  open,
  openUp,
  children,
}: {
  open: boolean;
  openUp: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    openUp ? (
      <div className="absolute left-0 bottom-full z-[500] mb-1.5 min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        {children}
      </div>
    ) : (
      <div className="absolute left-0 top-full z-[500] mt-1.5 min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        {children}
      </div>
    )
  );
}

function shouldOpenUp(el: HTMLElement | null, estimate = 320): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const below = window.innerHeight - r.bottom;
  const above = r.top;
  return below < estimate && above > below;
}

function filterOptions(
  options: SelectOption[],
  query: string,
): SelectOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  );
}
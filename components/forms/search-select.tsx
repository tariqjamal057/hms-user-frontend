// components/forms/search-select.tsx
"use client";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchSelectOption = {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
};

type SearchSelectProps = {
  options: SearchSelectOption[];
  onSelect: (option: SearchSelectOption) => void;
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  selectedValue?: string;
  noResultsText?: string;
};

// Unified search + typeahead dropdown. The results list stays hidden until the
// user types (query.trim().length > 0), then renders flush against the input
// with no gap. Selecting an option lets the caller clear the query to hide it.
export function SearchSelect({
  options,
  onSelect,
  query,
  onQueryChange,
  placeholder = "Search…",
  selectedValue,
  noResultsText = "No results found.",
}: SearchSelectProps) {
  const typing = query.trim().length > 0;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm placeholder:text-slate-400 outline-none focus-visible:ring-0",
          typing ? "rounded-t-xl rounded-b-none" : "rounded-xl",
        )}
      />
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      {typing && (
        <div className="absolute left-0 top-full z-[500] max-h-56 w-full overflow-y-auto rounded-b-xl border-x border-b border-slate-200 bg-white shadow-lg [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blue-500">
          {options.length > 0 ? (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-left transition",
                  opt.value === selectedValue ? "bg-blue-50" : "hover:bg-slate-50",
                )}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  {opt.icon && <span className="shrink-0 text-slate-400">{opt.icon}</span>}
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-700">
                    {opt.label}
                  </span>
                </span>
                {opt.sublabel && (
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    {opt.sublabel}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-slate-400">{noResultsText}</p>
          )}
        </div>
      )}
    </div>
  );
}
// app/(dashboard)/billing/ipd/_components/drawer/date-filter-bar.tsx
"use client";
import { Filter, X } from "lucide-react";
import { DateField } from "@/components/forms/form-controls";

export function DateFilterBar({
  value,
  onChange,
  label = "Filter by date",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-end">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:pb-2">
        <Filter className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="flex-1 sm:max-w-[220px]">
        <DateField value={value} onChange={onChange} label="" placeholder="Pick a date" />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:self-auto"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}

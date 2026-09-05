// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/date-filter-bar.tsx
"use client";
import { CalendarDays, X } from "lucide-react";
import { DateField } from "@/components/forms/form-controls";

export function DateFilterBar({ value, onChange, label = "Filter by date" }: { value: string; onChange: (value: string) => void; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />
        {label}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <DateField label="" value={value} onChange={onChange} placeholder="All dates" className="w-44" />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear date filter"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
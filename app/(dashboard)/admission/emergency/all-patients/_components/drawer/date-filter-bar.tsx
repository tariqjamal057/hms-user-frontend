// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/date-filter-bar.tsx
"use client";
import { CalendarDays, X } from "lucide-react";
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
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />
      <span className="shrink-0 text-xs font-medium text-slate-500">{label}</span>
      <div className="ml-auto w-44">
        <DateField
          label=""
          value={value}
          onChange={onChange}
          placeholder="Select date"
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

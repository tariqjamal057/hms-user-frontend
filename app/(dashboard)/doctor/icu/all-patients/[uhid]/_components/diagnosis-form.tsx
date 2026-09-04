// app/(dashboard)/doctor/icu/patients/[uhid]/_components/diagnosis-form.tsx
"use client";
import { useRef, useState } from "react";
import { BookMarked, Check, Stethoscope, X } from "lucide-react";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import { SelectedItemCard } from "@/components/consultation/selected-item-card";
import { FormButton } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import {
  SearchSelect,
  type SearchSelectOption,
} from "@/components/forms/search-select";
import { cn } from "@/lib/utils";
import type { DiagnosisItem } from "@/types/doctor/icu/doctor-icu-types";

type DiagnosisStatus = "Active" | "Resolved" | "Chronic" | "Rule Out";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DiagnosisItem[]) => void;
  notedBy?: string;
};

const DIAGNOSIS_CATALOG = [
  { code: "I21.9", name: "Acute Myocardial Infarction" },
  { code: "J18.9", name: "Pneumonia" },
  { code: "K80.20", name: "Calculus of Gallbladder" },
  { code: "E11.9", name: "Type 2 Diabetes Mellitus" },
  { code: "I10", name: "Essential Hypertension" },
  { code: "T14.90", name: "Multiple Traumatic Injuries" },
  { code: "T39.9", name: "Drug Overdose" },
];

const STATUS_OPTIONS: { value: DiagnosisStatus; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Resolved", label: "Resolved" },
  { value: "Chronic", label: "Chronic" },
  { value: "Rule Out", label: "Rule Out" },
];

const STATUS_BADGE: Record<DiagnosisStatus, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Resolved: "border-slate-200 bg-slate-100 text-slate-600",
  Chronic: "border-amber-200 bg-amber-50 text-amber-700",
  "Rule Out": "border-blue-200 bg-blue-50 text-blue-700",
};

export function DiagnosisForm({ open, onOpenChange, onSubmit, notedBy = "Doctor" }: Props) {
  const idRef = useRef(0);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<DiagnosisItem[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setQuery("");
      setRows([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const options: SearchSelectOption[] = DIAGNOSIS_CATALOG.map((d) => ({
    value: d.code,
    label: d.name,
    sublabel: d.code,
  }));

  function pick(opt: SearchSelectOption) {
    const d = DIAGNOSIS_CATALOG.find((x) => x.code === opt.value);
    if (!d) return;
    if (rows.some((r) => r.code === d.code)) return;
    setRows((prev) => [
      ...prev,
      {
        id: `DIAG-${++idRef.current}`,
        code: d.code,
        name: d.name,
        status: "Active",
        notedAt: new Date().toISOString(),
        notedBy,
      },
    ]);
    setQuery("");
  }

  function updateStatus(id: string, status: DiagnosisStatus) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  }

  function removeItem(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function submit() {
    onSubmit(rows);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Stethoscope className="h-5 w-5" />}
      title="Add Diagnosis"
      description="Search the ICD catalogue — selecting a diagnosis adds it instantly."
      footer={
        <div className="flex items-center gap-3">
          <FormButton
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton
            className="flex-1"
            onClick={submit}
            disabled={rows.length === 0}
          >
            <Check className="mr-1 h-4 w-4" />
            Save Diagnosis{rows.length > 0 ? ` (${rows.length})` : ""}
          </FormButton>
        </div>
      }
    >
      <SearchSelect
        options={options.filter((o) =>
          `${o.label} ${o.sublabel}`.toLowerCase().includes(query.toLowerCase()),
        )}
        onSelect={pick}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search diagnosis by name or ICD code..."
        noResultsText="No diagnosis found in the catalogue."
      />

      {rows.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <SelectedItemCard
              key={r.id}
              id={r.id}
              title={r.name}
              onRemove={removeItem}
              accentColor="border-violet-500"
              badges={[
                {
                  label: r.code,
                  className: "border-blue-200 bg-blue-50 text-blue-700",
                },
                {
                  label: r.status,
                  className: cn("capitalize", STATUS_BADGE[r.status]),
                },
              ]}
              footer={
                <div className="w-full space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </span>
                  <SingleSelect
                    label=""
                    value={r.status}
                    onChange={(v) =>
                      updateStatus(r.id, v as DiagnosisStatus)
                    }
                    options={STATUS_OPTIONS}
                  />
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <BookMarked className="mx-auto h-5 w-5 text-slate-300" />
          <p className="mt-1.5 text-sm text-slate-400">
            Search above and select a diagnosis to add it.
          </p>
        </div>
      )}
    </ConsultationDrawer>
  );
}

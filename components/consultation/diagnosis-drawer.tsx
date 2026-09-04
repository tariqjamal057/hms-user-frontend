"use client";

import { useRef, useState } from "react";
import { BookMarked, Check, Plus, Stethoscope, Trash2 } from "lucide-react";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { FormButton } from "@/components/forms/form-controls";
import { SearchSelect, type SearchSelectOption } from "@/components/forms/search-select";

export type DiagnosisDraft = {
  id: string;
  name: string;
  icd10: string;
  type: "provisional" | "active" | "chronic";
};

type DiagnosisDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (items: DiagnosisDraft[]) => void;
};

export const DIAGNOSIS_CATALOGUE = [
  { name: "Community-acquired pneumonia, suspected", icd10: "J18.9" },
  { name: "Type 2 diabetes mellitus without complication", icd10: "E11.9" },
  { name: "Essential hypertension", icd10: "I10" },
  { name: "Acute upper respiratory infection", icd10: "J06.9" },
  { name: "Gastroenteritis, unspecified", icd10: "A09" },
  { name: "Migraine, unspecified", icd10: "G43.9" },
  { name: "Allergic rhinitis, unspecified", icd10: "J30.9" },
  { name: "Urinary tract infection, unspecified", icd10: "N39.0" },
];

const TYPE_OPTIONS: { value: DiagnosisDraft["type"]; label: string }[] = [
  { value: "provisional", label: "Provisional" },
  { value: "active", label: "Active" },
  { value: "chronic", label: "Chronic" },
];

const TYPE_BADGE: Record<DiagnosisDraft["type"], string> = {
  provisional: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  chronic: "bg-red-50 text-red-700 border-red-200",
};

// Unified "Add Diagnosis" flow: search the ICD-10 catalogue, stack multiple
// picks into a pending basket, and submit them all at once to close the drawer.
export function DiagnosisDrawer({ open, onOpenChange, onSubmit }: DiagnosisDrawerProps) {
  const idRef = useRef(0);
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [icd10, setIcd10] = useState("");
  const [type, setType] = useState<DiagnosisDraft["type"]>("provisional");
  const [pending, setPending] = useState<DiagnosisDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setQuery("");
      setCustomName("");
      setIcd10("");
      setType("provisional");
      setPending([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const catalogueOptions: SearchSelectOption[] = DIAGNOSIS_CATALOGUE.map(
    (d) => ({ value: d.name, label: d.name, sublabel: d.icd10 }),
  );

  function pickCatalogue(opt: SearchSelectOption) {
    setCustomName(opt.label);
    setIcd10(opt.sublabel ?? "");
    setType("provisional");
    setQuery("");
  }

  function addCurrent() {
    if (!customName.trim()) return;
    const draft: DiagnosisDraft = {
      id: `diag-${++idRef.current}`,
      name: customName.trim(),
      icd10: icd10.trim() || "TBD",
      type,
    };
    setPending((prev) => [...prev, draft]);
    setCustomName("");
    setIcd10("");
    setType("provisional");
  }

  function submit() {
    onSubmit(pending);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Stethoscope className="h-5 w-5" />}
      title="Add Diagnosis"
      description="Search the ICD-10 catalogue and add one or more diagnoses."
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={submit} disabled={pending.length === 0}>
            <Check className="mr-1 h-4 w-4" />
            Done{pending.length > 0 ? ` (${pending.length})` : ""}
          </FormButton>
        </div>
      }
    >
      {/* Catalogue search — unified typeahead dropdown */}
      <SearchSelect
        options={catalogueOptions.filter((o) =>
          `${o.label} ${o.sublabel}`.toLowerCase().includes(query.toLowerCase()),
        )}
        onSelect={pickCatalogue}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search ICD-10 catalogue…"
        selectedValue={customName}
        noResultsText="No diagnosis found in the catalogue."
      />

      {/* Selected diagnosis details */}
      <DrawerSection
        title="Diagnosis details"
        caption="Refine the selected diagnosis before adding."
        icon={<Stethoscope className="h-4 w-4" />}
        className="mt-4"
      >
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <Stethoscope className="h-5 w-5 shrink-0 text-blue-500" />
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Diagnosis</label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-slate-800">
                {customName || <span className="font-normal text-slate-400">Select from catalogue…</span>}
              </span>
              <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold ${icd10 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-100 text-slate-400"}`}>
                {icd10 || "ICD-10"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Diagnosis type</label>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  type === opt.value
                    ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 ring-1 ring-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <FormButton
              size="sm"
              onClick={addCurrent}
              disabled={!customName.trim()}
              className="ml-auto"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </FormButton>
          </div>
        </div>
      </DrawerSection>

      {/* Pending basket */}
      {pending.length > 0 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <BookMarked className="h-3.5 w-3.5" />
            Added
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {pending.length}
            </span>
          </p>
          <div className="mt-2.5 space-y-2">
            {pending.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{d.name}</p>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[d.type]}`}>
                    {d.icd10} · {d.type}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPending((prev) => prev.filter((x) => x.id !== d.id))}
                  className="p-1.5 rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${d.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ConsultationDrawer>
  );
}
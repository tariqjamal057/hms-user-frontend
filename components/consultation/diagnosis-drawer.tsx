"use client";

import { useRef, useState } from "react";
import { BookMarked, Check, Stethoscope } from "lucide-react";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import { SelectedItemCard } from "@/components/consultation/selected-item-card";
import { FormButton } from "@/components/forms/form-controls";
import { SearchSelect, type SearchSelectOption } from "@/components/forms/search-select";
import { RadioGroup } from "@/components/forms/radio-group";
import { cn } from "@/lib/utils";

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

const TYPE_BADGE: Record<DiagnosisDraft["type"], string> = {
  provisional: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  chronic: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_OPTIONS: { value: DiagnosisDraft["type"]; label: string }[] = [
  { value: "provisional", label: "Provisional" },
  { value: "active", label: "Active" },
  { value: "chronic", label: "Chronic" },
];

// Unified "Add Diagnosis" flow: search the ICD-10 catalogue — each selection
// auto-adds a new diagnosis card. Refine/remove cards with delete icon, then
// submit all at once to close the drawer.
export function DiagnosisDrawer({ open, onOpenChange, onSubmit }: DiagnosisDrawerProps) {
  const idRef = useRef(0);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DiagnosisDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setQuery("");
      setItems([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const catalogueOptions: SearchSelectOption[] = DIAGNOSIS_CATALOGUE.map(
    (d) => ({ value: d.name, label: d.name, sublabel: d.icd10 }),
  );

  function pickCatalogue(opt: SearchSelectOption) {
    setItems((prev) => [
      ...prev,
      {
        id: `diag-${++idRef.current}`,
        name: opt.label,
        icd10: opt.sublabel ?? "",
        type: "provisional",
      },
    ]);
    setQuery("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((d) => d.id !== id));
  }

  function updateType(id: string, type: DiagnosisDraft["type"]) {
    setItems((prev) => prev.map((d) => (d.id === id ? { ...d, type } : d)));
  }

  function submit() {
    onSubmit(items);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Stethoscope className="h-5 w-5" />}
      title="Add Diagnosis"
      description="Search the ICD-10 catalogue — selecting a result adds it instantly."
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={submit} disabled={items.length === 0}>
            <Check className="mr-1 h-4 w-4" />
            Done{items.length > 0 ? ` (${items.length})` : ""}
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
        noResultsText="No diagnosis found in the catalogue."
      />

      {/* Auto-added diagnosis cards with editable type + delete icon */}
      {items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map((item) => (
            <SelectedItemCard
              key={item.id}
              id={item.id}
              title={item.name}
              onRemove={removeItem}
              badges={[
                {
                  label: item.icd10,
                  className: "border-blue-200 bg-blue-50 text-blue-700",
                },
                {
                  label: item.type,
                  className: cn(
                    "capitalize",
                    TYPE_BADGE[item.type],
                  ),
                },
              ]}
              footer={
                <>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Diagnosis type
                  </span>
                  <RadioGroup
                    name={`diagnosis-type-${item.id}`}
                    options={TYPE_OPTIONS}
                    value={item.type}
                    onChange={(t) => updateType(item.id, t)}
                  />
                </>
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
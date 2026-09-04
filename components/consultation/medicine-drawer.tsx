"use client";

import { useRef, useState } from "react";
import { Check, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import { SelectedItemCard } from "@/components/consultation/selected-item-card";
import { FormButton } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { SearchSelect, type SearchSelectOption } from "@/components/forms/search-select";

export type MedicineDraft = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type MedicineDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (items: MedicineDraft[]) => void;
};

const MEDICINE_CATALOGUE = [
  { id: "1", name: "Azithromycin 500mg Tablet", category: "Antibiotic", defaultDose: "500 mg PO", defaultFreq: "OD", defaultDuration: "3 days", defaultInstructions: "After food" },
  { id: "2", name: "Paracetamol 650mg Tablet", category: "Analgesic", defaultDose: "650 mg PO", defaultFreq: "SOS", defaultDuration: "3 days", defaultInstructions: "For fever > 100F" },
  { id: "3", name: "Ambroxol 30mg Tablet", category: "Mucolytic", defaultDose: "30 mg PO", defaultFreq: "TDS", defaultDuration: "5 days", defaultInstructions: "After meals" },
  { id: "4", name: "Metformin 500mg Tablet", category: "Antidiabetic", defaultDose: "500 mg PO", defaultFreq: "BD", defaultDuration: "30 days", defaultInstructions: "With meals" },
  { id: "5", name: "Amlodipine 5mg Tablet", category: "Antihypertensive", defaultDose: "5 mg PO", defaultFreq: "OD", defaultDuration: "30 days", defaultInstructions: "Morning" },
];

const FREQ_OPTIONS = [
  { value: "OD", label: "OD (Once Daily)" },
  { value: "BD", label: "BD (Twice Daily)" },
  { value: "TDS", label: "TDS (Three Times Daily)" },
  { value: "QID", label: "QID (Four Times Daily)" },
  { value: "SOS", label: "SOS (As Needed)" },
];

const INPUT_CLS =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Unified "Add Medicine" flow: search the formulary — each selection auto-adds a
// new medicine card. Fine-tune dosing inline on each card, then submit all at
// once to close the drawer.
export function MedicineDrawer({ open, onOpenChange, onSubmit }: MedicineDrawerProps) {
  const idRef = useRef(0);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MedicineDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setQuery("");
      setItems([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const catalogueOptions: SearchSelectOption[] = MEDICINE_CATALOGUE.map(
    (m) => ({ value: m.id, label: m.name, sublabel: m.category }),
  );

  function pickCatalogue(opt: SearchSelectOption) {
    const med = MEDICINE_CATALOGUE.find((m) => m.id === opt.value);
    if (!med) return;
    setItems((prev) => [
      ...prev,
      {
        id: `med-${++idRef.current}`,
        name: med.name,
        dosage: med.defaultDose,
        frequency: med.defaultFreq,
        duration: med.defaultDuration,
        instructions: med.defaultInstructions,
      },
    ]);
    setQuery("");
  }

  function updateField(id: string, field: keyof MedicineDraft, value: string) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((m) => m.id !== id));
  }

  function submit() {
    onSubmit(items);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Pill className="h-5 w-5" />}
      title="Add Medicine"
      description="Search the formulary — selecting a medicine adds it instantly."
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
        placeholder="Search medicine catalogue…"
        noResultsText="No medicine found in the formulation."
      />

      {/* Auto-added medicine cards with editable prescription */}
      {items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map((med) => (
            <SelectedItemCard
              key={med.id}
              id={med.id}
              title={med.name}
              onRemove={removeItem}
              accentColor="border-emerald-500"
              footer={
                <div className="w-full space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Dosage &amp; Route</label>
                      <Input
                        value={med.dosage}
                        onChange={(e) => updateField(med.id, "dosage", e.target.value)}
                        className={`mt-0.5 ${INPUT_CLS}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Frequency</label>
                      <div className="mt-0.5">
                        <SingleSelect
                          value={med.frequency}
                          onChange={(v) => updateField(med.id, "frequency", v)}
                          placeholder="Select"
                          options={FREQ_OPTIONS}
                          className="[&>button]:h-9 [&>button]:text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Duration</label>
                      <Input
                        value={med.duration}
                        onChange={(e) => updateField(med.id, "duration", e.target.value)}
                        className={`mt-0.5 ${INPUT_CLS}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Instructions</label>
                      <Input
                        value={med.instructions}
                        onChange={(e) => updateField(med.id, "instructions", e.target.value)}
                        className={`mt-0.5 ${INPUT_CLS}`}
                      />
                    </div>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <Pill className="mx-auto h-5 w-5 text-slate-300" />
          <p className="mt-1.5 text-sm text-slate-400">
            Search above and select a medicine to add it.
          </p>
        </div>
      )}
    </ConsultationDrawer>
  );
}
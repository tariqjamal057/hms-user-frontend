"use client";

import { useRef, useState } from "react";
import { Check, Info, Pill, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
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
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Unified "Add Medicine" flow: interactive catalogue search, auto-filled dosing
// fields, and a multi-add pending basket submitted in one go.
export function MedicineDrawer({ open, onOpenChange, onSubmit }: MedicineDrawerProps) {
  const idRef = useRef(0);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pending, setPending] = useState<MedicineDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setQuery("");
      setSelectedId(null);
      setDosage("");
      setFrequency("");
      setDuration("");
      setInstructions("");
      setPending([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const catalogueOptions: SearchSelectOption[] = MEDICINE_CATALOGUE.map(
    (m) => ({ value: m.id, label: m.name, sublabel: m.category }),
  );

  function select(id: string) {
    const med = MEDICINE_CATALOGUE.find((m) => m.id === id);
    if (!med) return;
    setSelectedId(id);
    setDosage(med.defaultDose);
    setFrequency(med.defaultFreq);
    setDuration(med.defaultDuration);
    setInstructions(med.defaultInstructions);
    setQuery("");
  }

  function addCurrent() {
    const med = MEDICINE_CATALOGUE.find((m) => m.id === selectedId);
    if (!selectedId || !dosage || !frequency) return;

    const draft: MedicineDraft = {
      id: `med-${++idRef.current}`,
      name: med?.name || selectedId,
      dosage,
      frequency,
      duration,
      instructions,
    };
    setPending((prev) => [...prev, draft]);
  }

  function submit() {
    onSubmit(pending);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Pill className="h-5 w-5" />}
      title="Add Medicine"
      description="Pick from the formulary and fine-tune dosing before adding."
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
        onSelect={(opt) => select(opt.value)}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search medicine catalogue…"
        selectedValue={selectedId ?? undefined}
        noResultsText="No medicine found in the formulation."
      />

      {/* Prescription details */}
      {selectedId && (
        <DrawerSection
          title="Prescription details"
          caption="Adjust dosing and route for the selected medicine."
          icon={<Pill className="h-4 w-4" />}
          className="mt-4"
        >
          <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Info className="h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-xs leading-5 text-blue-700">
              <strong>Default:</strong> {dosage} · {frequency} · {duration} · {instructions}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Dosage &amp; Route</label>
            <Input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 500 mg PO"
              className={`mt-1 ${INPUT_CLS}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Frequency</label>
              <SingleSelect
                value={frequency}
                onChange={setFrequency}
                placeholder="Select"
                options={FREQ_OPTIONS}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Duration</label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 5 days"
                className={`mt-1 ${INPUT_CLS}`}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Instructions</label>
            <Input
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. After food"
              className={`mt-1 ${INPUT_CLS}`}
            />
          </div>

          <FormButton size="sm" className="w-full" onClick={addCurrent}>
            <Plus className="mr-1 h-4 w-4" />
            Add to Prescription
          </FormButton>
        </DrawerSection>
      )}

      {/* Pending basket */}
      {pending.length > 0 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Pill className="h-3.5 w-3.5" />
            Added
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {pending.length}
            </span>
          </p>
          <div className="mt-2.5 space-y-2">
            {pending.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {m.dosage} · {m.frequency} · {m.duration}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPending((prev) => prev.filter((x) => x.id !== m.id))}
                  className="p-1.5 rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${m.name}`}
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
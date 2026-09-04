// app/(dashboard)/doctor/icu/patients/[uhid]/_components/medicine-form.tsx
"use client";
import { useRef, useState } from "react";
import { Check, Pill, X } from "lucide-react";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import { SelectedItemCard } from "@/components/consultation/selected-item-card";
import { FormButton, SuffixedInput } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import {
  SearchSelect,
  type SearchSelectOption,
} from "@/components/forms/search-select";
import type { MedicineDraft } from "@/types/doctor/icu/doctor-icu-types";
import {
  FREQUENCY_OPTIONS,
  MEDICINE_CATALOG,
  ROUTE_OPTIONS,
} from "@/lib/doctor/icu/doctor-icu-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MedicineDraft[]) => void;
};

const URGENCY_OPTIONS: { value: MedicineDraft["urgency"]; label: string }[] = [
  { value: "Routine", label: "Routine" },
  { value: "Urgent", label: "Urgent" },
  { value: "Stat", label: "Stat" },
  { value: "Emergency", label: "Emergency" },
];

const URGENCY_BADGE: Record<MedicineDraft["urgency"], string> = {
  Routine: "border-slate-200 bg-slate-100 text-slate-600",
  Urgent: "border-amber-200 bg-amber-50 text-amber-700",
  Stat: "border-orange-200 bg-orange-50 text-orange-700",
  Emergency: "border-red-200 bg-red-50 text-red-700",
};

export function MedicineForm({ open, onOpenChange, onSubmit }: Props) {
  const idRef = useRef(0);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<MedicineDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setQuery("");
      setRows([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const catalogueOptions: SearchSelectOption[] = MEDICINE_CATALOG.map((m) => ({
    value: m.code,
    label: m.name,
    sublabel: `${m.code} · ${m.route}`,
  }));

  function pick(opt: SearchSelectOption) {
    const m = MEDICINE_CATALOG.find((x) => x.code === opt.value);
    if (!m) return;
    if (rows.some((r) => r.medicineCode === m.code)) return;
    setRows((prev) => [
      ...prev,
      {
        medicineName: m.name,
        medicineCode: m.code,
        strength: m.strength,
        route: m.route,
        dose: m.defaultDose ?? m.strength,
        frequency: m.defaultFrequency ?? "OD",
        duration: m.defaultDuration ?? "5 days",
        instructions: m.defaultInstructions ?? "As directed",
        slot: "Immediate",
        scheduledTime: "Now",
        urgency: "Routine",
      },
    ]);
    setQuery("");
  }

  function updateField(
    code: string,
    field: keyof MedicineDraft,
    value: string,
  ) {
    setRows((prev) =>
      prev.map((x) => (x.medicineCode === code ? { ...x, [field]: value } : x)),
    );
  }

  function removeItem(code: string) {
    setRows((prev) => prev.filter((r) => r.medicineCode !== code));
  }

  function submit() {
    onSubmit(rows);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Pill className="h-5 w-5" />}
      title="Add Medicines"
      description="Search the approved formulary — selecting a medicine adds it instantly."
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
            Save Order{rows.length > 0 ? ` (${rows.length})` : ""}
          </FormButton>
        </div>
      }
    >
      <SearchSelect
        options={catalogueOptions.filter((o) =>
          `${o.label} ${o.sublabel}`.toLowerCase().includes(query.toLowerCase()),
        )}
        onSelect={pick}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search medicine by name or code..."
        noResultsText="No medicine found in the formulary."
      />

      {rows.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {rows.map((row) => (
            <SelectedItemCard
              key={row.medicineCode}
              id={row.medicineCode}
              title={row.medicineName}
              onRemove={removeItem}
              accentColor="border-emerald-500"
              badges={[
                {
                  label: row.medicineCode,
                  className: "border-blue-200 bg-blue-50 text-blue-700",
                },
                {
                  label: row.urgency,
                  className: URGENCY_BADGE[row.urgency],
                },
              ]}
              footer={
                <div className="w-full space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <SuffixedInput
                      label="Dose"
                      value={row.dose}
                      onChange={(v) => updateField(row.medicineCode, "dose", v)}
                      placeholder="e.g. 500 mg"
                    />
                    <SingleSelect
                      label="Route"
                      value={row.route}
                      onChange={(v) => updateField(row.medicineCode, "route", v)}
                      options={ROUTE_OPTIONS.map((r) => ({ value: r, label: r }))}
                    />
                    <SingleSelect
                      label="Frequency"
                      value={row.frequency}
                      onChange={(v) =>
                        updateField(row.medicineCode, "frequency", v)
                      }
                      options={FREQUENCY_OPTIONS.map((f) => ({ value: f, label: f }))}
                    />
                    <SuffixedInput
                      label="Duration"
                      value={row.duration}
                      onChange={(v) =>
                        updateField(row.medicineCode, "duration", v)
                      }
                      placeholder="e.g. 5 days"
                    />
                    <SingleSelect
                      label="Urgency"
                      value={row.urgency}
                      onChange={(v) =>
                        updateField(
                          row.medicineCode,
                          "urgency",
                          v as MedicineDraft["urgency"],
                        )
                      }
                      options={URGENCY_OPTIONS}
                    />
                    <SuffixedInput
                      label="Instructions"
                      value={row.instructions}
                      onChange={(v) =>
                        updateField(row.medicineCode, "instructions", v)
                      }
                      placeholder="e.g. After food"
                    />
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

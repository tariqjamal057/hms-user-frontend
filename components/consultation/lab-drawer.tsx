"use client";

import { useRef, useState } from "react";
import { Check, FlaskConical, ScanLine, TestTube } from "lucide-react";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import { SelectedItemCard } from "@/components/consultation/selected-item-card";
import { FormButton } from "@/components/forms/form-controls";
import { SearchSelect, type SearchSelectOption } from "@/components/forms/search-select";
import { RadioGroup } from "@/components/forms/radio-group";
import { cn } from "@/lib/utils";

export type LabDraft = {
  id: string;
  test: string;
  category?: string;
  department: "pathology" | "radiology";
  priority: "routine" | "priority";
};

type LabDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (items: LabDraft[]) => void;
};

const PATHOLOGY_TESTS = [
  { name: "Complete Blood Count (CBC)", category: "Hematology", sample: "EDTA Whole Blood", report: "6 Hours" },
  { name: "Blood Sugar HbA1c", category: "Biochemistry", sample: "Serum", report: "4 Hours" },
  { name: "Lipid Profile", category: "Biochemistry", sample: "Serum", report: "8 Hours" },
  { name: "Liver Function Test", category: "Biochemistry", sample: "Serum", report: "8 Hours" },
  { name: "Kidney Function Test", category: "Biochemistry", sample: "Serum", report: "6 Hours" },
  { name: "CRP Quantitative", category: "Immunology", sample: "Serum", report: "6 Hours" },
  { name: "Urine Routine & Microscopy", category: "Clinical Pathology", sample: "Urine", report: "6 Hours" },
];

const RADIOLOGY_TESTS = [
  { name: "Chest X-Ray PA View", category: "Radiology", sample: "Not Applicable", report: "2 Hours" },
  { name: "ECG (12 Lead)", category: "Cardiology", sample: "Not Applicable", report: "30 Minutes" },
  { name: "Ultrasound Whole Abdomen", category: "Ultrasound", sample: "Not Applicable", report: "24 Hours" },
  { name: "CT Brain Plain", category: "CT Scan", sample: "Not Applicable", report: "4 Hours" },
  { name: "MRI Lumbar Spine", category: "MRI", sample: "Not Applicable", report: "24 Hours" },
];

const PRIORITY_BADGE: Record<"routine" | "priority", string> = {
  routine: "border-slate-200 bg-slate-100 text-slate-600",
  priority: "border-orange-200 bg-orange-50 text-orange-700",
};

type Department = "pathology" | "radiology";

const DEPT_ACCENT: Record<Department, string> = {
  pathology: "border-blue-500 from-blue-50/60",
  radiology: "border-violet-500 from-violet-50/60",
};

// Unified "Add Lab Order" flow with a Pathology / Radiology department toggle.
// Selecting a test auto-adds an order card; fine-tune priority per card, then
// submit all at once to close the drawer.
export function LabDrawer({ open, onOpenChange, onSubmit }: LabDrawerProps) {
  const idRef = useRef(0);
  const [department, setDepartment] = useState<Department>("pathology");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LabDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setDepartment("pathology");
      setQuery("");
      setItems([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const pool = department === "pathology" ? PATHOLOGY_TESTS : RADIOLOGY_TESTS;

  const testOptions: SearchSelectOption[] = pool.map((t) => ({
    value: t.name,
    label: t.name,
    sublabel: t.category,
    icon:
      department === "pathology" ? (
        <TestTube className="h-4 w-4 text-blue-500" />
      ) : (
        <ScanLine className="h-4 w-4 text-violet-500" />
      ),
  }));

  function toggleDepartment(dept: Department) {
    setDepartment(dept);
    setQuery("");
  }

  function pickCatalogue(opt: SearchSelectOption) {
    const test = pool.find((t) => t.name === opt.value);
    setItems((prev) => [
      ...prev,
      {
        id: `lab-${++idRef.current}`,
        test: opt.value,
        category: test?.category,
        department,
        priority: "routine",
      },
    ]);
    setQuery("");
  }

  function updatePriority(id: string, priority: LabDraft["priority"]) {
    setItems((prev) => prev.map((o) => (o.id === id ? { ...o, priority } : o)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((o) => o.id !== id));
  }

  function submit() {
    onSubmit(items);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<FlaskConical className="h-5 w-5" />}
      title="Add Investigation"
      description="Choose a department, then search — selecting a test adds it instantly."
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
      {/* Department toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toggleDepartment("pathology")}
          className={cn(
            "group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
            department === "pathology"
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
              : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm",
          )}
        >
          <span
            className={cn(
              "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
              department === "pathology"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 bg-white text-transparent group-hover:border-blue-300",
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
              department === "pathology"
                ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-sm"
                : "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
            )}
          >
            <TestTube className="h-5 w-5" />
          </span>
          <strong className={cn("mt-2.5 block text-sm font-bold transition-colors", department === "pathology" ? "text-blue-800" : "text-slate-700")}>
            Pathology
          </strong>
          <small className="mt-0.5 block text-xs leading-4 text-slate-500">Blood, urine and laboratory tests</small>
        </button>
        <button
          type="button"
          onClick={() => toggleDepartment("radiology")}
          className={cn(
            "group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200",
            department === "radiology"
              ? "border-violet-500 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20"
              : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm",
          )}
        >
          <span
            className={cn(
              "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
              department === "radiology"
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-300 bg-white text-transparent group-hover:border-violet-300",
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
              department === "radiology"
                ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-sm"
                : "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
            )}
          >
            <ScanLine className="h-5 w-5" />
          </span>
          <strong className={cn("mt-2.5 block text-sm font-bold transition-colors", department === "radiology" ? "text-violet-800" : "text-slate-700")}>
            Radiology
          </strong>
          <small className="mt-0.5 block text-xs leading-4 text-slate-500">X-ray, CT, MRI, USG and ECG</small>
        </button>
      </div>

      {/* Test search — unified typeahead dropdown */}
      <div className="mt-5">
        <SearchSelect
          options={testOptions.filter((o) =>
            `${o.label} ${o.sublabel}`.toLowerCase().includes(query.toLowerCase()),
          )}
          onSelect={pickCatalogue}
          query={query}
          onQueryChange={setQuery}
          placeholder="Search test or keyword…"
          noResultsText="No test found in this department."
        />
      </div>

      {/* Auto-added lab order cards with editable priority */}
      {items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map((order) => (
            <SelectedItemCard
              key={order.id}
              id={order.id}
              title={order.test}
              onRemove={removeItem}
              accentColor={DEPT_ACCENT[order.department]}
              badges={[
                {
                  label: order.department,
                  className: cn(
                    "capitalize",
                    order.department === "pathology"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-violet-200 bg-violet-50 text-violet-700",
                  ),
                },
                {
                  label: order.priority,
                  className: `capitalize ${PRIORITY_BADGE[order.priority]}`,
                },
              ]}
              footer={
                <>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Priority</span>
                  <RadioGroup
                    name={`lab-priority-${order.id}`}
                    options={[
                      { value: "routine", label: "Routine" },
                      { value: "priority", label: "Priority (Today)" },
                    ]}
                    value={order.priority}
                    onChange={(v) => updatePriority(order.id, v)}
                  />
                </>
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <FlaskConical className="mx-auto h-5 w-5 text-slate-300" />
          <p className="mt-1.5 text-sm text-slate-400">
            Search above and select a test to add it.
          </p>
        </div>
      )}
    </ConsultationDrawer>
  );
}
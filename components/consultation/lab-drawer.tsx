"use client";

import { useRef, useState } from "react";
import { Check, FlaskConical, Plus, ScanLine, TestTube, Trash2 } from "lucide-react";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { FormButton } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { SearchSelect, type SearchSelectOption } from "@/components/forms/search-select";
import { cn } from "@/lib/utils";

export type LabDraft = {
  id: string;
  test: string;
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

type Department = "pathology" | "radiology";

// Unified "Add Lab Order" flow with a Pathology / Radiology department toggle —
// only the tests for the selected department are shown.
export function LabDrawer({ open, onOpenChange, onSubmit }: LabDrawerProps) {
  const idRef = useRef(0);
  const [department, setDepartment] = useState<Department>("pathology");
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [priority, setPriority] = useState<"routine" | "priority">("routine");
  const [pending, setPending] = useState<LabDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setDepartment("pathology");
      setQuery("");
      setSelectedName("");
      setPriority("routine");
      setPending([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const pool = department === "pathology" ? PATHOLOGY_TESTS : RADIOLOGY_TESTS;
  const selected = pool.find((t) => t.name === selectedName);

  const testOptions: SearchSelectOption[] = pool.map(
    (t) => ({
      value: t.name,
      label: t.name,
      sublabel: t.category,
      icon:
        department === "pathology" ? (
          <TestTube className="h-4 w-4 text-blue-500" />
        ) : (
          <ScanLine className="h-4 w-4 text-violet-500" />
        ),
    }),
  );

  function toggleDepartment(dept: Department) {
    setDepartment(dept);
    setQuery("");
    setSelectedName("");
  }

  function addCurrent() {
    if (!selected) return;
    const draft: LabDraft = {
      id: `lab-${++idRef.current}`,
      test: selected.name,
      department,
      priority,
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
      icon={<FlaskConical className="h-5 w-5" />}
      title="Add Investigation"
      description="Choose a department, then search and add one or more tests."
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
      {/* Department toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toggleDepartment("pathology")}
          className={cn(
            "rounded-2xl border-2 p-4 text-left transition",
            department === "pathology"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-violet-300",
          )}
        >
          <TestTube className={cn("h-5 w-5", department === "pathology" ? "text-blue-600" : "text-slate-400")} />
          <strong className="mt-2 block text-sm font-semibold text-slate-800">Pathology</strong>
          <small className="mt-0.5 block text-xs leading-4 text-slate-500">Blood, urine and laboratory tests</small>
        </button>
        <button
          type="button"
          onClick={() => toggleDepartment("radiology")}
          className={cn(
            "rounded-2xl border-2 p-4 text-left transition",
            department === "radiology"
              ? "border-violet-500 bg-violet-50"
              : "border-slate-200 hover:border-violet-300",
          )}
        >
          <ScanLine className={cn("h-5 w-5", department === "radiology" ? "text-violet-600" : "text-slate-400")} />
          <strong className="mt-2 block text-sm font-semibold text-slate-800">Radiology</strong>
          <small className="mt-0.5 block text-xs leading-4 text-slate-500">X-ray, CT, MRI, USG and ECG</small>
        </button>
      </div>

      {/* Test search — unified typeahead dropdown */}
      <div className="mt-5">
        <SearchSelect
          options={testOptions.filter((o) =>
            `${o.label} ${o.sublabel}`.toLowerCase().includes(query.toLowerCase()),
          )}
          onSelect={(opt) => {
            setSelectedName(opt.value);
            setQuery("");
          }}
          query={query}
          onQueryChange={setQuery}
          placeholder="Search test or keyword…"
          selectedValue={selectedName}
          noResultsText="No test found in this department."
        />
      </div>

      {/* Selected test details */}
      {selected && (
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Category</span>
            <strong className="mt-1 block font-semibold text-slate-700">{selected.category}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Sample / modality</span>
            <strong className="mt-1 block font-semibold text-slate-700">{selected.sample}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Expected report</span>
            <strong className="mt-1 block font-semibold text-slate-700">{selected.report}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Department</span>
            <strong className="mt-1 block font-semibold capitalize text-slate-700">{department}</strong>
          </div>
        </div>
      )}

      {/* Priority + add */}
      <DrawerSection
        title="Order settings"
        caption="Set priority and confirm the test order."
        icon={<FlaskConical className="h-4 w-4" />}
        className="mt-4"
      >
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Priority</label>
            <SingleSelect
              value={priority}
              onChange={(v) => setPriority(v as "routine" | "priority")}
              placeholder="Select priority"
              options={[
                { value: "routine", label: "Routine" },
                { value: "priority", label: "Priority (Today)" },
              ]}
              className="mt-1"
            />
          </div>
          <FormButton size="sm" onClick={addCurrent} disabled={!selected}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </FormButton>
        </div>
      </DrawerSection>

      {/* Pending basket */}
      {pending.length > 0 && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <FlaskConical className="h-3.5 w-3.5" />
            Added
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {pending.length}
            </span>
          </p>
          <div className="mt-2.5 space-y-2">
            {pending.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{order.test}</p>
                  <span className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                    order.department === "pathology"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-violet-200 bg-violet-50 text-violet-700",
                  )}>
                    {order.department} · {order.priority}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPending((prev) => prev.filter((x) => x.id !== order.id))}
                  className="p-1.5 rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${order.test}`}
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
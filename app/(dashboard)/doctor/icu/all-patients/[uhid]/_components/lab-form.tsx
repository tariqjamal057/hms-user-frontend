// app/(dashboard)/doctor/icu/patients/[uhid]/_components/lab-form.tsx
"use client";
import { useRef, useState } from "react";
import {
  Check,
  FlaskConical,
  Microscope,
  ScanLine,
  TestTube,
  X,
} from "lucide-react";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import { SelectedItemCard } from "@/components/consultation/selected-item-card";
import { FormButton, FormTextarea } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import {
  SearchSelect,
  type SearchSelectOption,
} from "@/components/forms/search-select";
import type { LabDraft } from "@/types/doctor/icu/doctor-icu-types";
import { LAB_TEST_CATALOG } from "@/lib/doctor/icu/doctor-icu-data";
import { cn } from "@/lib/utils";

type Department = "Pathology" | "Radiology";
type CategoryFilter = "All" | Department;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: LabDraft[]) => void;
};

const PRIORITY_OPTIONS: { value: LabDraft["priority"]; label: string }[] = [
  { value: "Routine", label: "Routine" },
  { value: "Urgent", label: "Urgent" },
  { value: "Stat", label: "Stat" },
];

const PRIORITY_BADGE: Record<LabDraft["priority"], string> = {
  Routine: "border-slate-200 bg-slate-100 text-slate-600",
  Urgent: "border-amber-200 bg-amber-50 text-amber-700",
  Stat: "border-orange-200 bg-orange-50 text-orange-700",
};

const DEPT_ACCENT: Record<Department, string> = {
  Pathology: "border-blue-500 from-blue-50/60",
  Radiology: "border-violet-500 from-violet-50/60",
};

export function LabForm({ open, onOpenChange, onSubmit }: Props) {
  const idRef = useRef(0);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [priority, setPriority] = useState<LabDraft["priority"]>("Routine");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<LabDraft[]>([]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setCategory("All");
      setPriority("Routine");
      setClinicalNotes("");
      setQuery("");
      setRows([]);
      idRef.current = 0;
    }
    onOpenChange(next);
  }

  const filteredTests = LAB_TEST_CATALOG.filter(
    (t) =>
      (category === "All" || t.category === category) &&
      `${t.name} ${t.code}`.toLowerCase().includes(query.toLowerCase()),
  );

  const testOptions: SearchSelectOption[] = filteredTests.map((t) => ({
    value: t.id,
    label: t.name,
    sublabel: `${t.code} · ${t.category}`,
    icon:
      t.category === "Pathology" ? (
        <TestTube className="h-4 w-4 text-blue-500" />
      ) : (
        <ScanLine className="h-4 w-4 text-violet-500" />
      ),
  }));

  function pick(opt: SearchSelectOption) {
    const t = LAB_TEST_CATALOG.find((x) => x.id === opt.value);
    if (!t) return;
    if (rows.some((r) => r.testName === t.name)) return;
    setRows((prev) => [
      ...prev,
      {
        category: t.category,
        testName: t.name,
        orderedBy: "Doctor",
        priority,
        clinicalNotes,
      },
    ]);
    setQuery("");
  }

  function updatePriority(id: string, p: LabDraft["priority"]) {
    setRows((prev) =>
      prev.map((r, i) => (i.toString() === id ? { ...r, priority: p } : r)),
    );
  }

  function removeItem(id: string) {
    setRows((prev) => prev.filter((_, i) => i.toString() !== id));
  }

  function submit() {
    onSubmit(rows);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<FlaskConical className="h-5 w-5" />}
      title="Order Lab Tests"
      description="Choose a department and priority, then search — selecting a test adds it instantly."
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
            Send Orders{rows.length > 0 ? ` (${rows.length})` : ""}
          </FormButton>
        </div>
      }
    >
      {/* Department + priority + notes */}
      <div className="grid grid-cols-2 gap-3">
        <SingleSelect
          label="Department"
          value={category}
          onChange={(v) => setCategory(v as CategoryFilter)}
          options={[
            { value: "All", label: "All Departments" },
            { value: "Pathology", label: "Pathology" },
            { value: "Radiology", label: "Radiology" },
          ]}
        />
        <SingleSelect
          label="Priority"
          value={priority}
          onChange={(v) => setPriority(v as LabDraft["priority"])}
          options={PRIORITY_OPTIONS}
        />
      </div>
      <div className="mt-3">
        <FormTextarea
          label="Clinical Notes"
          value={clinicalNotes}
          onChange={setClinicalNotes}
          placeholder="Clinical indication or instructions"
          rows={2}
        />
      </div>

      {/* Department visual toggle */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {(["Pathology", "Radiology"] as Department[]).map((dept) => {
          const active =
            (dept === "Pathology" && category === "Pathology") ||
            (dept === "Radiology" && category === "Radiology");
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setCategory(dept)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm font-bold transition",
                active
                  ? dept === "Pathology"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {dept === "Pathology" ? (
                <Microscope className="h-4 w-4" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )}
              {dept}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <SearchSelect
          options={testOptions}
          onSelect={pick}
          query={query}
          onQueryChange={setQuery}
          placeholder={
            category === "All"
              ? "Search all tests..."
              : `Search ${category.toLowerCase()} tests...`
          }
          noResultsText="No test found in this department."
        />
      </div>

      {rows.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {rows.map((r, i) => (
            <SelectedItemCard
              key={i}
              id={i.toString()}
              title={r.testName}
              onRemove={removeItem}
              accentColor={DEPT_ACCENT[r.category]}
              badges={[
                {
                  label: r.category,
                  className:
                    r.category === "Pathology"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-violet-200 bg-violet-50 text-violet-700",
                },
                {
                  label: r.priority,
                  className: PRIORITY_BADGE[r.priority],
                },
              ]}
              footer={
                <div className="w-full space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Priority
                  </span>
                  <SingleSelect
                    label=""
                    value={r.priority}
                    onChange={(v) =>
                      updatePriority(i.toString(), v as LabDraft["priority"])
                    }
                    options={PRIORITY_OPTIONS}
                  />
                  {r.clinicalNotes && (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <span className="font-semibold">Notes:</span>{" "}
                      {r.clinicalNotes}
                    </p>
                  )}
                </div>
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

// app/ipd/doctor/treatment-plan/_components/treatment-plan-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardPlus } from "lucide-react";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import {
  FormTextarea,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { PillButton } from "@/components/forms/pill-button";
import type { PlanCategory, PlanPriority, TreatmentPlanItem } from "@/types/doctor/ipd/treatment-plan-types";

interface TreatmentPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: TreatmentPlanItem | null;
  onSave: (item: TreatmentPlanItem) => void;
}

const initialState = {
  problemDiagnosis: "",
  category: "Medical Management" as PlanCategory,
  intervention: "",
  targetGoal: "",
  duration: "",
  priority: "Medium" as PlanPriority,
  notes: "",
};

export function TreatmentPlanDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: TreatmentPlanDialogProps) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (editingItem) {
      setForm({
        problemDiagnosis: editingItem.problemDiagnosis,
        category: editingItem.category,
        intervention: editingItem.intervention,
        targetGoal: editingItem.targetGoal,
        duration: editingItem.duration,
        priority: editingItem.priority,
        notes: editingItem.notes,
      });
    } else {
      setForm(initialState);
    }
  }, [editingItem, open]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!form.problemDiagnosis || !form.intervention || !form.targetGoal || !form.duration) {
      toast.error("Please fill all required fields");
      return;
    }

    const item: TreatmentPlanItem = {
      id: editingItem?.id ?? `TP-${Date.now()}`,
      problemDiagnosis: form.problemDiagnosis,
      category: form.category,
      intervention: form.intervention,
      targetGoal: form.targetGoal,
      duration: form.duration,
      priority: form.priority,
      notes: form.notes,
    };

    console.log(editingItem ? "Updating treatment plan:" : "Adding treatment plan:", item);
    onSave(item);
    onOpenChange(false);
    setForm(initialState);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={onOpenChange}
      icon={<ClipboardPlus className="h-5 w-5" />}
      title={editingItem ? "Edit Treatment Plan" : "Add Treatment Plan"}
      description="Capture the problem, management approach, and expected outcome."
      footer={
        <div className="flex gap-3">
          <PillButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </PillButton>
          <PillButton className="flex-1" onClick={handleSave}>
            {editingItem ? "Save Changes" : "Save Plan"}
          </PillButton>
        </div>
      }
    >
      <div className="space-y-5">
        <DrawerSection
          title="Problem"
          caption="Diagnosis and classification"
          icon={<ClipboardPlus className="h-4 w-4" />}
        >
          <SuffixedInput
            label="Problem / Diagnosis *"
            value={form.problemDiagnosis}
            onChange={(value) => update("problemDiagnosis", value)}
            placeholder="Enter diagnosis/problem"
          />
          <SingleSelect
            label="Category"
            value={form.category}
            options={[
              "Medical Management",
              "Monitoring",
              "Diet & Lifestyle",
              "Therapy & Rehabilitation",
              "Patient Education",
            ].map((c) => ({ value: c, label: c }))}
            onChange={(value) => update("category", value as PlanCategory)}
          />
          <SingleSelect
            label="Priority"
            value={form.priority}
            options={[
              { value: "High", label: "High" },
              { value: "Medium", label: "Medium" },
              { value: "Low", label: "Low" },
            ]}
            onChange={(value) => update("priority", value as PlanPriority)}
          />
        </DrawerSection>

        <DrawerSection
          title="Management plan"
          caption="Intervention, goal, duration and notes"
          icon={<ClipboardPlus className="h-4 w-4" />}
        >
          <FormTextarea
            label="Intervention / Management *"
            value={form.intervention}
            onChange={(value) => update("intervention", value)}
            rows={3}
            placeholder="Enter intervention/management"
          />
          <FormTextarea
            label="Target / Goal *"
            value={form.targetGoal}
            onChange={(value) => update("targetGoal", value)}
            rows={2}
            placeholder="Enter target/goal"
          />
          <SuffixedInput
            label="Duration *"
            value={form.duration}
            onChange={(value) => update("duration", value)}
            placeholder="e.g. Ongoing / 5 Days / 2 Weeks"
          />
          <FormTextarea
            label="Notes"
            value={form.notes}
            onChange={(value) => update("notes", value)}
            rows={3}
            maxLength={500}
            placeholder="Additional notes..."
          />
        </DrawerSection>
      </div>
    </ConsultationDrawer>
  );
}

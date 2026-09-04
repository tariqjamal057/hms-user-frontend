// app/(dashboard)/rmo/emergency/all-patients/_components/section-treatment-plan-form.tsx
"use client";
import { useState } from "react";
import { Check, ClipboardCheck, X } from "lucide-react";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import {
  FormButton,
  FormTextarea,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import type { TreatmentPlanItem } from "@/types/emergency/emergency-types";

export function TreatmentPlanForm({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: Omit<TreatmentPlanItem, "id" | "orderedOn" | "followStatus">,
  ) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    orderedBy: "",
    orderedByRole: "Doctor" as "Doctor" | "RMO",
  });
  const set = (key: keyof typeof form, value: string) =>
    setForm((v) => ({ ...v, [key]: value }));
  const valid = form.title.trim() && form.description.trim() && form.orderedBy.trim();
  function submit() {
    if (!valid) return;
    onSubmit(form);
    setForm({
      title: "",
      description: "",
      orderedBy: "",
      orderedByRole: "Doctor",
    });
    onOpenChange(false);
  }
  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={onOpenChange}
      icon={<ClipboardCheck className="h-5 w-5" />}
      title="Add Treatment Plan"
      description="Record a treatment plan ordered by the doctor or RMO."
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={submit} disabled={!valid}>
            <Check className="mr-1 h-4 w-4" />
            Save Plan
          </FormButton>
        </div>
      }
    >
      <div className="space-y-3">
        <SuffixedInput
          label="Title"
          value={form.title}
          onChange={(v) => set("title", v)}
          placeholder="e.g. ACS Protocol, Antibiotic Therapy"
        />
        <FormTextarea
          label="Description"
          value={form.description}
          onChange={(v) => set("description", v)}
          placeholder="Detailed treatment instructions"
          rows={4}
        />
        <div className="grid grid-cols-2 gap-3">
          <SuffixedInput
            label="Ordered By (Name)"
            value={form.orderedBy}
            onChange={(v) => set("orderedBy", v)}
            placeholder="Doctor / RMO name"
          />
          <SingleSelect
            label="Role"
            value={form.orderedByRole}
            onChange={(v) => set("orderedByRole", v as "Doctor" | "RMO")}
            options={[
              { value: "Doctor", label: "Doctor" },
              { value: "RMO", label: "RMO" },
            ]}
          />
        </div>
      </div>
    </ConsultationDrawer>
  );
}

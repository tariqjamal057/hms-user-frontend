//app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-discharge.tsx
"use client";
import { useState } from "react";
import { CheckCircle2, LogOut } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PillButton } from "@/components/forms/pill-button";
import { FormTextarea } from "@/components/forms/form-controls";
import type { DischargeSummaryForm } from "@/types/nurse/ipd/nurse-ipd-types";
import { CURRENT_NURSE } from "@/lib/nurse/ipd/nurse-ipd-data";

export function TabDischarge({ patientName, onDischarge }: { patientName: string; onDischarge: (form: DischargeSummaryForm) => void }) {
  const [condition, setCondition] = useState("");
  const [vitalsStable, setVitalsStable] = useState(false);
  const [woundStatus, setWoundStatus] = useState("");
  const [medsHandedOver, setMedsHandedOver] = useState(false);
  const [belongingsReturned, setBelongingsReturned] = useState(false);
  const [educationGiven, setEducationGiven] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const valid = condition.trim() && followUp.trim();

  function handleSubmit() {
    if (!valid) return;
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    onDischarge({
      patientConditionOnDischarge: condition.trim(), vitalsStableAtDischarge: vitalsStable, woundStatus: woundStatus.trim(),
      medicationsHandedOver: medsHandedOver, belongingsReturned, patientEducationGiven: educationGiven,
      followUpInstructions: followUp.trim(), dischargedBy: CURRENT_NURSE.name, dischargeDateTime: stamp, additionalNotes: additionalNotes.trim() || undefined,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <h3 className="text-xl font-bold text-slate-800">Discharge Recorded Successfully</h3>
        <p className="text-sm text-slate-600">Nursing discharge summary for <span className="font-semibold">{patientName}</span> has been completed and saved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-orange-50 p-5">
        <p className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800"><LogOut className="h-5 w-5 text-red-600" />Nursing Discharge Summary</p>
        <p className="mt-1 text-xs text-slate-500">Complete this checklist before discharging <span className="font-semibold text-slate-700">{patientName}</span> from the ward.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <FormTextarea
            label="Patient Condition on Discharge *"
            value={condition}
            onChange={setCondition}
            rows={3}
            maxLength={500}
            placeholder="Describe the patient's condition at time of discharge..."
          />
          <FormTextarea
            label="Wound / Surgical Site Status (if applicable)"
            value={woundStatus}
            onChange={setWoundStatus}
            rows={2}
            placeholder="e.g. Clean and dry, sutures intact"
          />
          <FormTextarea
            label="Follow-up Instructions *"
            value={followUp}
            onChange={setFollowUp}
            rows={2}
            maxLength={400}
            placeholder="Follow-up date, medications, precautions..."
          />
          <FormTextarea
            label="Additional Notes (Optional)"
            value={additionalNotes}
            onChange={setAdditionalNotes}
            rows={2}
            placeholder="Any other details"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Discharge Checklist</p>
            <CheckRow label="Vitals stable at discharge" checked={vitalsStable} onChange={setVitalsStable} />
            <CheckRow label="Medications handed over to patient/family" checked={medsHandedOver} onChange={setMedsHandedOver} />
            <CheckRow label="Patient belongings returned" checked={belongingsReturned} onChange={setBelongingsReturned} />
            <CheckRow label="Patient/family education given" checked={educationGiven} onChange={setEducationGiven} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Discharged by: <span className="font-semibold text-slate-700">{CURRENT_NURSE.name}</span>
          </div>

          <PillButton variant="danger" icon={LogOut} className="w-full" onClick={handleSubmit} disabled={!valid}>
            Discharge Patient
          </PillButton>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${checked ? "border-emerald-200 bg-emerald-50/60 text-slate-700" : "border-slate-200 bg-white text-slate-700"}`}>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      {label}
    </label>
  );
}
// app/(dashboard)/doctor/icu/patients/[uhid]/_components/ventilator-order-form.tsx
"use client";
import { useState } from "react";
import { Check, Wind, X } from "lucide-react";
import { ConsultationDrawer } from "@/components/consultation/drawer";
import { FormButton, FormTextarea, SuffixedInput } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { RadioGroup } from "@/components/forms/radio-group";
import type {
  AirwayType,
  VentilatorMode,
  VentilatorOrder,
  VentilationType,
  WeaningPlan,
} from "@/types/nurse/icu/ventilation-types";
import {
  AIRWAY_TYPE_OPTIONS,
  VENTILATION_TYPE_OPTIONS,
  VENTILATOR_MODE_OPTIONS,
  WEANING_PLAN_OPTIONS,
} from "@/lib/nurse/icu/ventilation-data";
import { VentilatorModeFields } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/ventilator-mode-fields";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uhid: string;
  icuBed: string;
  patientName: string;
  orderedBy: string;
  orderedByRole: "Doctor" | "RMO";
  onSubmit: (order: VentilatorOrder) => void;
};

export function VentilatorOrderForm({
  open,
  onOpenChange,
  uhid,
  icuBed,
  patientName,
  orderedBy,
  orderedByRole,
  onSubmit,
}: Props) {
  const [ventType, setVentType] =
    useState<VentilationType>("Invasive Mechanical Ventilation");
  const [airwayType, setAirwayType] = useState<AirwayType>("Endotracheal tube");
  const [airwayDetails, setAirwayDetails] = useState("");
  const [ventilatorName, setVentilatorName] = useState("");
  const [mode, setMode] = useState<VentilatorMode>("Volume Control");
  const [settings, setSettings] = useState<Record<string, number | string>>({});
  const [oxygenationTarget, setOxygenationTarget] = useState("");
  const [ventilationTarget, setVentilationTarget] = useState("");
  const [instructions, setInstructions] = useState("");
  const [monitoringFreq, setMonitoringFreq] = useState("");
  const [weaningPlan, setWeaningPlan] =
    useState<WeaningPlan>("Continue current support");
  const [weaningPlanOther, setWeaningPlanOther] = useState("");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
  }

  function handleSubmit() {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const order: VentilatorOrder = {
      id: `VO-${Date.now()}`,
      uhid,
      icuBed,
      ventilationType: ventType,
      airwayType:
        ventType === "Invasive Mechanical Ventilation" ? airwayType : "None",
      airwayDetails:
        ventType === "Invasive Mechanical Ventilation"
          ? airwayDetails
          : undefined,
      ventilatorName: ventilatorName || undefined,
      mode,
      prescribedSettings: settings,
      oxygenationTarget: oxygenationTarget || undefined,
      ventilationTarget: ventilationTarget || undefined,
      specialInstructions: instructions || undefined,
      monitoringFrequency: monitoringFreq || undefined,
      weaningPlan,
      weaningPlanOther:
        weaningPlan === "Other" ? weaningPlanOther : undefined,
      status: "Active",
      orderedBy,
      orderedByRole,
      orderedAt: stamp,
    };
    onSubmit(order);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Wind className="h-5 w-5" />}
      title="Ventilator Order"
      description={`New mechanical ventilation order for ${patientName} · ${icuBed}`}
      bodyClassName="space-y-4"
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
          <FormButton className="flex-1" onClick={handleSubmit}>
            <Check className="mr-1 h-4 w-4" />
            Place Order
          </FormButton>
        </div>
      }
    >
      {/* Ventilation Type — unified RadioGroup */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Ventilation Type</p>
        <RadioGroup
          name="vent-type"
          options={VENTILATION_TYPE_OPTIONS.map((v) => ({ value: v, label: v }))}
          value={ventType}
          onChange={(v) => setVentType(v as VentilationType)}
        />
      </div>

      {/* Airway — only when invasive */}
      {ventType === "Invasive Mechanical Ventilation" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
          <SingleSelect
            label="Airway"
            value={airwayType}
            onChange={(v) => setAirwayType(v as AirwayType)}
            options={AIRWAY_TYPE_OPTIONS.map((a) => ({ value: a, label: a }))}
          />
          <div className="mt-3">
            <SuffixedInput
              label="Airway Details (optional)"
              value={airwayDetails}
              onChange={setAirwayDetails}
              placeholder="e.g. Size 7.5, depth 22 cm at lips"
            />
          </div>
        </div>
      )}

      {/* Ventilator */}
      <SuffixedInput
        label="Ventilator (optional)"
        value={ventilatorName}
        onChange={setVentilatorName}
        placeholder="e.g. Ventilator-ICU-03"
      />

      {/* Mode + Prescribed Settings */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
        <SingleSelect
          label="Mode"
          value={mode}
          onChange={(v) => {
            setMode(v as VentilatorMode);
            setSettings({});
          }}
          options={VENTILATOR_MODE_OPTIONS.map((m) => ({ value: m, label: m }))}
        />
        <div className="mt-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Prescribed Settings
          </p>
          <VentilatorModeFields
            mode={mode}
            settings={settings}
            onChange={setSettings}
          />
        </div>
      </div>

      {/* Clinical Targets + Instructions */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
        <p className="text-sm font-semibold text-emerald-800">
          Clinical Targets / Instructions
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SuffixedInput
            label="Oxygenation Target"
            value={oxygenationTarget}
            onChange={setOxygenationTarget}
            placeholder="e.g. SpO₂ 94-98%"
          />
          <SuffixedInput
            label="Ventilation Target"
            value={ventilationTarget}
            onChange={setVentilationTarget}
            placeholder="e.g. pCO₂ 35-45 mmHg"
          />
        </div>
        <div className="mt-3">
          <FormTextarea
            label="Special Instructions"
            value={instructions}
            onChange={setInstructions}
            rows={3}
            maxLength={500}
            placeholder="Special instructions (e.g. weaning plan, monitoring frequency)"
          />
        </div>
        <div className="mt-3">
          <SuffixedInput
            label="Monitoring Frequency"
            value={monitoringFreq}
            onChange={setMonitoringFreq}
            placeholder="e.g. Hourly, Continuous"
          />
        </div>
      </div>

      {/* Weaning Plan */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
        <SingleSelect
          label="Weaning / Respiratory Plan"
          value={weaningPlan}
          onChange={(v) => setWeaningPlan(v as WeaningPlan)}
          options={WEANING_PLAN_OPTIONS.map((w) => ({ value: w, label: w }))}
        />
        {weaningPlan === "Other" && (
          <div className="mt-3">
            <SuffixedInput
              label="Specify Plan"
              value={weaningPlanOther}
              onChange={setWeaningPlanOther}
              placeholder="Describe the plan"
            />
          </div>
        )}
      </div>
    </ConsultationDrawer>
  );
}

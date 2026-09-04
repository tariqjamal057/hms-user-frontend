// components/forms/record-vitals-form.tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  FileEdit,
  HeartPulse,
  Info,
  Save,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  FormTextarea,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { PillButton } from "@/components/forms/pill-button";
import { Card, CardContent } from "@/components/ui/card";

import {
  calculateBMI,
  evaluateAbnormalAlerts,
} from "@/lib/doctor/ipd/vitals-validation";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import type { VitalRecordEntry } from "@/types/doctor/ipd/vitals-types";
import type { VitalsFormData } from "@/types/doctor/ipd/record-vitals-types";
import { PatientStatusBadge } from "@/app/(dashboard)/doctor/ipd/ward-rounds/_components/patient-status-badge";
import { AbnormalAlertRow } from "@/app/(dashboard)/doctor/ipd/review-vitals/_components/abnormal-alert-row";
import { VitalsComparisonTable } from "@/app/(dashboard)/doctor/ipd/review-vitals/_components/vitals-comparison-table";

export type RecordVitalsFormProps = {
  patient: WardRoundPatient;
  previousVitals?: VitalRecordEntry;
  /** When provided, renders a "Recorded on" timestamp. */
  recordedOn?: string;
  onSaveDraft?: (data: VitalsFormData) => void;
  onSaveVitals?: (data: VitalsFormData) => void;
  onSaveAndContinue?: (data: VitalsFormData) => void;
  /** When true, hides the patient header (used when embedded inside a page
   *  that already shows the patient info via the unified shell). */
  hidePatientHeader?: boolean;
  /** Optional className for the outer wrapper. */
  className?: string;
};

const initialFormData: VitalsFormData = {
  systolic: "",
  diastolic: "",
  pulse: "",
  respRate: "",
  temp: "",
  tempUnit: "°F",
  spo2: "",
  painScore: 0,
  height: "",
  weight: "",
  levelOfConsciousness: "Alert",
  oxygenSupport: "Room Air",
  oxygenFlowRate: "",
  bloodSugar: "",
  doctorRemarks: "",
};

export function RecordVitalsForm({
  patient,
  previousVitals,
  recordedOn,
  onSaveDraft,
  onSaveVitals,
  onSaveAndContinue,
  hidePatientHeader = false,
  className,
}: RecordVitalsFormProps) {
  const [formData, setFormData] = useState<VitalsFormData>(initialFormData);

  const bmi = useMemo(
    () => calculateBMI(formData.height, formData.weight),
    [formData.height, formData.weight],
  );
  const alerts = useMemo(() => evaluateAbnormalAlerts(formData), [formData]);
  const recordedOnDisplay =
    recordedOn ??
    new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  function updateField<K extends keyof VitalsFormData>(
    key: K,
    value: VitalsFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function isValid() {
    return Boolean(
      formData.systolic &&
        formData.diastolic &&
        formData.pulse &&
        formData.respRate &&
        formData.temp &&
        formData.spo2,
    );
  }

  function handleSaveVitals() {
    if (!isValid()) {
      toast.error("Please fill all required vital signs marked with *");
      return;
    }
    onSaveVitals?.(formData);
    toast.success("Vitals saved successfully");
    setFormData(initialFormData);
  }

  function handleSaveDraft() {
    onSaveDraft?.(formData);
    toast.success("Vitals saved as draft");
  }

  function handleSaveAndContinue() {
    if (!isValid()) {
      toast.error("Please fill all required vital signs marked with *");
      return;
    }
    onSaveAndContinue?.(formData);
    toast.success("Vitals saved. Continuing...");
    setFormData(initialFormData);
  }

  function handleReset() {
    setFormData(initialFormData);
    toast.info("Form reset");
  }

  const initials = patient.patientName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={className}>
      {!hidePatientHeader && (
        <Card className="border-slate-200 shadow-sm py-0">
          <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                {initials}
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  {patient.patientName}{" "}
                  <PatientStatusBadge status={patient.status} />
                </p>
                <p className="text-xs text-slate-400">
                  {patient.age} Y / {patient.gender} · UHID: {patient.uhid}
                </p>
                <p className="text-xs text-slate-400">
                  IPD: {patient.ipdId} · Bed:{" "}
                  {patient.wardRoomBed.split("/").pop()?.trim()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniInfo label="Ward / Room / Bed" value={patient.wardRoomBed} />
              <MiniInfo label="Department" value={patient.department} />
              <MiniInfo label="Recorded By" value={patient.admittingDoctor} />
              <MiniInfo label="Recorded On" value={recordedOnDisplay} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px] xl:items-start">
        <div className="min-w-0 space-y-5">
          <FormSection
            title="Vital Signs"
            subtitle="Required fields are marked with *"
            icon={<HeartPulse className="h-4 w-4 text-blue-600" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-end gap-1.5">
                  <SuffixedInput
                    label="Systolic (mmHg) *"
                    value={formData.systolic}
                    onChange={(v) => updateField("systolic", v)}
                    placeholder="120"
                    className="flex-1"
                  />
                  <span className="mb-2 text-slate-300">/</span>
                  <SuffixedInput
                    label="Diastolic (mmHg) *"
                    value={formData.diastolic}
                    onChange={(v) => updateField("diastolic", v)}
                    placeholder="80"
                    className="flex-1"
                  />
                </div>
              </div>
              <FieldInput
                label="Pulse Rate (bpm) *"
                value={formData.pulse}
                onChange={(v) => updateField("pulse", v)}
                placeholder="78"
              />
              <FieldInput
                label="Respiratory Rate (/min) *"
                value={formData.respRate}
                onChange={(v) => updateField("respRate", v)}
                placeholder="18"
              />
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Temperature *
                </label>
                <div className="mt-1.5 flex items-stretch gap-1.5">
                  <SuffixedInput
                    label=""
                    value={formData.temp}
                    onChange={(v) => updateField("temp", v)}
                    placeholder="98.4"
                    className="flex-1"
                  />
                  <SingleSelect
                    label=""
                    value={formData.tempUnit}
                    options={[
                      { value: "°F", label: "°F" },
                      { value: "°C", label: "°C" },
                    ]}
                    onChange={(v) => updateField("tempUnit", v as "°F" | "°C")}
                    className="w-20 shrink-0"
                  />
                </div>
              </div>
              <FieldInput
                label="SpO2 (%) *"
                value={formData.spo2}
                onChange={(v) => updateField("spo2", v)}
                placeholder="98"
              />
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
                  Pain Score (NRS) * <Info className="h-3 w-3 text-slate-300" />
                </label>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="text-xs text-slate-400">0</span>
                  <Slider
                    value={[formData.painScore]}
                    onValueChange={([v]) => updateField("painScore", v)}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-400">10</span>
                  <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700">
                    {formData.painScore}
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Anthropometric Measurements"
            subtitle="BMI is auto-calculated from height and weight"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FieldInput
                label="Height (cm)"
                value={formData.height}
                onChange={(v) => updateField("height", v)}
                placeholder="172"
              />
              <FieldInput
                label="Weight (kg)"
                value={formData.weight}
                onChange={(v) => updateField("weight", v)}
                placeholder="72.5"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  BMI (kg/m²)
                </p>
                <div className="mt-1.5 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm">
                  <span className="font-semibold text-slate-800">{bmi}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    Auto Calculated
                  </span>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Additional Monitoring"
            subtitle="Consciousness, oxygen support, and blood sugar"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SingleSelect
                label="Level Of Consciousness"
                value={formData.levelOfConsciousness}
                options={[
                  { value: "Alert", label: "Alert" },
                  { value: "Verbal", label: "Verbal" },
                  { value: "Pain", label: "Pain" },
                  { value: "Unresponsive", label: "Unresponsive" },
                ]}
                onChange={(v) => updateField("levelOfConsciousness", v)}
              />
              <SingleSelect
                label="Oxygen Support"
                value={formData.oxygenSupport}
                options={[
                  { value: "Room Air", label: "Room Air" },
                  { value: "Nasal Cannula", label: "Nasal Cannula" },
                  { value: "Face Mask", label: "Face Mask" },
                  { value: "Ventilator", label: "Ventilator" },
                ]}
                onChange={(v) => updateField("oxygenSupport", v)}
              />
              <FieldInput
                label="Oxygen Flow Rate (L/min)"
                value={formData.oxygenFlowRate}
                onChange={(v) => updateField("oxygenFlowRate", v)}
                placeholder="2"
              />
              <FieldInput
                label="Blood Sugar (mg/dL)"
                optional
                value={formData.bloodSugar}
                onChange={(v) => updateField("bloodSugar", v)}
                placeholder="124"
              />
            </div>
          </FormSection>

          <FormSection title="Doctor Remarks">
            <FormTextarea
              label="Remarks"
              rows={3}
              maxLength={1000}
              placeholder="Enter remarks..."
              value={formData.doctorRemarks}
              onChange={(v) => updateField("doctorRemarks", v)}
            />
          </FormSection>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span>
                All fields marked with * are required. Review the abnormal
                alerts panel before saving.
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
              {onSaveDraft && (
                <PillButton
                  variant="outline"
                  size="sm"
                  icon={FileEdit}
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </PillButton>
              )}
              <PillButton
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-slate-500"
              >
                Reset
              </PillButton>
              {onSaveAndContinue ? (
                <PillButton
                  size="sm"
                  icon={ArrowRight}
                  className="flex-row-reverse"
                  onClick={handleSaveAndContinue}
                >
                  Save & Continue
                </PillButton>
              ) : onSaveVitals ? (
                <PillButton
                  size="sm"
                  icon={Save}
                  onClick={handleSaveVitals}
                >
                  Save Vitals
                </PillButton>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5 xl:sticky xl:top-6">
          <Card className="border-slate-200 shadow-sm py-0">
            <CardContent className="py-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Abnormal Value Alerts
              </p>
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-sm text-slate-400">No alerts.</p>
                ) : (
                  alerts.map((a) => (
                    <AbnormalAlertRow key={a.label} alert={a} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm py-0">
            <CardContent className="py-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Previous Vitals Comparison
              </p>
              <VitalsComparisonTable
                previous={previousVitals}
                current={formData}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 shadow-sm py-0">
      <CardContent className="py-4">
        <div className="mb-3 flex items-center gap-2">
          {icon}
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            {subtitle && (
              <p className="text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <SuffixedInput
      label={optional ? `${label} (Optional)` : label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="whitespace-nowrap text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

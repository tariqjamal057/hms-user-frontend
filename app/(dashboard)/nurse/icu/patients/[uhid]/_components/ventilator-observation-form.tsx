// app/(dashboard)/nurse/icu/patients/[uhid]/_components/ventilator-observation-form.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Bell, Check, Fan, HeartPulse, Wind, X } from "lucide-react";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { FormButton, FormTextarea, SuffixedInput } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { RadioGroup } from "@/components/forms/radio-group";
import { PillButton } from "@/components/forms/pill-button";
import type { VentilatorAdministration, VentilatorObservation, VentilatorOrder, PatientVentStatus } from "@/types/nurse/icu/ventilation-types";
import { PATIENT_VENT_STATUS_OPTIONS } from "@/lib/nurse/icu/ventilation-data";
import { VentilatorModeFields, formatVentilatorSettings } from "./ventilator-mode-fields";

type EscalationReason = "Doctor order changed" | "Temporary clinical instruction" | "Device/clinical issue" | "Other";

export function VentilatorObservationForm({
  open,
  onOpenChange,
  order,
  administration,
  patientName,
  nurseName,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: VentilatorOrder;
  administration: VentilatorAdministration;
  patientName: string;
  nurseName: string;
  onSave: (observation: VentilatorObservation) => void;
}) {
  const [ventSettings, setVentSettings] = useState<Record<string, number | string>>(administration.actualSettings);
  const [spo2, setSpo2] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [patientStatus, setPatientStatus] = useState<PatientVentStatus>("Stable");
  const [remarks, setRemarks] = useState("");
  const [escalationReason, setEscalationReason] = useState<EscalationReason>("Temporary clinical instruction");
  const [notifyingDoctor, setNotifyingDoctor] = useState(false);

  // Re-hydrate form state when the drawer re-opens
  useEffect(() => {
    if (!open) return;
    setVentSettings(administration.actualSettings);
    setSpo2("");
    setRespiratoryRate("");
    setHeartRate("");
    setBpSystolic("");
    setBpDiastolic("");
    setPatientStatus("Stable");
    setRemarks("");
    setEscalationReason("Temporary clinical instruction");
    setNotifyingDoctor(false);
  }, [open, administration]);

  const hasDifference = useMemo(() => {
    return Object.keys(order.prescribedSettings).some((key) => {
      const prescribed = order.prescribedSettings[key];
      const observed = ventSettings[key];
      return prescribed !== observed;
    });
  }, [ventSettings, order.prescribedSettings]);

  function handleSave() {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const observation: VentilatorObservation = {
      id: `VOB-${Date.now()}`,
      orderId: order.id,
      uhid: order.uhid,
      administrationId: administration.id,
      ventilatorParameters: ventSettings,
      spo2: spo2 ? Number(spo2) : undefined,
      respiratoryRate: respiratoryRate ? Number(respiratoryRate) : undefined,
      heartRate: heartRate ? Number(heartRate) : undefined,
      bloodPressureSystolic: bpSystolic ? Number(bpSystolic) : undefined,
      bloodPressureDiastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
      patientStatus,
      remarks: remarks || undefined,
      recordedBy: nurseName,
      recordedAt: stamp,
      hasDifference,
      differenceNote: hasDifference ? `Ordered: ${formatVentilatorSettings(order.mode, order.prescribedSettings)} · Observed: ${formatVentilatorSettings(order.mode, ventSettings)}` : undefined,
      doctorNotified: hasDifference ? notifyingDoctor : undefined,
      doctorNotifiedAt: hasDifference && notifyingDoctor ? stamp : undefined,
      doctorNotifiedBy: hasDifference && notifyingDoctor ? nurseName : undefined,
      escalationReason: hasDifference ? escalationReason : undefined,
    };
    onSave(observation);
    toast.success("Ventilator observation saved.");
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={onOpenChange}
      icon={<Fan className="h-5 w-5" />}
      title="Add Ventilator Observation"
      description={`${patientName} · ${order.icuBed}`}
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={handleSave}>
            <Check className="mr-1 h-4 w-4" />
            Save Observation
          </FormButton>
        </div>
      }
    >
      {/* Active ventilator order context */}
      <DrawerSection
        title="Ventilator Order"
        caption="Current mode & prescribed settings"
        icon={<Wind className="h-4 w-4 text-cyan-600" />}
      >
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 px-3 py-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-cyan-600">Mode</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">{order.mode}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-cyan-600">Prescribed Settings</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">
              {formatVentilatorSettings(order.mode, order.prescribedSettings)}
            </p>
          </div>
        </div>
      </DrawerSection>

      {/* Actual ventilator settings */}
      <DrawerSection
        title="Actual Ventilator Settings / Readings"
        caption="What the ventilator is currently delivering"
        icon={<Fan className="h-4 w-4 text-slate-400" />}
      >
        <VentilatorModeFields mode={order.mode} settings={ventSettings} onChange={setVentSettings} />
      </DrawerSection>

      {/* Setting difference / escalation */}
      {hasDifference && (
        <DrawerSection
          title="Ventilator Setting Difference"
          caption="Observed settings differ from the prescription"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
        >
          <p className="text-xs text-red-700">
            Ordered: {formatVentilatorSettings(order.mode, order.prescribedSettings)} · Observed: {formatVentilatorSettings(order.mode, ventSettings)}
          </p>
          <SingleSelect
            label="Reason / Action"
            value={escalationReason}
            onChange={(v) => setEscalationReason(v as EscalationReason)}
            options={[
              { value: "Doctor order changed", label: "Doctor order changed" },
              { value: "Temporary clinical instruction", label: "Temporary clinical instruction" },
              { value: "Device/clinical issue", label: "Device/clinical issue" },
              { value: "Other", label: "Other" },
            ]}
          />
          <PillButton
            size="sm"
            variant={notifyingDoctor ? "gradient" : "danger"}
            icon={Bell}
            onClick={() => setNotifyingDoctor((v) => !v)}
          >
            {notifyingDoctor ? "Doctor Will Be Notified" : "Notify Doctor"}
          </PillButton>
        </DrawerSection>
      )}

      {/* Patient parameters */}
      <DrawerSection
        title="Patient Parameters"
        caption="Latest observed vital signs"
        icon={<HeartPulse className="h-4 w-4 text-rose-500" />}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SuffixedInput label="SpO₂ (%)" suffix="%" type="number" value={spo2} onChange={setSpo2} placeholder="96" />
          <SuffixedInput label="RR (/min)" suffix="/min" type="number" value={respiratoryRate} onChange={setRespiratoryRate} placeholder="19" />
          <SuffixedInput label="HR (bpm)" suffix="bpm" type="number" value={heartRate} onChange={setHeartRate} placeholder="110" />
          <SuffixedInput label="BP Systolic" suffix="mmHg" type="number" value={bpSystolic} onChange={setBpSystolic} placeholder="105" />
          <SuffixedInput label="BP Diastolic" suffix="mmHg" type="number" value={bpDiastolic} onChange={setBpDiastolic} placeholder="65" />
        </div>
      </DrawerSection>

      {/* Patient-ventilator status */}
      <DrawerSection
        title="Patient-Ventilator Status"
        caption="Overall patient-ventilator interface state"
        icon={<Fan className="h-4 w-4 text-cyan-500" />}
      >
        <RadioGroup
          name="vent-status"
          options={PATIENT_VENT_STATUS_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
          value={patientStatus}
          onChange={(v) => setPatientStatus(v as PatientVentStatus)}
        />
      </DrawerSection>

      {/* Remarks */}
      <DrawerSection
        title="Remarks"
        caption="Optional notes for the team"
        icon={<Wind className="h-4 w-4 text-slate-400" />}
      >
        <FormTextarea
          label="Remarks (Optional)"
          value={remarks}
          onChange={setRemarks}
          rows={2}
          maxLength={300}
          placeholder="e.g. No obvious respiratory distress."
        />
      </DrawerSection>

      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Date &amp; Time: <span className="font-semibold text-slate-700">Auto-generated on save</span> · Recorded By: <span className="font-semibold text-slate-700">{nurseName}</span>
      </div>
    </ConsultationDrawer>
  );
}
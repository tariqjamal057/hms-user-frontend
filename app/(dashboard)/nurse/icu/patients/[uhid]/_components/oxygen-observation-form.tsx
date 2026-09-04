// app/(dashboard)/nurse/icu/patients/[uhid]/_components/oxygen-observation-form.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Bell, Check, HeartPulse, Target, Wind, X } from "lucide-react";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { FormButton, FormTextarea, SuffixedInput } from "@/components/forms/form-controls";
import { RadioGroup } from "@/components/forms/radio-group";
import { PillButton } from "@/components/forms/pill-button";
import type { OxygenAdministration, OxygenObservation, OxygenOrder, OxygenResponse, PatientCondition } from "@/types/nurse/icu/oxygen-therapy-types";
import { CONDITION_OPTIONS, RESPONSE_OPTIONS } from "@/lib/nurse/icu/oxygen-therapy-data";
import { formatDeviceSettings } from "./oxygen-device-fields";

export function OxygenObservationForm({
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
  order: OxygenOrder;
  administration: OxygenAdministration;
  patientName: string;
  nurseName: string;
  onSave: (observation: OxygenObservation) => void;
}) {
  const [spo2, setSpo2] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [condition, setCondition] = useState<PatientCondition>("Comfortable");
  const [response, setResponse] = useState<OxygenResponse>("Stable");
  const [remarks, setRemarks] = useState("");
  const [notifyingDoctor, setNotifyingDoctor] = useState(false);

  // Re-hydrate form state when the drawer re-opens
  useEffect(() => {
    if (!open) return;
    setSpo2("");
    setRespiratoryRate("");
    setHeartRate("");
    setCondition("Comfortable");
    setResponse("Stable");
    setRemarks("");
    setNotifyingDoctor(false);
  }, [open]);

  const belowTarget = useMemo(() => {
    const val = Number(spo2);
    return spo2 !== "" && (val < order.targetSpo2Min || val > order.targetSpo2Max);
  }, [spo2, order.targetSpo2Min, order.targetSpo2Max]);

  const valid = spo2 && respiratoryRate && heartRate;

  function handleSave() {
    if (!spo2 || !respiratoryRate || !heartRate) {
      toast.error("SpO₂, respiratory rate, and heart rate are required.");
      return;
    }
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const observation: OxygenObservation = {
      id: `OXOB-${Date.now()}`,
      orderId: order.id,
      uhid: order.uhid,
      administrationId: administration.id,
      spo2: Number(spo2),
      respiratoryRate: Number(respiratoryRate),
      heartRate: Number(heartRate),
      patientCondition: condition,
      oxygenResponse: response,
      remarks: remarks || undefined,
      recordedBy: nurseName,
      recordedAt: stamp,
      belowTarget,
      doctorNotified: belowTarget ? notifyingDoctor : undefined,
      doctorNotifiedAt: belowTarget && notifyingDoctor ? stamp : undefined,
      doctorNotifiedBy: belowTarget && notifyingDoctor ? nurseName : undefined,
      escalationNote: belowTarget && notifyingDoctor ? `Doctor informed at ${stamp.split(",")[1]?.trim()}.` : undefined,
    };

    onSave(observation);
    toast.success("Oxygen observation saved.");
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={onOpenChange}
      icon={<Wind className="h-5 w-5" />}
      title="Add Oxygen Observation"
      description={`${patientName} · ${order.icuBed}`}
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={handleSave} disabled={!valid}>
            <Check className="mr-1 h-4 w-4" />
            Save Observation
          </FormButton>
        </div>
      }
    >
      {/* Active oxygen order context — auto-filled, not re-typed */}
      <DrawerSection
        title="Active Oxygen Order"
        caption="Current prescribed device & target range"
        icon={<Target className="h-4 w-4 text-cyan-600" />}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-cyan-600">Current Device Setting</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">{formatDeviceSettings(order.settings)}</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-cyan-600">Target SpO₂</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">{order.targetSpo2Min}–{order.targetSpo2Max}%</p>
          </div>
        </div>
      </DrawerSection>

      {/* Patient observation */}
      <DrawerSection
        title="Patient Observation"
        caption="Enter the latest observed values"
        icon={<HeartPulse className="h-4 w-4 text-rose-500" />}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SuffixedInput label="SpO₂ *" suffix="%" type="number" value={spo2} onChange={setSpo2} placeholder="95" />
          <SuffixedInput label="Resp. Rate *" suffix="/min" type="number" value={respiratoryRate} onChange={setRespiratoryRate} placeholder="20" />
          <SuffixedInput label="Heart Rate *" suffix="bpm" type="number" value={heartRate} onChange={setHeartRate} placeholder="88" />
        </div>

        {belowTarget && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Below Prescribed Target
            </p>
            <p className="mt-1 text-xs text-red-700">
              Current SpO₂: {spo2}% · Target: {order.targetSpo2Min}–{order.targetSpo2Max}%
            </p>
            <p className="mt-2 text-xs font-semibold text-red-800">
              Review Required — follow hospital escalation protocol.
            </p>
            <div className="mt-3">
              <PillButton
                size="sm"
                variant={notifyingDoctor ? "gradient" : "danger"}
                icon={Bell}
                onClick={() => setNotifyingDoctor((v) => !v)}
              >
                {notifyingDoctor ? "Doctor Will Be Notified" : "Notify Doctor"}
              </PillButton>
            </div>
          </div>
        )}
      </DrawerSection>

      {/* Patient condition */}
      <DrawerSection
        title="Patient Condition"
        caption="Overall condition at the time of recording"
        icon={<HeartPulse className="h-4 w-4 text-cyan-500" />}
      >
        <RadioGroup
          name="oxygen-condition"
          options={CONDITION_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
          value={condition}
          onChange={(v) => setCondition(v as PatientCondition)}
        />
      </DrawerSection>

      {/* Oxygen response */}
      <DrawerSection
        title="Oxygen Response"
        caption="How is the patient responding to current therapy"
        icon={<Target className="h-4 w-4 text-cyan-500" />}
      >
        <RadioGroup
          name="oxygen-response"
          options={RESPONSE_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
          value={response}
          onChange={(v) => setResponse(v as OxygenResponse)}
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
          placeholder="e.g. Patient maintaining target saturation."
        />
      </DrawerSection>

      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Date &amp; Time: <span className="font-semibold text-slate-700">Auto-generated on save</span> · Recorded By: <span className="font-semibold text-slate-700">{nurseName}</span>
      </div>
    </ConsultationDrawer>
  );
}
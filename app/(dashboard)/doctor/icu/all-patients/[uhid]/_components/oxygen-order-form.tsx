// app/(dashboard)/doctor/icu/patients/[uhid]/_components/oxygen-order-form.tsx
"use client";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  History,
  RefreshCw,
  Settings2,
  Target,
  Timer,
  Wind,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import {
  FormButton,
  FormTextarea,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { RadioGroup } from "@/components/forms/radio-group";
import type {
  OxygenDevice,
  OxygenDeviceSettings,
  OxygenIndication,
  MonitoringFrequency,
  OxygenOrder,
} from "@/types/nurse/icu/oxygen-therapy-types";
import {
  DEVICE_OPTIONS,
  FREQUENCY_OPTIONS,
  INDICATION_OPTIONS,
} from "@/lib/nurse/icu/oxygen-therapy-data";
import { OxygenDeviceFields } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/oxygen-device-fields";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uhid: string;
  icuBed: string;
  patientName: string;
  orderedBy: string;
  orderedByRole: "Doctor" | "RMO";
  existingOrder?: OxygenOrder;
  onSubmit: (order: OxygenOrder) => void;
};

export function OxygenOrderForm({
  open,
  onOpenChange,
  uhid,
  icuBed,
  patientName,
  orderedBy,
  orderedByRole,
  existingOrder,
  onSubmit,
}: Props) {
  const isModify = !!existingOrder;
  const [indication, setIndication] = useState<OxygenIndication>(
    existingOrder?.indication ?? "Hypoxemia",
  );
  const [indicationOther, setIndicationOther] = useState(
    existingOrder?.indicationOther ?? "",
  );
  const [device, setDevice] = useState<OxygenDevice>(
    existingOrder?.settings.device ?? "Nasal Cannula",
  );
  const [deviceSettings, setDeviceSettings] = useState<
    Partial<OxygenDeviceSettings>
  >(existingOrder?.settings ?? { flowLpm: 2 });
  const [targetMin, setTargetMin] = useState(
    String(existingOrder?.targetSpo2Min ?? "94"),
  );
  const [targetMax, setTargetMax] = useState(
    String(existingOrder?.targetSpo2Max ?? "98"),
  );
  const [frequency, setFrequency] = useState<MonitoringFrequency>(
    existingOrder?.monitoringFrequency ?? "Hourly",
  );
  const [frequencyOther, setFrequencyOther] = useState(
    existingOrder?.monitoringFrequencyOther ?? "",
  );
  const [durationType, setDurationType] = useState<
    "Until discontinued" | "Specific duration"
  >(existingOrder?.durationType ?? "Until discontinued");
  const [durationValue, setDurationValue] = useState(
    existingOrder?.durationValue ?? "",
  );
  const [instructions, setInstructions] = useState(
    existingOrder?.specialInstructions ?? "",
  );

  // Re-hydrate form when drawer is re-opened for a different order
  useEffect(() => {
    if (!open) return;
    setIndication(existingOrder?.indication ?? "Hypoxemia");
    setIndicationOther(existingOrder?.indicationOther ?? "");
    setDevice(existingOrder?.settings.device ?? "Nasal Cannula");
    setDeviceSettings(existingOrder?.settings ?? { flowLpm: 2 });
    setTargetMin(String(existingOrder?.targetSpo2Min ?? "94"));
    setTargetMax(String(existingOrder?.targetSpo2Max ?? "98"));
    setFrequency(existingOrder?.monitoringFrequency ?? "Hourly");
    setFrequencyOther(existingOrder?.monitoringFrequencyOther ?? "");
    setDurationType(existingOrder?.durationType ?? "Until discontinued");
    setDurationValue(existingOrder?.durationValue ?? "");
    setInstructions(existingOrder?.specialInstructions ?? "");
  }, [open, existingOrder]);

  function handleSubmit() {
    if (!targetMin || !targetMax) return;
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const order: OxygenOrder = {
      id: `OXO-${Date.now()}`,
      uhid,
      icuBed,
      indication,
      indicationOther:
        indication === "Other" ? indicationOther : undefined,
      settings: { device, ...deviceSettings } as OxygenDeviceSettings,
      targetSpo2Min: Number(targetMin),
      targetSpo2Max: Number(targetMax),
      monitoringFrequency: frequency,
      monitoringFrequencyOther:
        frequency === "Other" ? frequencyOther : undefined,
      startDateTime: stamp,
      durationType,
      durationValue:
        durationType === "Specific duration" ? durationValue : undefined,
      specialInstructions: instructions || undefined,
      status: isModify ? "Modified" : "Active",
      orderedBy,
      orderedByRole,
      orderedAt: stamp,
      supersedes: isModify ? existingOrder?.id : undefined,
    };
    onSubmit(order);
    onOpenChange(false);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={onOpenChange}
      icon={isModify ? <RefreshCw className="h-5 w-5" /> : <Wind className="h-5 w-5" />}
      title={isModify ? "Modify Oxygen Order" : "New Oxygen Therapy Order"}
      description={
        isModify
          ? `Modifying existing order for ${patientName} · ${icuBed}`
          : `New oxygen therapy order for ${patientName} · ${icuBed}`
      }
      meta={
        isModify ? (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Modifying #{existingOrder?.id}
          </Badge>
        ) : undefined
      }
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
            {isModify ? "Save Changes" : "Place Order"}
          </FormButton>
        </div>
      }
    >
      {/* Modification trail (only in modify mode) */}
      {isModify && existingOrder && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800">
          <History className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-semibold">This will supersede the existing order.</p>
            <p className="mt-0.5 text-amber-700">
              Originally placed on {existingOrder.orderedAt} by{" "}
              {existingOrder.orderedBy} ({existingOrder.orderedByRole}). The
              prior order will be preserved in the audit trail.
            </p>
          </div>
        </div>
      )}

      {/* Indication — unified DrawerSection + RadioGroup */}
      <DrawerSection
        title="Reason / Indication"
        caption="Why is oxygen therapy being ordered?"
        icon={<Target className="h-4 w-4" />}
      >
        <RadioGroup
          name="ox-indication"
          options={INDICATION_OPTIONS.map((i) => ({ value: i, label: i }))}
          value={indication}
          onChange={(v) => setIndication(v as OxygenIndication)}
        />
        {indication === "Other" && (
          <SuffixedInput
            label="Specify Indication"
            value={indicationOther}
            onChange={setIndicationOther}
            placeholder="e.g. Post-op recovery"
          />
        )}
      </DrawerSection>

      {/* Delivery Device — DrawerSection */}
      <DrawerSection
        title="Delivery Device & Setting"
        caption="Choose the oxygen delivery interface and its parameters"
        icon={<Settings2 className="h-4 w-4" />}
      >
        <SingleSelect
          label="Delivery Device"
          value={device}
          onChange={(v) => {
            setDevice(v as OxygenDevice);
            setDeviceSettings({});
          }}
          options={DEVICE_OPTIONS.map((d) => ({ value: d, label: d }))}
        />
        <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Oxygen Setting
          </p>
          <OxygenDeviceFields
            device={device}
            settings={deviceSettings}
            onChange={(patch) =>
              setDeviceSettings((prev) => ({ ...prev, ...patch }))
            }
          />
        </div>
      </DrawerSection>

      {/* Target SpO₂ — DrawerSection w/ emerald tinted header */}
      <DrawerSection
        title="Target SpO₂"
        caption="Per hospital protocol & patient condition"
        icon={<Target className="h-4 w-4 text-emerald-600" />}
        action={
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            {targetMin && targetMax ? `${targetMin} – ${targetMax} %` : "—"}
          </Badge>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <SuffixedInput
            label="Minimum"
            suffix="%"
            value={targetMin}
            onChange={setTargetMin}
            placeholder="94"
          />
          <SuffixedInput
            label="Maximum"
            suffix="%"
            value={targetMax}
            onChange={setTargetMax}
            placeholder="98"
          />
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5 text-xs text-emerald-700">
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Use a lower target range for patients at risk of hypercapnic
            respiratory failure, per protocol.
          </p>
        </div>
      </DrawerSection>

      {/* Frequency / Monitoring — DrawerSection */}
      <DrawerSection
        title="Monitoring Frequency"
        caption="How often should the nurse record SpO₂ & vitals?"
        icon={<Timer className="h-4 w-4" />}
      >
        <SingleSelect
          label="Frequency"
          value={frequency}
          onChange={(v) => setFrequency(v as MonitoringFrequency)}
          options={FREQUENCY_OPTIONS.map((f) => ({ value: f, label: f }))}
        />
        {frequency === "Other" && (
          <SuffixedInput
            label="Specify Monitoring Schedule"
            value={frequencyOther}
            onChange={setFrequencyOther}
            placeholder="e.g. Every 30 minutes"
          />
        )}
      </DrawerSection>

      {/* Duration — DrawerSection */}
      <DrawerSection
        title="Duration"
        caption="How long should this order remain active?"
        icon={<Timer className="h-4 w-4" />}
      >
        <RadioGroup
          name="ox-duration"
          options={[
            { value: "Until discontinued", label: "Until discontinued" },
            { value: "Specific duration", label: "Specific duration" },
          ]}
          value={durationType}
          onChange={(v) =>
            setDurationType(v as "Until discontinued" | "Specific duration")
          }
        />
        {durationType === "Specific duration" && (
          <SuffixedInput
            label="Specify Duration"
            value={durationValue}
            onChange={setDurationValue}
            placeholder="e.g. 48 hours"
          />
        )}
      </DrawerSection>

      {/* Special Instructions — DrawerSection */}
      <DrawerSection
        title="Special Instructions"
        caption="Optional notes for the nursing team"
        icon={<Settings2 className="h-4 w-4" />}
      >
        <FormTextarea
          label="Instructions (Optional)"
          value={instructions}
          onChange={setInstructions}
          rows={3}
          maxLength={500}
          placeholder="Any additional instructions for nursing staff"
        />
      </DrawerSection>
    </ConsultationDrawer>
  );
}

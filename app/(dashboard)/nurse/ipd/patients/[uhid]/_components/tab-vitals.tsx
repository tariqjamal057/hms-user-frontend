// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-vitals.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, HeartPulse, Plus, X } from "lucide-react";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { FormButton, SuffixedInput } from "@/components/forms/form-controls";
import { PillButton } from "@/components/forms/pill-button";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import { VitalsHistoryTable } from "@/components/patient-detail/vitals-history-table";
import type { VitalRecord } from "@/types/nurse/ipd/nurse-ipd-types";
import { CURRENT_NURSE } from "@/lib/nurse/ipd/nurse-ipd-data";

export function TabVitals({ vitals, onAddVital, recordVitalsPath }: { vitals: VitalRecord[]; onAddVital: (vital: VitalRecord) => void; recordVitalsPath?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const latest = vitals[0];

  function handleAddVitals() {
    if (recordVitalsPath) {
      router.push(recordVitalsPath);
    } else {
      setOpen(true);
    }
  }

  return (
    <div className="space-y-5">
      {/* Latest vitals — unified CurrentVitals */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-800">Latest Vitals</p>
              <p className="text-xs text-slate-500">
                {latest ? `Recorded ${latest.dateTime} by ${latest.recordedBy}` : "No vitals recorded yet."}
              </p>
            </div>
          </div>
          <PillButton icon={Plus} onClick={handleAddVitals} className="self-start sm:self-auto">
            Add Vitals
          </PillButton>
        </div>

        <div className="mt-4">
          <CurrentVitals
            showIcuTiles
            showWeightHeight={false}
            vitals={
              latest
                ? {
                    bp: latest.bp,
                    pulse: String(latest.pulse),
                    temp: String(latest.temp),
                    spo2: String(latest.spo2),
                    respRate: String(latest.respRate),
                    pain: String(latest.pain),
                  }
                : {}
            }
            gridClassName="grid-cols-3 sm:grid-cols-6"
          />
        </div>
      </div>

      {/* Vitals history — unified VitalsHistoryTable */}
      <VitalsHistoryTable
        rows={vitals.map((v) => ({
          dateTime: v.dateTime,
          bp: v.bp,
          pulse: String(v.pulse),
          temp: String(v.temp),
          spo2: String(v.spo2),
          respRate: String(v.respRate),
          pain: String(v.pain),
          recordedBy: v.recordedBy,
        }))}
        showIcuColumns
        title="Vitals History (Doctor, RMO & Nurse Entries)"
        emptyText="No vitals history available."
      />

      {!recordVitalsPath && (
        <AddVitalDrawer
          open={open}
          onOpenChange={setOpen}
          onSave={(vital) => { onAddVital(vital); setOpen(false); }}
        />
      )}
    </div>
  );
}

function AddVitalDrawer({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (next: boolean) => void; onSave: (vital: VitalRecord) => void }) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [respRate, setRespRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [pain, setPain] = useState("");

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setSystolic("");
      setDiastolic("");
      setPulse("");
      setRespRate("");
      setSpo2("");
      setTemp("");
      setPain("");
    }
    onOpenChange(next);
  }

  const valid = systolic && diastolic && pulse && respRate && spo2 && temp && pain;

  function handleSave() {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    onSave({
      id: `V-${Date.now()}`, dateTime: stamp, bp: `${systolic}/${diastolic}`,
      systolic: Number(systolic), diastolic: Number(diastolic), pulse: Number(pulse),
      respRate: Number(respRate), spo2: Number(spo2), temp: Number(temp), pain: Number(pain),
      recordedBy: CURRENT_NURSE.name,
    });
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<HeartPulse className="h-5 w-5" />}
      title="Add New Vitals"
      description={`Recording as ${CURRENT_NURSE.name} (Nurse)`}
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={handleSave} disabled={!valid}>
            <Check className="mr-1 h-4 w-4" />
            Save Vitals
          </FormButton>
        </div>
      }
    >
      <DrawerSection title="Vital Readings" caption="Enter the latest observed values" icon={<HeartPulse className="h-4 w-4 text-red-500" />}>
        <div className="grid grid-cols-2 gap-3">
          <SuffixedInput label="Systolic BP *" suffix="mmHg" type="number" value={systolic} onChange={setSystolic} />
          <SuffixedInput label="Diastolic BP *" suffix="mmHg" type="number" value={diastolic} onChange={setDiastolic} />
          <SuffixedInput label="Pulse *" suffix="/min" type="number" value={pulse} onChange={setPulse} />
          <SuffixedInput label="Resp. Rate *" suffix="/min" type="number" value={respRate} onChange={setRespRate} />
          <SuffixedInput label="SpO₂ *" suffix="%" type="number" value={spo2} onChange={setSpo2} />
          <SuffixedInput label="Temperature *" suffix="°F" type="number" value={temp} onChange={setTemp} placeholder="98.6" />
          <div className="col-span-2">
            <SuffixedInput label="Pain Score *" suffix="/10" type="number" value={pain} onChange={setPain} placeholder="0-10" />
          </div>
        </div>
      </DrawerSection>
    </ConsultationDrawer>
  );
}
// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-vitals.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, HeartPulse, Plus, X } from "lucide-react";
import type { VitalRecord } from "@/types/rmo/ipd/rmo-types";
import { CURRENT_RMO } from "@/lib/rmo/ipd/rmo-data";
import { QuickVitalsStrip } from "@/components/patient-detail/quick-vitals-strip";
import { VitalsHistoryTable, type VitalsHistoryRow } from "@/components/patient-detail/vitals-history-table";
import { DateField, FormButton, SuffixedInput } from "@/components/forms/form-controls";
import { ConsultationDrawer, DrawerSection } from "@/components/consultation/drawer";
import { PillButton } from "@/components/forms/pill-button";

export function SectionVitals({ vitals, onAddVital, recordPath }: { vitals: VitalRecord[]; onAddVital: (vital: VitalRecord) => void; recordPath?: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => date ? vitals.filter((v) => v.date === date) : vitals, [vitals, date]);
  const latest = vitals[0];

  const historyRows: VitalsHistoryRow[] = filtered.map((v) => ({
    date: v.date,
    dateTime: v.dateTime,
    bp: v.bp,
    pulse: v.pulse,
    temp: v.temp,
    spo2: v.spo2,
    respRate: v.respRate,
    pain: v.pain,
    recordedBy: `${v.recordedBy} (${v.recordedByRole})`,
  }));

  return (
    <div className="space-y-5">
      {/* Latest vitals */}
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
          <PillButton icon={Plus} onClick={() => (recordPath ? router.push(recordPath) : setOpen(true))} className="self-start sm:self-auto">
            Add Vitals
          </PillButton>
        </div>
        {latest && (
          <div className="mt-4">
            <QuickVitalsStrip
              vitals={[
                { label: "BP", value: latest.bp, unit: "mmHg" },
                { label: "Pulse", value: String(latest.pulse), unit: "/min" },
                { label: "Temp", value: String(latest.temp), unit: "°F" },
                { label: "RR", value: String(latest.respRate), unit: "/min" },
                { label: "SpO₂", value: String(latest.spo2), unit: "%" },
                { label: "Pain", value: String(latest.pain), unit: "/10" },
              ]}
            />
          </div>
        )}
      </div>

      {/* Vitals history */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">Vitals History (Doctor, RMO &amp; Nurse Entries)</p>
            <p className="text-xs text-slate-500">{filtered.length} entries{date ? ` for ${date}` : ""}</p>
          </div>
          <div className="w-full sm:w-56">
            <DateField label="" value={date} onChange={setDate} placeholder="Filter by date" />
          </div>
        </div>
        <VitalsHistoryTable
          rows={historyRows}
          title="Vitals Trend History"
          showIcuColumns
          emptyText={date ? "No vitals found for this date." : "No vitals recorded yet."}
        />
      </div>

      <AddVitalsDrawer
        open={open}
        onOpenChange={setOpen}
        onSave={(vital) => {
          onAddVital(vital);
          setOpen(false);
        }}
      />
    </div>
  );
}

function AddVitalsDrawer({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (next: boolean) => void; onSave: (vital: VitalRecord) => void }) {
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
    const now = new Date();
    onSave({
      id: `V-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      dateTime: now.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      bp: `${systolic}/${diastolic}`,
      pulse: Number(pulse),
      respRate: Number(respRate),
      spo2: Number(spo2),
      temp: Number(temp),
      pain: Number(pain),
      recordedBy: CURRENT_RMO.name,
      recordedByRole: "RMO",
    });
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<HeartPulse className="h-5 w-5" />}
      title="Add New Vitals"
      description={`Recording as ${CURRENT_RMO.name} (RMO)`}
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
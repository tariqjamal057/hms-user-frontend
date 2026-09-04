// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-vitals.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <HeartPulse className="h-4 w-4 text-red-500" />
          Latest Vitals
        </p>
        <PillButton size="sm" icon={Plus} onClick={handleAddVitals}>
          Add Vitals
        </PillButton>
      </div>

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
      {latest && (
        <p className="text-xs text-slate-400">Recorded {latest.dateTime} by {latest.recordedBy}</p>
      )}

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
        title="Vitals History"
        emptyText="No vitals history available."
      />

      {!recordVitalsPath && open && (
        <AddVitalDialog onCancel={() => setOpen(false)} onSave={(vital) => { onAddVital(vital); setOpen(false); }} />
      )}
    </div>
  );
}

function AddVitalDialog({ onCancel, onSave }: { onCancel: () => void; onSave: (vital: VitalRecord) => void }) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [respRate, setRespRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [pain, setPain] = useState("");

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-800">Add New Vitals</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-5 w-5" /></Button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          <Field label="Systolic BP (mmHg)"><Input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} /></Field>
          <Field label="Diastolic BP (mmHg)"><Input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} /></Field>
          <Field label="Pulse (/min)"><Input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} /></Field>
          <Field label="Resp. Rate (/min)"><Input type="number" value={respRate} onChange={(e) => setRespRate(e.target.value)} /></Field>
          <Field label="SpO₂ (%)"><Input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} /></Field>
          <Field label="Temperature (°F)"><Input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} /></Field>
          <Field label="Pain Score (0-10)"><Input type="number" min={0} max={10} value={pain} onChange={(e) => setPain(e.target.value)} /></Field>
        </div>
        <div className="flex gap-3 border-t border-slate-100 p-5">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={!valid} onClick={handleSave}>Save Vitals</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs text-slate-500">{label}</Label><div className="mt-1">{children}</div></div>;
}

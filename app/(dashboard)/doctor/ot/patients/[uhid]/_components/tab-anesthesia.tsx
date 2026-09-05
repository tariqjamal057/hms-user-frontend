// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-anesthesia.tsx
"use client";

import {
  Activity,
  AirVent,
  BedDouble,
  CheckCircle2,
  ClipboardList,
  Container,
  Droplets,
  HeartPulse,
  ListChecks,
  ShieldCheck,
  Syringe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { AnesthesiaRecord } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";

export function TabAnesthesia({ record }: { record?: AnesthesiaRecord }) {
  if (!record) {
    return (
      <>
        <OtSectionHeader icon={<ShieldCheck className="h-5 w-5" />} title="Anesthesia" subtitle="Plan, induction, intra-operative anesthesia monitoring" tone="from-violet-500 to-purple-600" />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">No anesthesia record yet.</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <OtSectionHeader
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Anesthesia"
        subtitle={`${record.recordedBy} · ${record.recordedAt}`}
        tone="from-violet-500 to-purple-600"
        right={<Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">{record.type}</Badge>}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTileCard title="Type" icon={<ShieldCheck className="h-3.5 w-3.5" />} tone="purple" value={record.type} />
        <InfoTileCard title="Airway" icon={<AirVent className="h-3.5 w-3.5" />} tone="cyan" value={record.airway} />
        <InfoTileCard title="Induction Agent" icon={<Syringe className="h-3.5 w-3.5" />} tone="rose" value={record.inductionAgent} />
        <InfoTileCard title="Vital Monitoring" icon={<HeartPulse className="h-3.5 w-3.5" />} tone="red" value={record.vitalMonitoring} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard title="Fluids Administered" icon={<Droplets className="h-3.5 w-3.5" />} tone="blue" value={record.fluidsGiven} />
        <InfoTileCard title="Blood / Products" icon={<Container className="h-3.5 w-3.5" />} tone="amber" value={record.bloodProducts} />
        <InfoTileCard title="Post-Op Position" icon={<BedDouble className="h-3.5 w-3.5" />} tone="emerald" value={record.postOpPosition} />
        <InfoTileCard title="Intra-Op Events" icon={<ClipboardList className="h-3.5 w-3.5" />} tone="purple" value={record.intraOpEvents || "None"} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <ListChecks className="h-4 w-4 text-violet-600" /> Anesthesia Plan
        </p>
        <p className="text-sm text-slate-600">{record.plan}</p>

        <p className="mb-2 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Activity className="h-3.5 w-3.5" /> Pre-Induction Checklist
        </p>
        <div className="flex flex-wrap gap-2">
          {record.preInductionChecklist.map((step) => (
            <span key={step} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
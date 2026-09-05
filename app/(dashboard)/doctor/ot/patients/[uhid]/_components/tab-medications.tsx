// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-medications.tsx
"use client";

import { Pill, Syringe } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { OtMedicationDose } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";

export function TabMedications({ medications }: { medications: OtMedicationDose[] }) {
  const columns: DataColumn<OtMedicationDose>[] = [
    {
      key: "medicine",
      label: "Medicine",
      render: (m) => (
        <div>
          <p className="font-semibold text-slate-800">{m.medicine}</p>
          <p className="text-xs text-slate-400">{m.dose} · {m.route}</p>
        </div>
      ),
    },
    {
      key: "time",
      label: "Time",
      render: (m) => <span className="text-sm text-slate-600">{m.time}</span>,
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (m) => <span className="text-sm text-slate-600">{m.purpose}</span>,
      hideOnMobile: true,
    },
    {
      key: "givenBy",
      label: "Given By",
      render: (m) => <span className="text-sm text-slate-600">{m.givenBy}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <OtSectionHeader icon={<Pill className="h-5 w-5" />} title="OT Medications" subtitle="Medications given in the OT before, during and after the procedure" tone="from-emerald-500 to-teal-600" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard title="Total" icon={<Pill className="h-3.5 w-3.5" />} tone="blue" value={String(medications.length)} subtitle="Doses administered" />
        <InfoTileCard title="Antibiotics" icon={<Syringe className="h-3.5 w-3.5" />} tone="emerald" value={String(medications.filter((m) => /cefuroxime|antibiotic/i.test(`${m.medicine} ${m.purpose}`)).length)} subtitle="Prophylaxis" />
        <InfoTileCard title="Analgesics" icon={<Pill className="h-3.5 w-3.5" />} tone="amber" value={String(medications.filter((m) => /paracetamol|analges|pain/i.test(`${m.medicine} ${m.purpose}`)).length)} subtitle="Pain relief" />
        <InfoTileCard title="Other" icon={<Syringe className="h-3.5 w-3.5" />} tone="slate" value={String(medications.filter((m) => !/cefuroxime|antibiotic|paracetamol|analges|pain/i.test(`${m.medicine} ${m.purpose}`)).length)} subtitle="Supportive care" />
      </div>

      <DataTable card title="Medication Administration Record" titleIcon={<Pill className="h-4 w-4" />} rows={medications} columns={columns} rowKey={(m) => m.id} countLabel="doses" emptyText="No OT medications recorded." />
    </div>
  );
}
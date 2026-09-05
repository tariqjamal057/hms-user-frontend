// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-supplies.tsx
"use client";

import { Boxes, Bone, CreditCard, Microscope, Package, Syringe, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { OtConsumable, OtImplant, OtSpecimen } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";

/* ---------- Consumables ---------- */

export function TabConsumables({ items }: { items: OtConsumable[] }) {
  const columns: DataColumn<OtConsumable>[] = [
    { key: "item", label: "Item", render: (c) => <span className="font-semibold text-slate-800">{c.item}</span> },
    { key: "quantity", label: "Qty", align: "right", render: (c) => <span className="font-semibold text-slate-700">{c.quantity} <span className="text-[10px] font-normal text-slate-400">{c.unit}</span></span> },
    { key: "usedBy", label: "Used By", render: (c) => <span className="text-slate-600">{c.usedBy}</span> },
  ];
  const total = items.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="space-y-5">
      <OtSectionHeader icon={<Package className="h-5 w-5" />} title="Consumables" subtitle="Disposables and materials consumed during the procedure" tone="from-sky-500 to-cyan-600" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTileCard title="Items Used" icon={<Package className="h-3.5 w-3.5" />} tone="blue" value={String(items.length)} />
        <InfoTileCard title="Total Units" icon={<Boxes className="h-3.5 w-3.5" />} tone="cyan" value={String(total)} />
        <InfoTileCard title="Barcode Tracked" icon={<Tags className="h-3.5 w-3.5" />} tone="slate" value="Enabled" subtitle="Inventory auto-deducted" />
      </div>
      <DataTable card title="Consumables Used" titleIcon={<Package className="h-4 w-4" />} rows={items} columns={columns} rowKey={(c) => c.id} countLabel="items" emptyText="No consumables recorded." />
    </div>
  );
}

/* ---------- Implants ---------- */

export function TabImplants({ items }: { items: OtImplant[] }) {
  const columns: DataColumn<OtImplant>[] = [
    { key: "implant", label: "Implant", render: (i) => <span className="font-semibold text-slate-800">{i.implant}</span> },
    { key: "size", label: "Size", render: (i) => <span className="text-slate-600">{i.size}</span> },
    { key: "batch", label: "Batch No.", render: (i) => <span className="font-mono text-xs text-slate-600">{i.batchNo}</span> },
    { key: "expiry", label: "Expiry", render: (i) => <span className="text-slate-600">{i.expiry}</span> },
    { key: "used", label: "Used By", render: (i) => <div><p className="text-slate-700">{i.usedBy}</p><p className="text-[11px] text-slate-400">{i.notedAt}</p></div> },
  ];

  return (
    <div className="space-y-5">
      <OtSectionHeader icon={<Bone className="h-5 w-5" />} title="Implants" subtitle="Implanted devices tracked by batch and expiry" tone="from-indigo-500 to-violet-600" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTileCard title="Implants Used" icon={<Bone className="h-3.5 w-3.5" />} tone="purple" value={String(items.length)} />
        <InfoTileCard title="Batch Identified" icon={<CreditCard className="h-3.5 w-3.5" />} tone="blue" value={String(items.filter((i) => i.batchNo).length)} subtitle="Unique batch traceability" />
        <InfoTileCard title="Regulatory Log" icon={<Syringe className="h-3.5 w-3.5" />} tone="slate" value="Active" subtitle="Implants register maintained" />
      </div>
      <DataTable card title="Implant Log" titleIcon={<Bone className="h-4 w-4" />} rows={items} columns={columns} rowKey={(i) => i.id} countLabel="implants" emptyText="No implants used in this procedure." />
    </div>
  );
}

/* ---------- Specimens ---------- */

const SPECIMEN_TONES: Record<OtSpecimen["category"], string> = {
  Histopathology: "border-purple-200 bg-purple-50 text-purple-700",
  Biopsy: "border-rose-200 bg-rose-50 text-rose-700",
  Blood: "border-red-200 bg-red-50 text-red-700",
  Other: "border-slate-200 bg-slate-100 text-slate-600",
};

export function TabSpecimens({ items }: { items: OtSpecimen[] }) {
  const columns: DataColumn<OtSpecimen>[] = [
    {
      key: "specimen",
      label: "Specimen",
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-800">{s.specimen}</p>
          <p className="text-xs text-slate-400">{s.container}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (s) => <Badge variant="outline" className={SPECIMEN_TONES[s.category]}>{s.category}</Badge>,
    },
    { key: "accession", label: "Accession No.", render: (s) => <span className="font-mono text-xs text-slate-600">{s.accessionedNo}</span> },
    { key: "sentTo", label: "Sent To", render: (s) => <span className="text-slate-600">{s.sentTo}</span> },
    { key: "disposition", label: "Disposition", render: (s) => <div><p className="text-slate-700">{s.disposition}</p><p className="text-[11px] text-slate-400">{s.sentAt}</p></div> },
  ];

  return (
    <div className="space-y-5">
      <OtSectionHeader icon={<Microscope className="h-5 w-5" />} title="Specimens" subtitle="Specimens removed during the procedure — accessioned and dispatched" tone="from-amber-500 to-orange-600" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTileCard title="Specimens" icon={<Microscope className="h-3.5 w-3.5" />} tone="amber" value={String(items.length)} />
        <InfoTileCard title="Accessioned" icon={<CreditCard className="h-3.5 w-3.5" />} tone="amber" value={String(items.filter((s) => s.accessionedNo).length)} subtitle="Lab accession numbers" />
        <InfoTileCard title="Histopathology" icon={<Microscope className="h-3.5 w-3.5" />} tone="purple" value={String(items.filter((s) => s.category === "Histopathology").length)} subtitle="Sent for reporting" />
      </div>
      <DataTable card title="Specimen Log" titleIcon={<Microscope className="h-4 w-4" />} rows={items} columns={columns} rowKey={(s) => s.id} countLabel="specimens" emptyText="No specimens removed in this procedure." />
    </div>
  );
}
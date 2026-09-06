// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-documents.tsx
"use client";

import { FileCheck2, FileText, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { OtDocument } from "@/types/doctor/ot/ot-types";
import { cn } from "@/lib/utils";
import { OtSectionHeader } from "./ot-section-header";

const STATUS_TONES: Record<string, string> = {
  Signed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Completed: "border-blue-200 bg-blue-50 text-blue-700",
  Attached: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
};

const DISPLAY_OPTIONS = <T,>(values: T[]): { value: string; label: string }[] =>
  Array.from(new Set(values.filter(Boolean).map(String))).map((v) => ({
    value: v,
    label: v,
  }));

export function TabDocuments({ documents }: { documents: OtDocument[] }) {
  const columns: DataColumn<OtDocument>[] = [
    {
      key: "title",
      label: "Document",
      render: (d) => (
        <div>
          <p className="font-semibold text-slate-800">{d.title}</p>
          <p className="text-xs text-slate-400">{d.category}</p>
        </div>
      ),
    },
    {
      key: "addedBy",
      label: "Added By",
      render: (d) => <span className="text-slate-600">{d.addedBy}</span>,
      hideOnMobile: true,
    },
    {
      key: "addedAt",
      label: "Added At",
      render: (d) => <span className="text-slate-600">{d.addedAt}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "Status",
      render: (d) => <Badge variant="outline" className={cn(STATUS_TONES[d.status] ?? "border-slate-200 bg-slate-50 text-slate-600")}>{d.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-5">
      <OtSectionHeader icon={<FolderOpen className="h-5 w-5" />} title="OT Documents" subtitle="Consents, assessments, imaging and reports attached to this encounter" tone="from-blue-500 to-indigo-600" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTileCard title="Documents" icon={<FolderOpen className="h-3.5 w-3.5" />} tone="blue" value={String(documents.length)} subtitle="Attached to encounter" />
        <InfoTileCard title="Consents" icon={<FileText className="h-3.5 w-3.5" />} tone="emerald" value={String(documents.filter((d) => d.category === "Consent").length)} subtitle="Signed consents" />
        <InfoTileCard title="Reports" icon={<FileCheck2 className="h-3.5 w-3.5" />} tone="red" value={String(documents.filter((d) => d.category === "Imaging" || d.category === "Blood Bank").length)} subtitle="Attached reports" />
      </div>

      <DataTable card title="Document List" titleIcon={<FolderOpen className="h-4 w-4" />} rows={documents} columns={columns} rowKey={(d) => d.id} countLabel="documents" emptyText="No documents attached yet."
        searchable
        searchPlaceholder="Search by document, category or staff..."
        filters={[
          {
            id: "status",
            type: "select",
            label: "Status",
            placeholder: "All statuses",
            options: DISPLAY_OPTIONS(documents.map((d) => d.status)),
            getValue: (d) => d.status,
          },
          {
            id: "category",
            type: "select",
            label: "Category",
            placeholder: "All categories",
            options: DISPLAY_OPTIONS(documents.map((d) => d.category)),
            getValue: (d) => d.category,
          },
        ]}
      />
    </div>
  );
}
// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-diagnosis.tsx
import { Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type { DiagnosisEntry } from "@/types/emergency/emergency-types";

export function SectionDiagnosis({ diagnoses }: { diagnoses: DiagnosisEntry[] }) {
  const columns: DataColumn<DiagnosisEntry>[] = [
    {
      key: "name",
      label: "Diagnosis",
      render: (d) => (
        <div>
          <p className="font-semibold text-slate-800">{d.name}</p>
          <p className="text-xs text-slate-400">{d.code}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (d) => (
        <Badge
          variant="outline"
          className={
            d.type === "Confirmed"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : d.type === "Provisional"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
          }
        >
          {d.type}
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (d) =>
        d.notes ? (
          <span className="text-slate-600">{d.notes}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "addedBy",
      label: "Added By",
      render: (d) => (
        <span className="text-slate-600">
          {d.addedBy}
          <br />
          <span className="text-xs text-slate-400">{d.addedAt}</span>
        </span>
      ),
    },
  ];

  return (
    <DataTable
      card
      title="Diagnosis Details"
      titleIcon={<Stethoscope className="h-4 w-4" />}
      rows={diagnoses}
      columns={columns}
      rowKey={(d) => d.id}
      countLabel="diagnoses"
      emptyText="No diagnosis recorded yet."
    />
  );
}

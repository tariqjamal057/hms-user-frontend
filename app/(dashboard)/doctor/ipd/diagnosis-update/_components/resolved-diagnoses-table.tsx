// app/ipd/doctor/diagnosis-update/_components/resolved-diagnoses-table.tsx
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import type { ResolvedDiagnosis } from "@/types/doctor/ipd/diagnosis-types";

const COLUMNS: DataColumn<ResolvedDiagnosis>[] = [
  { key: "diagnosis", label: "Diagnosis", cellClassName: "font-medium text-slate-800" },
  { key: "type", label: "Type", cellClassName: "text-slate-500" },
  { key: "diagnosedOn", label: "Diagnosed On", cellClassName: "whitespace-nowrap text-slate-500" },
  { key: "resolvedOn", label: "Resolved On", cellClassName: "whitespace-nowrap font-medium text-slate-600" },
];

interface ResolvedDiagnosesTableProps {
  diagnoses: ResolvedDiagnosis[];
}

export function ResolvedDiagnosesTable({
  diagnoses,
}: ResolvedDiagnosesTableProps) {
  return (
    <DataTable
      rows={diagnoses}
      columns={COLUMNS}
      rowKey={(d) => d.id}
      emptyText="No resolved or inactive diagnoses."
      searchable
      searchPlaceholder="Search diagnosis or type..."
    />
  );
}

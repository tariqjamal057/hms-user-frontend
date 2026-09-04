// app/doctor/ipd/diagnosis-update/_components/current-diagnoses-table.tsx
"use client";

import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { DiagnosisStatusBadge, PrimaryBadge } from "./diagnosis-badges";
import type {
  CurrentDiagnosis,
  DiagnosisStatus,
} from "@/types/doctor/ipd/diagnosis-types";

interface CurrentDiagnosesTableProps {
  diagnoses: CurrentDiagnosis[];
  onRemove: (id: string) => void;
  onStatusChange: (id: string, status: DiagnosisStatus) => void;
}

export function CurrentDiagnosesTable({
  diagnoses,
  onRemove,
  onStatusChange,
}: CurrentDiagnosesTableProps) {
  const columns: DataColumn<CurrentDiagnosis>[] = [
    {
      key: "index",
      label: "#",
      align: "left",
      headerClassName: "w-10",
      cellClassName: "text-slate-500",
      render: (_row, index) => index + 1,
    },
    {
      key: "diagnosis",
      label: "Diagnosis",
      render: (d) => (
        <div>
          <span className="flex items-center gap-2 font-medium text-slate-800">
            {d.diagnosis}
            {d.isPrimary && <PrimaryBadge />}
          </span>
          {d.icd10 && (
            <p className="mt-0.5 text-xs text-slate-400">ICD-10: {d.icd10}</p>
          )}
          {d.notes && (
            <p className="mt-0.5 max-w-[240px] truncate text-xs text-slate-400">
              {d.notes}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (d) => <span className="text-slate-500">{d.type}</span>,
    },
    {
      key: "diagnosedOn",
      label: "Diagnosed On",
      render: (d) => (
        <span className="whitespace-nowrap text-slate-500">{d.diagnosedOn}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (d) => (
        <Select
          value={d.status}
          onValueChange={(value) =>
            onStatusChange(d.id, value as DiagnosisStatus)
          }
        >
          <SelectTrigger className="h-8 w-[140px] border-slate-200 text-xs">
            <SelectValue>
              <DiagnosisStatusBadge status={d.status} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active
              </span>
            </SelectItem>
            <SelectItem value="Resolved">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                Resolved
              </span>
            </SelectItem>
            <SelectItem value="Ruled Out">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Ruled Out
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "action",
      label: "Action",
      align: "right",
      render: (d) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-600"
            onClick={() => onRemove(d.id)}
            title="Remove diagnosis"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={diagnoses}
      columns={columns}
      rowKey={(d) => d.id}
      emptyText="No active or current diagnoses."
    />
  );
}

// app/ipd/doctor/treatment-plan/_components/treatment-plan-table.tsx
"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { PlanPriorityBadge } from "./plan-priority-badge";
import type { TreatmentPlanItem } from "@/types/doctor/ipd/treatment-plan-types";

interface TreatmentPlanTableProps {
  items: TreatmentPlanItem[];
  onEdit: (item: TreatmentPlanItem) => void;
  onDelete: (id: string) => void;
}

export function TreatmentPlanTable({ items, onEdit, onDelete }: TreatmentPlanTableProps) {
  const columns: DataColumn<TreatmentPlanItem>[] = [
    {
      key: "index",
      label: "#",
      headerClassName: "w-10",
      cellClassName: "text-slate-500",
      render: (_row, index) => index + 1,
    },
    {
      key: "problemDiagnosis",
      label: "Problem / Diagnosis",
      cellClassName: "font-medium text-slate-800",
      render: (item) => (
        <span className="whitespace-normal font-medium text-slate-800">
          {item.problemDiagnosis}
        </span>
      ),
    },
    {
      key: "intervention",
      label: "Intervention / Management",
      headerClassName: "min-w-[220px]",
      cellClassName: "text-slate-600",
      render: (item) => (
        <span className="block whitespace-normal text-slate-600">{item.intervention}</span>
      ),
    },
    {
      key: "targetGoal",
      label: "Target / Goal",
      headerClassName: "min-w-[180px]",
      cellClassName: "text-slate-600",
      render: (item) => (
        <span className="block whitespace-normal text-slate-600">{item.targetGoal}</span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      cellClassName: "whitespace-nowrap text-slate-600",
      render: (item) => (
        <span className="whitespace-nowrap text-slate-600">{item.duration}</span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (item) => <PlanPriorityBadge priority={item.priority} />,
    },
    {
      key: "notes",
      label: "Notes",
      headerClassName: "min-w-[180px]",
      cellClassName: "text-slate-600",
      render: (item) => (
        <span className="block whitespace-normal text-slate-600">{item.notes}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      align: "right",
      headerClassName: "text-right",
      render: (item) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-blue-600"
            onClick={() => onEdit(item)}
            title="Edit treatment plan"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-red-600"
            onClick={() => onDelete(item.id)}
            title="Delete treatment plan"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={items}
      columns={columns}
      rowKey={(item) => item.id}
      emptyText="No treatment plan added yet."
    />
  );
}

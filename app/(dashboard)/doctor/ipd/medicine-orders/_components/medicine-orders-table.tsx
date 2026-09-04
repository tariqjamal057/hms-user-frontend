// app/doctor/ipd/medicine-orders/_components/medicine-orders-table.tsx
"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { MedicineStatusBadge } from "./medicine-status-badge";
import { TodayDoseIndicator } from "./today-dose-indicator";
import type { MedicineOrderItem } from "@/types/doctor/ipd/medicine-order-types";

interface MedicineOrdersTableProps {
  items: MedicineOrderItem[];
  onEdit: (item: MedicineOrderItem) => void;
  onDelete: (id: string) => void;
  onView: (item: MedicineOrderItem) => void;
}

export function MedicineOrdersTable({ items, onEdit, onDelete, onView }: MedicineOrdersTableProps) {
  const columns: DataColumn<MedicineOrderItem>[] = [
    {
      key: "index",
      label: "#",
      headerClassName: "w-10",
      cellClassName: "text-slate-500",
      render: (_row, index) => index + 1,
    },
    {
      key: "medicineName",
      label: "Medicine Name",
      render: (item) => (
        <div>
          <p className="font-medium text-slate-800">{item.medicineName}</p>
          {item.strengthForm && (
            <p className="text-xs text-slate-400">{item.strengthForm}</p>
          )}
        </div>
      ),
    },
    {
      key: "dose",
      label: "Dose",
      render: (item) => <span className="text-slate-600">{item.dose}</span>,
    },
    {
      key: "route",
      label: "Route",
      render: (item) => <span className="text-slate-600">{item.route || "—"}</span>,
    },
    {
      key: "frequency",
      label: "Frequency",
      render: (item) => <span className="text-slate-600">{item.frequency}</span>,
    },
    {
      key: "duration",
      label: "Duration",
      render: (item) => (
        <span className="whitespace-nowrap text-slate-600">{item.duration}</span>
      ),
    },
    {
      key: "instructions",
      label: "Instructions",
      render: (item) => <span className="text-slate-600">{item.instructions}</span>,
    },
    {
      key: "status",
      label: "Status",
      headerClassName: "min-w-[190px]",
      render: (item) => (
        <div className="space-y-1">
          <MedicineStatusBadge status={item.status} />
          <TodayDoseIndicator item={item} />
        </div>
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
            onClick={() => onView(item)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-blue-600"
            onClick={() => onEdit(item)}
            title="Edit medicine"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-red-600"
            onClick={() => onDelete(item.id)}
            title="Delete medicine"
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
      emptyText="No medicines added yet."
    />
  );
}

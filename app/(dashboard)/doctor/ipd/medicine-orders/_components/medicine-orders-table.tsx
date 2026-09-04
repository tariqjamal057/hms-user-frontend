// app/doctor/ipd/medicine-orders/_components/medicine-orders-table.tsx
"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { PillButton } from "@/components/forms/pill-button";
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
          <PillButton
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => onView(item)}
            aria-label="View details"
          >
            {"\u00A0"}
          </PillButton>
          <PillButton
            variant="outline"
            size="sm"
            icon={Pencil}
            onClick={() => onEdit(item)}
            aria-label="Edit medicine"
          >
            {"\u00A0"}
          </PillButton>
          <PillButton
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => onDelete(item.id)}
            aria-label="Delete medicine"
          >
            {"\u00A0"}
          </PillButton>
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

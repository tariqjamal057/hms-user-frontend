//app/doctor/ipd/investigation-orders/_components/investigation-orders-table.tsx
"use client";

import { Eye, Trash2 } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import { InvestigationStatusBadge } from "./investigation-status-badge";
import type { InvestigationOrderItem } from "@/types/doctor/ipd/investigation-order-types";

interface InvestigationOrdersTableProps {
  items: InvestigationOrderItem[];
  onView: (item: InvestigationOrderItem) => void;
  onDelete: (id: string) => void;
}

export function InvestigationOrdersTable({
  items,
  onView,
  onDelete,
}: InvestigationOrdersTableProps) {
  const columns: DataColumn<InvestigationOrderItem>[] = [
    {
      key: "index",
      label: "#",
      headerClassName: "w-10",
      cellClassName: "text-slate-500",
      render: (_row, index) => index + 1,
    },
    {
      key: "investigationName",
      label: "Investigation",
      headerClassName: "min-w-[220px]",
      render: (item) => (
        <div>
          <p className="font-medium text-slate-800">{item.investigationName}</p>
          <p className="text-xs text-slate-400">Ordered: {item.orderDate}</p>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (item) => (
        <Badge
          variant="outline"
          className={
            item.department === "Pathology"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-violet-200 bg-violet-50 text-violet-700"
          }
        >
          {item.department}
        </Badge>
      ),
    },
    {
      key: "category",
      label: "Category",
      cellClassName: "text-slate-600",
      render: (item) => <span className="text-slate-600">{item.category}</span>,
    },
    {
      key: "priority",
      label: "Urgency",
      render: (item) => (
        <Badge
          variant="outline"
          className={
            item.priority === "Urgent"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }
        >
          {item.priority}
        </Badge>
      ),
    },
    {
      key: "sample",
      label: "Sample",
      cellClassName: "text-slate-600",
      render: (item) => <span className="text-slate-600">{item.sample}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => <InvestigationStatusBadge status={item.status} />,
    },
    {
      key: "report",
      label: "Report",
      headerClassName: "min-w-[120px]",
      render: (item) =>
        item.status === "Report Ready" ? (
          <span className="text-xs font-semibold text-emerald-600">
            Available
          </span>
        ) : (
          <span className="text-xs text-slate-400">Pending</span>
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
            className="h-8 w-8 text-slate-500 hover:text-blue-600"
            onClick={() => onView(item)}
            icon={Eye}
          >{""}</PillButton>
          <PillButton
            variant="danger"
            className="h-8 w-8 text-slate-500 hover:text-red-600"
            onClick={() => onDelete(item.id)}
            icon={Trash2}
          >{""}</PillButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={items}
      columns={columns}
      rowKey={(item) => item.id}
      emptyText="No investigations added yet."
    />
  );
}

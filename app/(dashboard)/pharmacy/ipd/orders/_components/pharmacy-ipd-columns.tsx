// app/(dashboard)/pharmacy/ipd/orders/_components/pharmacy-ipd-columns.tsx
"use client";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpsActionButton } from "@/components/operations";
import type { PharmacyIpdOrder } from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";
import {
  getAdmittedDays, getBalanceDueValue, getDiscountTotalValue, getMedicinesGrossValue,
  getNetPayableValue, getTotalPaidValue,
} from "@/lib/pharmacy/ipd/pharmacy-ipd-order-data";
import { OrderStatusBadge, PaymentBadge, UrgencyBadge } from "./pharmacy-ipd-badges";


function hasUrgent(order: PharmacyIpdOrder) {
  return order.medicines.some((medicine) => medicine.urgency === "Urgent");
}

export function getPharmacyIpdColumns(onView: (order: PharmacyIpdOrder) => void): ColumnDef<PharmacyIpdOrder>[] {
  return [
    {
      id: "Patient",
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-800">{row.original.patientName}</p>
          <p className="text-xs text-slate-400">{row.original.uhid}</p>
        </div>
      ),
    },
    {
      id: "Order ID",
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{row.original.id}</p>
          <p className="text-xs text-slate-400">{row.original.ipdId}</p>
        </div>
      ),
    },
    {
      id: "Ward / Bed",
      accessorKey: "ward",
      header: "Ward / Bed",
      cell: ({ row }) => (
        <div className="text-sm text-slate-600">
          {row.original.ward}
          <p className="text-xs text-slate-400">{row.original.room} · {row.original.bed}</p>
        </div>
      ),
    },
    {
      id: "Admitted Days",
      accessorKey: "admissionDate",
      header: "Admitted",
      cell: ({ row }) => <span className="text-sm font-semibold text-slate-700">{getAdmittedDays(row.original.admissionDate)} day(s)</span>,
    },
    {
      id: "Doctor",
      accessorKey: "orderingDoctor",
      header: "Doctor",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{row.original.orderingDoctor}</p>
          <p className="text-xs text-slate-400">{row.original.department}</p>
        </div>
      ),
    },
    {
      id: "Ordered On",
      accessorKey: "orderDateTime",
      header: "Ordered On",
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.orderDateTime}</span>,
    },
    {
      id: "Medicines",
      header: "Medicines",
      cell: ({ row }) => <span className="text-sm font-semibold text-slate-700">{row.original.medicines.length} item(s)</span>,
    },
    {
      id: "Urgency",
      header: "Urgency",
      cell: ({ row }) => <UrgencyBadge urgency={hasUrgent(row.original) ? "Urgent" : "Routine"} />,
    },
    {
      id: "Gross Value",
      header: "Gross Value",
      cell: ({ row }) => <span className="text-sm font-medium text-slate-700">₹{getMedicinesGrossValue(row.original).toFixed(2)}</span>,
    },
    {
      id: "Discount",
      header: "Discount",
      cell: ({ row }) => <span className="text-sm text-amber-700">₹{getDiscountTotalValue(row.original).toFixed(2)}</span>,
    },
    {
      id: "Net Payable",
      header: "Net Payable",
      cell: ({ row }) => <span className="text-sm font-bold text-slate-800">₹{getNetPayableValue(row.original).toFixed(2)}</span>,
    },
    {
      id: "Paid",
      header: "Paid",
      cell: ({ row }) => <span className="text-sm font-medium text-emerald-700">₹{getTotalPaidValue(row.original).toFixed(2)}</span>,
    },
    {
      id: "Balance Due",
      header: "Balance Due",
      cell: ({ row }) => {
        const balance = getBalanceDueValue(row.original);
        return <span className={`text-sm font-bold ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}>₹{balance.toFixed(2)}</span>;
      },
    },
    {
      id: "Status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      id: "Payment",
      header: "Payment",
      cell: ({ row }) => <PaymentBadge status={row.original.paymentStatus} />,
    },
    {
      id: "Action",
      header: () => <span className="text-right block">Action</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <OpsActionButton label="View" icon={Eye} onClick={() => onView(row.original)} className="border-blue-200 text-blue-700" />
        </div>
      ),
      enableHiding: false,
    },
  ];
}

export const defaultColumnVisibility: VisibilityState = {
  "Admitted Days": true,
  "Ordered On": false,
  "Gross Value": false,
  "Discount": false,
};
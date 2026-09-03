// app/(dashboard)/billing/ipd/_components/billing-columns.tsx
"use client";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpsActionButton } from "@/components/operations";
import type { BillingPatient } from "@/types/billing/ipd/billing-types";
import { computeBilling, formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { BillingStatusBadge } from "./billing-badges";

export function getBillingColumns(onView: (patient: BillingPatient) => void): ColumnDef<BillingPatient>[] {
  return [
    {
      id: "Patient", accessorKey: "patientName", header: "Patient",
      cell: ({ row }) => <div><p className="font-semibold text-slate-800">{row.original.patientName}</p><p className="text-xs text-slate-400">{row.original.uhid}</p></div>,
    },
    { id: "IPD ID", accessorKey: "ipdId", header: "IPD ID", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.ipdId}</span> },
    {
      id: "Ward / Bed", accessorKey: "ward", header: "Ward / Bed",
      cell: ({ row }) => <div className="text-sm text-slate-600">{row.original.ward}<p className="text-xs text-slate-400">{row.original.room} · {row.original.bed}</p></div>,
    },
    { id: "Doctor", accessorKey: "admittingDoctor", header: "Doctor", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.admittingDoctor}</span> },
    {
      id: "Universal Payment", header: "Pharmacy/Lab Included",
      cell: ({ row }) => <Badge variant="outline" className={row.original.universalPaymentEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}>{row.original.universalPaymentEnabled ? "Included" : "Separate"}</Badge>,
    },
    {
      id: "Net Payable", header: "Net Payable",
      cell: ({ row }) => <span className="text-sm font-bold text-slate-800">{formatCurrency(computeBilling(row.original).netPayable)}</span>,
    },
    {
      id: "Collected", header: "Collected",
      cell: ({ row }) => <span className="text-sm font-semibold text-emerald-600">{formatCurrency(computeBilling(row.original).totalCollected)}</span>,
    },
    {
      id: "Due", header: "Due",
      cell: ({ row }) => {
        const due = computeBilling(row.original).dueAmount;
        return <span className={`text-sm font-bold ${due > 0 ? "text-red-600" : "text-slate-400"}`}>{formatCurrency(due)}</span>;
      },
    },
    { id: "Status", header: "Status", cell: ({ row }) => <BillingStatusBadge status={computeBilling(row.original).status} /> },
    {
      id: "Action", header: () => <span className="block text-right">Action</span>, enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right">
          <OpsActionButton label="View Details" icon={Eye} onClick={() => onView(row.original)} className="border-blue-200 text-blue-700" />
        </div>
      ),
    },
  ];
}

export const defaultBillingColumnVisibility: VisibilityState = { "Universal Payment": false };
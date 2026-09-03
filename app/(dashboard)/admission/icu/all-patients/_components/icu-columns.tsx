// app/(dashboard)/admission/icu/all-patients/_components/icu-columns.tsx
"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpsActionButton } from "@/components/operations";
import type { IcuPatient } from "@/types/admission-desk/icu/icu-types";
import { IcuStatusBadge, AdmissionTypeBadge } from "./icu-badges";

export function getIcuColumns(onView: (patient: IcuPatient) => void): ColumnDef<IcuPatient>[] {
  return [
    {
      id: "Patient", accessorKey: "patientName", header: "Patient",
      cell: ({ row }) => <div><p className="font-semibold text-slate-800">{row.original.patientName}</p><p className="text-xs text-slate-400">{row.original.uhid}</p></div>,
    },
    { id: "ICU ID", accessorKey: "icuId", header: "ICU ID" },
    { id: "Floor", accessorKey: "floor", header: "Floor" },
    { id: "Ward/Bed", accessorKey: "ward", header: "Ward/Bed", cell: ({ row }) => <span className="text-slate-600">{row.original.ward} · {row.original.bed}</span> },
    { id: "Doctor", accessorKey: "assignedDoctor", header: "Assigned Doctor" },
    { id: "Admission Type", header: "Admission Type", cell: ({ row }) => <AdmissionTypeBadge type={row.original.admissionType} /> },
    { id: "Status", header: "Status", cell: ({ row }) => <IcuStatusBadge status={row.original.status} /> },
    {
      id: "Action", header: () => <span className="block text-right">Action</span>, enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right">
          <OpsActionButton label="View Details" icon={Eye} onClick={() => onView(row.original)} />
        </div>
      ),
    },
  ];
}
// app/(dashboard)/admission-desk/emergency/all-patients/_components/emergency-columns.tsx
"use client";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Eye, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpsActionButton } from "@/components/operations";
import type { EmergencyPatient } from "@/types/emergency/emergency-types";
import { EmergencyStatusBadge } from "./emergency-badges";

export function getEmergencyColumns(onView: (patient: EmergencyPatient) => void): ColumnDef<EmergencyPatient>[] {
  return [
    {
      id: "Patient", accessorKey: "patientName", header: "Patient",
      cell: ({ row }) => <div><p className="font-semibold text-slate-800">{row.original.patientName || "Unidentified"}</p><p className="text-xs text-slate-400">{row.original.uhid}</p></div>,
    },
    { id: "Emergency No.", accessorKey: "emergencyNumber", header: "Emergency No.", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.emergencyNumber}</span> },
    { id: "Age / Gender", header: "Age / Gender", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.age ? `${row.original.age} yrs` : "—"} · {row.original.gender}</span> },
    { id: "Incident", accessorKey: "incidentType", header: "Incident", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.incidentType}</span> },
    { id: "Arrival Mode", accessorKey: "arrivalMode", header: "Arrival Mode", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.arrivalMode}</span> },
    { id: "Doctor", accessorKey: "attendingDoctor", header: "Attending Doctor", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.attendingDoctor}</span> },
    { id: "Bed / Bay", accessorKey: "bedOrBay", header: "Bed / Bay", cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.bedOrBay}</span> },
    {
      id: "Police Case", header: "Police Case",
      cell: ({ row }) => row.original.police.caseType !== "None" ? <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700"><ShieldAlert className="h-3 w-3" />{row.original.police.caseType}</Badge> : <span className="text-xs text-slate-400">—</span>,
    },
    { id: "Status", header: "Status", cell: ({ row }) => <EmergencyStatusBadge status={row.original.status} /> },
    {
      id: "Action", header: () => <span className="block text-right">Action</span>, enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right">
          <OpsActionButton label="View Details" icon={Eye} onClick={() => onView(row.original)} className="border-red-200 text-red-700" />
        </div>
      ),
    },
  ];
}

export const defaultEmergencyColumnVisibility: VisibilityState = { "Arrival Mode": false, "Police Case": true };
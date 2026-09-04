// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-assigned-nurses.tsx
import { Moon, Sunrise, Sunset, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type { ShiftAssignment, ShiftName } from "@/types/emergency/emergency-types";

const shiftIcon: Record<ShiftName, React.ElementType> = {
  Morning: Sunrise,
  Evening: Sunset,
  Night: Moon,
};
const shiftTone: Record<ShiftName, string> = {
  Morning: "border-amber-200 bg-amber-50 text-amber-700",
  Evening: "border-orange-200 bg-orange-50 text-orange-700",
  Night: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export function SectionAssignedNurses({ assignments }: { assignments: ShiftAssignment[] }) {
  const columns: DataColumn<ShiftAssignment>[] = [
    {
      key: "shift",
      label: "Shift",
      render: (a) => {
        const Icon = shiftIcon[a.shift];
        return (
          <Badge variant="outline" className={`gap-1 ${shiftTone[a.shift]}`}>
            <Icon className="h-3 w-3" />
            {a.shift}
          </Badge>
        );
      },
    },
    {
      key: "date",
      label: "Date",
      render: (a) => <span className="text-slate-600">{a.date}</span>,
    },
    {
      key: "nurses",
      label: "Assigned Nurses",
      render: (a) =>
        a.nurseNames.length === 0 ? (
          <span className="text-slate-400">Unassigned</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {a.nurseNames.map((n) => (
              <span
                key={n}
                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {n}
              </span>
            ))}
          </div>
        ),
    },
  ];

  return (
    <DataTable
      card
      title="Assigned Nurses (Shift-wise)"
      titleIcon={<UserCog className="h-4 w-4" />}
      rows={assignments}
      columns={columns}
      rowKey={(a) => `${a.date}-${a.shift}`}
      countLabel="assignments"
      emptyText="No nurse assignments recorded."
    />
  );
}

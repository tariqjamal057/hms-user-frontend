// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-medicines.tsx
"use client";
import { useMemo, useState } from "react";
import { PackageX, Pill, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type { MedicineDose } from "@/types/emergency/emergency-types";
import { DateFilterBar } from "./date-filter-bar";
import { DoseStatusBadge } from "../emergency-badges";
import { PillButton } from "@/components/forms/pill-button";

export function SectionMedicines({
  doses,
  onUpdateStatus,
}: {
  doses: MedicineDose[];
  onUpdateStatus?: (
    medicineId: string,
    medicineName: string,
    instructions: string,
  ) => void;
}) {
  const [date, setDate] = useState("");
  const todayIso = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(
    () => (date ? doses.filter((d) => d.date === date) : doses),
    [doses, date],
  );
  const outOfStock = filtered.filter((d) => d.status === "Out of Stock");

  const groupedByDate = useMemo(() => {
    const map = new Map<string, MedicineDose[]>();
    filtered.forEach((d) => {
      const rows = map.get(d.date) ?? [];
      rows.push(d);
      map.set(d.date, rows);
    });
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === todayIso) return -1;
      if (b[0] === todayIso) return 1;
      return b[0].localeCompare(a[0]);
    });
  }, [filtered, todayIso]);

  const baseColumns: DataColumn<MedicineDose>[] = useMemo(
    () => [
      {
        key: "medicineName",
        label: "Medicine",
        render: (d) => (
          <div>
            <p className="font-medium text-slate-800">{d.medicineName}</p>
            {(d.strength || d.route) && (
              <p className="text-xs text-slate-400">
                {d.strength} · {d.route}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "slot",
        label: "Slot",
        render: (d) => (
          <Badge
            variant="outline"
            className="border-slate-200 bg-white text-slate-600"
          >
            {d.slot}
          </Badge>
        ),
      },
      {
        key: "scheduledTime",
        label: "Scheduled Time",
        render: (d) => (
          <span className="text-slate-600">{d.scheduledTime}</span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (d) => <DoseStatusBadge status={d.status} />,
      },
      {
        key: "deliveredFromPharmacyAt",
        label: "Pharmacy Delivery",
        render: (d) =>
          d.deliveredFromPharmacyAt ? (
            <span className="flex items-center gap-1 text-slate-600">
              <Truck className="h-3.5 w-3.5 text-cyan-600" />
              {d.deliveredFromPharmacyAt}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
      {
        key: "givenBy",
        label: "Given By",
        render: (d) =>
          d.givenBy ? (
            <span className="text-slate-600">
              {d.givenBy} at {d.givenAt}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
      {
        key: "remarks",
        label: "Remarks",
        render: (d) => (
          <span className="text-slate-500">{d.outOfStockRemark ?? "—"}</span>
        ),
      },
    ],
    [],
  );

  const columns: DataColumn<MedicineDose>[] = useMemo(
    () =>
      onUpdateStatus
        ? [
            ...baseColumns,
            {
              key: "action",
              label: "Action",
              align: "right",
              headerClassName: "text-right",
              render: (d) =>
                d.status === "Pending" ? (
                  <PillButton
                    size="sm"
                    onClick={() =>
                      onUpdateStatus(
                        d.id,
                        d.medicineName,
                        d.instructions || "",
                      )
                    }
                  >
                    Administer
                  </PillButton>
                ) : null,
            },
          ]
        : baseColumns,
    [baseColumns, onUpdateStatus],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Pill className="h-4 w-4 text-blue-600" />
          Medicine Administration
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Today&apos;s and previous days&apos; medicine, given/not given,
          out-of-stock, and pharmacy delivery timing.
        </p>
        <div className="mt-3">
          <DateFilterBar
            value={date}
            onChange={setDate}
            label="Filter medicines by date"
          />
        </div>
      </div>

      {outOfStock.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-red-800">
            <PackageX className="h-4 w-4" />
            {outOfStock.length} medicine(s) out of stock
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {outOfStock.map((d) => (
              <Badge
                key={d.id}
                variant="outline"
                className="border-red-200 bg-white text-red-700"
              >
                {d.medicineName} · {d.date}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {groupedByDate.map(([groupDate, rows]) => {
          const isToday = groupDate === todayIso;
          return (
            <DataTable
              key={groupDate}
              card
              title={
                <span className="flex items-center gap-2">
                  {isToday
                    ? "Today"
                    : new Date(`${groupDate}T12:00:00`).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                  {isToday && (
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                      Today
                    </Badge>
                  )}
                </span>
              }
              titleIcon={<Pill className="h-4 w-4" />}
              rows={rows}
              columns={columns}
              rowKey={(d) => d.id}
              countLabel="doses"
              emptyText="No medicine records found for this date."
            />
          );
        })}
        {groupedByDate.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            No medicine records found{date ? ` for ${date}` : ""}.
          </div>
        )}
      </div>
    </div>
  );
}


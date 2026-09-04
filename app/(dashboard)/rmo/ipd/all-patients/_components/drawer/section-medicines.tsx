// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-medicines.tsx
"use client";
import { useMemo, useState } from "react";
import { ClipboardList, PackageX, Pill, Plus, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MedicineDrawer, type MedicineDraft } from "@/components/consultation/medicine-drawer";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { DateField } from "@/components/forms/form-controls";
import { PillButton } from "@/components/forms/pill-button";
import type { MedicineDose, MedicineOrder } from "@/types/rmo/ipd/rmo-types";
import { DoseStatusBadge } from "../rmo-badges";

const KNOWN_ROUTES = ["PO", "IV", "IM", "SC", "SL", "PR", "INH", "TOP", "SUB"];
const SLOTS = ["Morning", "Afternoon", "Night"];
const SLOT_TIMES = ["08:00 AM", "02:00 PM", "09:00 PM"];

function splitDosage(dosage: string): { dose: string; route: string } {
  const tokens = dosage.trim().split(/\s+/);
  const last = tokens[tokens.length - 1]?.toUpperCase();
  if (last && KNOWN_ROUTES.includes(last)) {
    return { dose: tokens.slice(0, -1).join(" "), route: last };
  }
  return { dose: dosage.trim(), route: "PO" };
}

function timesPerDayFor(frequency: string): number {
  const map: Record<string, number> = { OD: 1, BD: 2, TDS: 3, QID: 4, SOS: 1 };
  const key = frequency.trim().split(/\s+/)[0]?.toUpperCase() ?? "";
  return map[key] ?? 1;
}

export function SectionMedicines({ doses, orders, onAddOrder }: { doses: MedicineDose[]; orders: MedicineOrder[]; onAddOrder: (order: MedicineOrder, generatedDoses: MedicineDose[]) => void }) {
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);

  const todayIso = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => (date ? doses.filter((d) => d.date === date) : doses), [doses, date]);
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
      return a[0].localeCompare(b[0]);
    });
  }, [filtered, todayIso]);

  function handleSubmit(drafts: MedicineDraft[]) {
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const stamp = now.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    drafts.forEach((d) => {
      const { dose, route } = splitDosage(d.dosage);
      const frequency = d.frequency.trim().split(/\s+/)[0]?.toUpperCase() || "OD";
      const tpd = timesPerDayFor(frequency);
      const durationDays = Math.max(1, parseInt(d.duration, 10) || 1);
      const code = `M-${Date.now().toString(36).toUpperCase()}`;
      const order: MedicineOrder = {
        id: `OM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        medicineName: d.name,
        medicineCode: code,
        dose,
        frequency,
        durationDays,
        instructions: d.instructions,
        startDate,
        orderedBy: "RMO",
        orderedAt: stamp,
      };
      const generated: MedicineDose[] = [];
      for (let day = 0; day < durationDays; day++) {
        for (let i = 0; i < tpd; i++) {
          generated.push({
            id: `DM-${Date.now()}-${generated.length}`,
            medicineName: d.name,
            medicineCode: code,
            strength: dose,
            route,
            slot: SLOTS[i % SLOTS.length],
            scheduledTime: SLOT_TIMES[i % SLOT_TIMES.length],
            date: addDays(startDate, day),
            status: "Pending",
            urgency: "Routine",
          });
        }
      }
      onAddOrder(order, generated);
    });
    setOpen(false);
  }

  const columns: DataColumn<MedicineDose>[] = [
    {
      key: "medicineName",
      label: "Medicine",
      render: (d) => (
        <div>
          <p className="font-medium text-slate-800">{d.medicineName}</p>
          <p className="text-xs text-slate-400">{d.strength} · {d.route}</p>
        </div>
      ),
    },
    {
      key: "slot",
      label: "Slot",
      render: (d) => <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">{d.slot}</Badge>,
    },
    { key: "scheduledTime", label: "Scheduled Time", render: (d) => <span className="text-slate-600">{d.scheduledTime}</span> },
    { key: "status", label: "Status", render: (d) => <DoseStatusBadge status={d.status} /> },
    {
      key: "deliveredFromPharmacyAt",
      label: "Pharmacy Delivery",
      render: (d) => (
        d.deliveredFromPharmacyAt
          ? <span className="flex items-center gap-1 text-slate-600"><Truck className="h-3 w-3 text-cyan-600" />{d.deliveredFromPharmacyAt}</span>
          : <span className="text-slate-400">—</span>
      ),
    },
    {
      key: "givenBy",
      label: "Given By",
      render: (d) => (d.givenBy ? `${d.givenBy} at ${d.givenAt}` : <span className="text-slate-400">—</span>),
    },
    {
      key: "outOfStockRemark",
      label: "Remarks",
      render: (d) => <span className="text-slate-500">{d.outOfStockRemark ?? "—"}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <Pill className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">Medicine Orders &amp; Administration</p>
            <p className="text-xs text-slate-500">
              {filtered.length} doses{date ? ` for ${date}` : ""} · {orders.length} active orders
            </p>
          </div>
        </div>
        <PillButton icon={Plus} onClick={() => setOpen(true)} className="self-start sm:self-auto">
          Add Medicine
        </PillButton>
      </div>

      <div className="w-full sm:w-56">
        <DateField label="" value={date} onChange={setDate} placeholder="Filter medicines by date" />
      </div>

      {outOfStock.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-red-800"><PackageX className="h-4 w-4" />{outOfStock.length} medicine(s) out of stock</p>
          <div className="mt-2 flex flex-wrap gap-2">{outOfStock.map((d) => <Badge key={d.id} variant="outline" className="border-red-200 bg-white text-red-700">{d.medicineName} · {d.date}</Badge>)}</div>
        </div>
      )}

      <div className="space-y-4">
        {groupedByDate.map(([groupDate, rows]) => {
          const isToday = groupDate === todayIso;
          return (
            <div key={groupDate} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">
                  {isToday ? "Today" : new Date(`${groupDate}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                  {isToday && <Badge variant="outline" className="ml-2 border-blue-200 bg-blue-50 text-blue-700">Today</Badge>}
                </p>
                <span className="text-xs text-slate-500">{rows.length} dose{rows.length !== 1 ? "s" : ""}</span>
              </div>
              <DataTable
                rows={rows}
                columns={columns}
                rowKey={(d) => d.id}
                emptyText="No doses recorded."
              />
            </div>
          );
        })}
        {groupedByDate.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No medicine records found{date ? ` for ${date}` : ""}.</div>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardList className="h-4 w-4 text-violet-600" />Active Medicine Orders (Queue)</p>
        <div className="mt-3 space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{order.medicineName}</p>
                <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">{order.durationDays} days</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{order.dose} · {order.frequency} · {order.instructions}</p>
              <p className="mt-1 text-xs text-slate-400">Started {order.startDate} · Ordered by {order.orderedBy}</p>
            </div>
          ))}
          {orders.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No active medicine orders.</p>}
        </div>
      </div>

      <MedicineDrawer open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </div>
  );
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
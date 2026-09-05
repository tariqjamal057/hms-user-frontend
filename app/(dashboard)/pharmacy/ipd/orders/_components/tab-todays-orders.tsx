// app/(dashboard)/pharmacy/ipd/orders/_components/tab-todays-orders.tsx
"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  PackageX,
  Pill,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { PillButton } from "@/components/forms/pill-button";
import { SingleSelect } from "@/components/forms/select";
import type {
  DailyDoseLog,
  DoseSlot,
  PharmacyIpdMedicineItem,
  PharmacyIpdOrder,
} from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";
import { getDefaultBatch, getMedicineStockStatus } from "@/lib/pharmacy/ipd/pharmacy-ipd-order-data";
import { DailyStatusBadge, UrgencyBadge } from "./pharmacy-ipd-badges";

const SLOT_ORDER: DoseSlot[] = ["Morning", "Afternoon", "Evening", "Night"];

function getTodayLabel() {
  const now = new Date();
  return now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTodayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function dateToIso(value: string) {
  const dateText = value.split(",")[0]?.trim();
  if (!dateText) return "";
  const date = new Date(`${dateText} 12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface Props {
  order: PharmacyIpdOrder;
  onSelectBatch: (medicine: PharmacyIpdMedicineItem, batchId: string) => void;
  onDeliverDose: (medicine: PharmacyIpdMedicineItem, log: DailyDoseLog, qty: number) => void;
  onNotifyDoctor: (medicine: PharmacyIpdMedicineItem, log: DailyDoseLog) => void;
}

export function TabTodaysOrders({ order, onSelectBatch, onDeliverDose, onNotifyDoctor }: Props) {
  const [slotFilter, setSlotFilter] = useState<"All" | DoseSlot>("All");
  const todayLabel = getTodayLabel();
  const todayIso = getTodayIso();

  const sortedMedicines = useMemo(() => {
    return [...order.medicines].sort((a, b) => {
      if (a.urgency === b.urgency) return 0;
      return a.urgency === "Urgent" ? -1 : 1;
    });
  }, [order.medicines]);

  const todaysRows = useMemo(() => {
    return sortedMedicines.flatMap((medicine) =>
      medicine.dailyLogs
        .filter((log) => dateToIso(log.date) === todayIso)
        .filter((log) => slotFilter === "All" || log.slot === slotFilter)
        .map((log) => ({ medicine, log })),
    );
  }, [sortedMedicines, slotFilter, todayIso]);

  const pendingCount = todaysRows.filter((row) => row.log.status === "Pending").length;
  const deliveredCount = todaysRows.filter((row) => row.log.status === "Delivered").length;
  const outOfStockCount = todaysRows.filter((row) => row.log.status === "Out of Stock").length;
  const doseCount = todaysRows.length;

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <Pill className="h-5 w-5" />
          </span>
          <div>
            <p className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Today · {todayLabel}
            </p>
            <p className="text-xs text-slate-500">
              {doseCount} dose(s) scheduled today · {pendingCount} pending
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(["All", ...SLOT_ORDER] as const).map((slot) => (
            <button
              key={slot}
              onClick={() => setSlotFilter(slot)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                slotFilter === slot
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Scheduled Doses"
          icon={<Pill className="h-3.5 w-3.5" />}
          tone="blue"
          value={String(doseCount)}
          subtitle={slotFilter === "All" ? "All slots" : slotFilter}
        />
        <InfoTileCard
          title="Delivered"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          value={String(deliveredCount)}
          subtitle="Sent to ward"
        />
        <InfoTileCard
          title="Pending"
          icon={<Bell className="h-3.5 w-3.5" />}
          tone="amber"
          value={String(pendingCount)}
          subtitle="Awaiting dispense"
        />
        <InfoTileCard
          title="Out of Stock"
          icon={<PackageX className="h-3.5 w-3.5" />}
          tone="red"
          value={String(outOfStockCount)}
          subtitle="Doctor notified"
        />
      </div>

      <div className="space-y-3">
        {todaysRows.map(({ medicine, log }) => (
          <TodayDoseRow
            key={log.id}
            medicine={medicine}
            log={log}
            onSelectBatch={onSelectBatch}
            onDeliverDose={onDeliverDose}
            onNotifyDoctor={onNotifyDoctor}
          />
        ))}
        {todaysRows.length === 0 && (
          <InfoAlertCard
            tone="slate"
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            title="No doses scheduled"
            body={`No doses scheduled for the selected slot today (${todayLabel}).`}
          />
        )}
      </div>
    </div>
  );
}

function TodayDoseRow({
  medicine,
  log,
  onSelectBatch,
  onDeliverDose,
  onNotifyDoctor,
}: {
  medicine: PharmacyIpdMedicineItem;
  log: DailyDoseLog;
  onSelectBatch: (medicine: PharmacyIpdMedicineItem, batchId: string) => void;
  onDeliverDose: (medicine: PharmacyIpdMedicineItem, log: DailyDoseLog, qty: number) => void;
  onNotifyDoctor: (medicine: PharmacyIpdMedicineItem, log: DailyDoseLog) => void;
}) {
  const stockStatus = getMedicineStockStatus(medicine);
  const defaultBatch = getDefaultBatch(medicine);
  const activeBatch =
    medicine.batches.find((batch) => batch.id === medicine.selectedBatchId) ?? defaultBatch;
  const isPending = log.status === "Pending";
  const canDeliverFull =
    isPending &&
    Boolean(activeBatch) &&
    (activeBatch?.availableQuantity ?? 0) >= log.orderedQtyForDose;
  const canDeliverPartial =
    isPending &&
    Boolean(activeBatch) &&
    (activeBatch?.availableQuantity ?? 0) > 0 &&
    (activeBatch?.availableQuantity ?? 0) < log.orderedQtyForDose;
  const noStock =
    (isPending || log.status === "Out of Stock") &&
    (!activeBatch || activeBatch.availableQuantity === 0);
  const twoOrMoreDosesToday = medicine.slots.length > 1;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        medicine.urgency === "Urgent"
          ? "border-red-200 bg-red-50/30"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700"
            >
              {log.slot}
            </Badge>
            <p className="font-bold text-slate-800">{medicine.medicineName}</p>
            <UrgencyBadge urgency={medicine.urgency} />
            {twoOrMoreDosesToday && (
              <Badge
                variant="outline"
                className="border-cyan-200 bg-cyan-50 text-cyan-700"
              >
                {medicine.slots.length}x today ({medicine.slots.join(" + ")})
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {medicine.strength} · {medicine.frequency} · {medicine.route} · {medicine.instructions}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Qty required this dose:{" "}
            <span className="font-semibold text-slate-600">
              {log.orderedQtyForDose}
            </span>
          </p>
        </div>
        <DailyStatusBadge status={log.status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">
            Batch (FEFO — nearest expiry auto-selected)
          </p>
          <SingleSelect
            value={activeBatch?.id ?? ""}
            onChange={(value) => onSelectBatch(medicine, value)}
            options={medicine.batches.map((batch) => ({
              value: batch.id,
              label:
                batch.availableQuantity === 0
                  ? `Batch ${batch.batchNumber} · OUT OF STOCK`
                  : `Batch ${batch.batchNumber} · Stock ${batch.availableQuantity} · ₹${batch.unitPrice} · Exp ${batch.expiryDate}`,
            }))}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
            <p className="text-[10px] text-slate-400">Stock</p>
            <p className="mt-0.5 text-sm font-bold text-slate-700">
              {activeBatch ? String(activeBatch.availableQuantity) : "0"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
            <p className="text-[10px] text-slate-400">Price</p>
            <p className="mt-0.5 text-sm font-bold text-slate-700">
              {activeBatch ? `₹${activeBatch.unitPrice}` : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
            <p className="text-[10px] text-slate-400">Rack/Shelf</p>
            <p className="mt-0.5 text-sm font-bold text-slate-700">
              {activeBatch ? `${activeBatch.rackNumber}/${activeBatch.shelfNumber}` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="text-xs text-slate-400">
          {log.deliveredBy && (
            <span>Delivered by {log.deliveredBy} · {log.deliveredAt}</span>
          )}
          {log.wardReceivedAt && <span> · Ward received {log.wardReceivedAt}</span>}
          {log.remarks && <span className="italic"> · {log.remarks}</span>}
        </div>
        <div className="flex items-center gap-2">
          {!isPending && (
            <p className="text-sm font-bold text-slate-800">₹{log.amount.toFixed(2)}</p>
          )}
          {canDeliverFull && (
            <PillButton
              icon={Send}
              size="sm"
              variant="gradient"
              onClick={() => onDeliverDose(medicine, log, log.orderedQtyForDose)}
            >
              Mark Delivered &amp; Send to Ward
            </PillButton>
          )}
          {canDeliverPartial && activeBatch && (
            <PillButton
              icon={PackageX}
              size="sm"
              variant="outline"
              onClick={() => onDeliverDose(medicine, log, activeBatch.availableQuantity)}
            >
              Add Available ({activeBatch.availableQuantity})
            </PillButton>
          )}
          {noStock && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                <PackageX className="h-3.5 w-3.5" /> Excluded from bill
              </span>
              {!log.doctorNotified ? (
                <PillButton
                  icon={Bell}
                  size="sm"
                  variant="danger"
                  onClick={() => onNotifyDoctor(medicine, log)}
                >
                  Notify Doctor/Nurse
                </PillButton>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <AlertTriangle className="h-3 w-3" /> Doctor notified {log.doctorNotifiedAt}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// app/(dashboard)/pharmacy/ipd/orders/_components/tab-previous-days.tsx
"use client";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Pill,
  Wallet,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateField } from "@/components/forms/form-controls";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { PillButton } from "@/components/forms/pill-button";
import type {
  DailyDeliveryStatus,
  DoseSlot,
  PharmacyIpdOrder,
} from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";
import { DailyStatusBadge } from "./pharmacy-ipd-badges";

const TODAY = "21 Aug 2026";

interface PreviousDayRow {
  medicineName: string;
  slot: DoseSlot;
  status: DailyDeliveryStatus;
  amount: number;
  deliveredBy?: string;
  batchNumberUsed?: string;
  date: string;
}

function isoToDisplay(iso: string) {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TabPreviousDays({ order }: { order: PharmacyIpdOrder }) {
  const [dateFilter, setDateFilter] = useState("");

  const allRows: PreviousDayRow[] = useMemo(() => {
    const rows: PreviousDayRow[] = [];
    order.medicines.forEach((medicine) => {
      medicine.dailyLogs.forEach((log) => {
        if (log.date === TODAY) return;
        rows.push({
          medicineName: medicine.medicineName,
          slot: log.slot,
          status: log.status,
          amount: log.amount,
          deliveredBy: log.deliveredBy,
          batchNumberUsed: log.batchNumberUsed,
          date: log.date,
        });
      });
    });
    return rows;
  }, [order.medicines]);

  const filteredRows = useMemo(
    () =>
      dateFilter
        ? allRows.filter((r) => isoToDisplay(dateFilter) === r.date)
        : allRows,
    [allRows, dateFilter],
  );

  const totalAmount = filteredRows.reduce((sum, row) => sum + row.amount, 0);
  const deliveredCount = filteredRows.filter(
    (r) => r.status === "Delivered",
  ).length;
  const partialCount = filteredRows.filter(
    (r) => r.status === "Partially Delivered",
  ).length;
  const outOfStockCount = filteredRows.filter(
    (r) => r.status === "Out of Stock",
  ).length;

  const columns: DataColumn<PreviousDayRow>[] = [
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <span className="text-xs font-semibold text-slate-700">{r.date}</span>
      ),
    },
    {
      key: "medicineName",
      label: "Medicine",
      render: (r) => (
        <div>
          <p className="text-sm font-semibold text-slate-800">{r.medicineName}</p>
          {r.batchNumberUsed && (
            <p className="text-[10px] text-slate-400">Batch {r.batchNumberUsed}</p>
          )}
        </div>
      ),
    },
    {
      key: "slot",
      label: "Slot",
      render: (r) => (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          {r.slot}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <DailyStatusBadge status={r.status} />,
    },
    {
      key: "deliveredBy",
      label: "Delivered By",
      render: (r) => (
        <span className="text-xs text-slate-500">{r.deliveredBy ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (r) => (
        <span className="font-bold text-slate-800">₹{r.amount.toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm">
            <History className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Previous Days History
            </p>
            <p className="text-xs text-slate-500">
              {filteredRows.length} dose(s) ·{" "}
              <span className="font-mono text-slate-700">Excludes today</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Doses Recorded"
          icon={<Pill className="h-3.5 w-3.5" />}
          tone="blue"
          value={String(filteredRows.length)}
          subtitle="All history"
        />
        <InfoTileCard
          title="Delivered"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          value={String(deliveredCount)}
          subtitle="Fully dispensed"
        />
        <InfoTileCard
          title="Partial / Pending"
          icon={<Clock className="h-3.5 w-3.5" />}
          tone="amber"
          value={String(partialCount)}
          subtitle="Outstanding"
        />
        <InfoTileCard
          title="Out of Stock"
          icon={<Wallet className="h-3.5 w-3.5" />}
          tone="red"
          value={String(outOfStockCount)}
          subtitle={`₹${totalAmount.toFixed(2)} billed`}
        />
      </div>

      {/* Date filter */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:pb-2">
          <Filter className="h-3.5 w-3.5" />
          Filter by date
        </div>
        <div className="flex-1 sm:max-w-[220px]">
          <DateField
            value={dateFilter}
            onChange={setDateFilter}
            label=""
            placeholder="Pick a date"
          />
        </div>
        {dateFilter && (
          <PillButton
            icon={X}
            size="sm"
            variant="outline"
            onClick={() => setDateFilter("")}
          >
            Clear
          </PillButton>
        )}
      </div>

      {/* Table */}
      {filteredRows.length === 0 ? (
        <InfoAlertCard
          tone="slate"
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          title="No previous-day records"
          body="No doses were recorded on the selected date in the past."
        />
      ) : (
        <DataTable
          card
          title="History by Day"
          titleIcon={<CalendarDays className="h-4 w-4" />}
          rows={filteredRows}
          columns={columns}
          rowKey={(r) => `${r.date}-${r.medicineName}-${r.slot}-${r.amount}-${r.batchNumberUsed ?? ""}-${r.deliveredBy ?? ""}`}
          countLabel="doses"
          emptyText="No previous-day records found."
        />
      )}
    </div>
  );
}

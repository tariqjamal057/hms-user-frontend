// app/(dashboard)/pharmacy/ipd/orders/_components/tab-returns.tsx
"use client";
import { useMemo, useState } from "react";
import {
  Filter,
  PackageMinus,
  Pill,
  Undo2,
  UserRound,
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
import type { PharmacyIpdOrder } from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";

export function TabReturns({ order }: { order: PharmacyIpdOrder }) {
  const [dateFilter, setDateFilter] = useState("");

  const filteredReturns = useMemo(() => {
    return order.returns
      .filter((entry) => {
        if (!dateFilter) return true;
        const iso = new Date(`${entry.returnDate} 12:00:00`)
          .toISOString()
          .slice(0, 10);
        return iso === dateFilter;
      })
      .sort(
        (a, b) =>
          new Date(`${b.returnDate} 12:00:00`).getTime() -
          new Date(`${a.returnDate} 12:00:00`).getTime(),
      );
  }, [order.returns, dateFilter]);

  const totalReturnedQty = filteredReturns.reduce(
    (sum, entry) => sum + entry.returnedQty,
    0,
  );
  const totalRefund = filteredReturns.reduce(
    (sum, entry) => sum + entry.refundAmount,
    0,
  );

  const columns: DataColumn<typeof order.returns[number]>[] = [
    {
      key: "returnDate",
      label: "Date",
      render: (r) => (
        <span className="text-xs font-semibold text-slate-700">
          {r.returnDate}
        </span>
      ),
    },
    {
      key: "medicineName",
      label: "Medicine",
      render: (r) => (
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {r.medicineName}
          </p>
          <p className="text-[10px] text-slate-400">Batch {r.batchNumber}</p>
        </div>
      ),
    },
    {
      key: "returnedQty",
      label: "Qty",
      align: "center",
      render: (r) => (
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
          {r.returnedQty}
        </span>
      ),
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      align: "right",
      render: (r) => (
        <span className="text-sm text-slate-700">₹{r.unitPrice.toFixed(2)}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "returnedBy",
      label: "Returned By",
      render: (r) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{r.returnedByName}</p>
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            {r.returnedBy}
          </Badge>
        </div>
      ),
    },
    {
      key: "approvedBy",
      label: "Approved By",
      render: (r) => (
        <span className="text-xs text-slate-500">{r.approvedBy ?? "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "refundAmount",
      label: "Refund",
      align: "right",
      render: (r) => (
        <span className="font-bold text-amber-700">
          ₹{r.refundAmount.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <Undo2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Medicine Returns
            </p>
            <p className="text-xs text-slate-500">
              Refunded medicines logged back into inventory
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoTileCard
          title="Total Returns"
          icon={<PackageMinus className="h-3.5 w-3.5" />}
          tone="amber"
          value={String(filteredReturns.length)}
          subtitle="Recorded entries"
        />
        <InfoTileCard
          title="Qty Returned"
          icon={<Pill className="h-3.5 w-3.5" />}
          tone="blue"
          value={String(totalReturnedQty)}
          subtitle="Units"
        />
        <InfoTileCard
          title="Total Refund"
          icon={<Wallet className="h-3.5 w-3.5" />}
          tone="rose"
          value={`₹${totalRefund.toFixed(2)}`}
          subtitle="Credited back"
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

      {filteredReturns.length === 0 ? (
        <InfoAlertCard
          tone="slate"
          icon={<Undo2 className="h-3.5 w-3.5" />}
          title="No medicine returns"
          body="No medicine returns have been recorded for the selected date."
        />
      ) : (
        <DataTable
          card
          title="Returns Log"
          titleIcon={<Undo2 className="h-4 w-4" />}
          rows={filteredReturns}
          columns={columns}
          rowKey={(r) => r.id}
          countLabel="returns"
          emptyText="No medicine returns recorded."
        />
      )}
    </div>
  );
}

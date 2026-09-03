// app/(dashboard)/pharmacy/emergency/orders/page.tsx
"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  IndianRupee,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  DailyDoseLog,
  PharmacyIpdMedicineItem,
  PharmacyIpdOrder,
  PharmacyIpdOrderFilters,
  PharmacyPaymentMethod,
} from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";
import {
  CURRENT_EMERGENCY_PHARMACY_STAFF as CURRENT_PHARMACY_STAFF,
  PHARMACY_EMERGENCY_DOCTORS as PHARMACY_IPD_DOCTORS,
  PHARMACY_EMERGENCY_ORDERS as PHARMACY_IPD_ORDERS,
  PHARMACY_EMERGENCY_BEDS_OR_BAYS as PHARMACY_IPD_WARDS,
  getBalanceDueValue,
  getDefaultBatch,
  getNetPayableValue,
  getTotalPaidValue,
} from "@/lib/pharmacy/emergency/pharmacy-emergency-order-data";
import {
  getAdmittedDays,
  getMedicinesGrossValue,
  getDiscountTotalValue,
} from "@/lib/pharmacy/ipd/pharmacy-ipd-order-data";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import {
  OrderStatusBadge,
  PaymentBadge,
  UrgencyBadge,
} from "../../ipd/orders/_components/pharmacy-ipd-badges";
import { PharmacyIpdOrderDrawer } from "../../ipd/orders/_components/pharmacy-ipd-order-drawer";

type ViewMode = "list" | "grid";
const initialFilters: PharmacyIpdOrderFilters = {
  search: "",
  date: "",
  doctor: "",
  ward: "",
  status: "All",
  paymentStatus: "All",
};

const previousDay = {
  income: 45200,
  totalOrders: 22,
  totalMedicines: 48,
  urgentOrders: 3,
  outstanding: 12400,
};

function dateToIso(value: string) {
  const dateText = value.split(",")[0]?.trim();
  if (!dateText) return "";
  const date = new Date(`${dateText} 12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function hasUrgent(order: PharmacyIpdOrder) {
  return order.medicines.some((medicine) => medicine.urgency === "Urgent");
}

export default function PharmacyIpdOrdersPage() {
  const [orders, setOrders] = useState<PharmacyIpdOrder[]>(PHARMACY_IPD_ORDERS);
  const [filters, setFilters] = useState<PharmacyIpdOrderFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedOrder, setSelectedOrder] =
    useState<PharmacyIpdOrder | null>(null);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const query = filters.search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [order.id, order.ipdId, order.patientName, order.uhid, order.ward, order.bed]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesDate =
          !filters.date || dateToIso(order.orderDateTime) === filters.date;
        const matchesDoctor =
          !filters.doctor || order.orderingDoctor === filters.doctor;
        const matchesWard = !filters.ward || order.ward === filters.ward;
        const matchesStatus =
          filters.status === "All" || order.status === filters.status;
        const matchesPayment =
          filters.paymentStatus === "All" ||
          order.paymentStatus === filters.paymentStatus;
        return (
          matchesSearch &&
          matchesDate &&
          matchesDoctor &&
          matchesWard &&
          matchesStatus &&
          matchesPayment
        );
      }),
    [orders, filters],
  );

  const stats = useMemo(() => {
    const income = orders.reduce(
      (sum, order) => sum + getTotalPaidValue(order),
      0,
    );
    const totalMedicines = orders.reduce(
      (sum, order) => sum + order.medicines.length,
      0,
    );
    const urgentOrders = orders.filter(hasUrgent).length;
    const outstanding = orders.reduce(
      (sum, order) => sum + getBalanceDueValue(order),
      0,
    );
    return { income, totalOrders: orders.length, totalMedicines, urgentOrders, outstanding };
  }, [orders]);

  function updateFilter<K extends keyof PharmacyIpdOrderFilters>(
    key: K,
    value: PharmacyIpdOrderFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function syncSelected(
    orderId: string,
    updater: (order: PharmacyIpdOrder) => PharmacyIpdOrder,
  ) {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId ? updater(order) : order,
      ),
    );
    setSelectedOrder((previous) =>
      previous?.id === orderId ? updater(previous) : previous,
    );
  }

  function handleSelectBatch(
    orderId: string,
    medicine: PharmacyIpdMedicineItem,
    batchId: string,
  ) {
    syncSelected(orderId, (order) => ({
      ...order,
      medicines: order.medicines.map((item) =>
        item.id === medicine.id ? { ...item, selectedBatchId: batchId } : item,
      ),
    }));
  }

  function handleDeliverDose(
    orderId: string,
    medicine: PharmacyIpdMedicineItem,
    log: DailyDoseLog,
    qty: number,
  ) {
    const activeBatch =
      medicine.batches.find((batch) => batch.id === medicine.selectedBatchId) ??
      getDefaultBatch(medicine);
    if (!activeBatch || activeBatch.availableQuantity <= 0) return;

    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const isFull = qty >= log.orderedQtyForDose;

    syncSelected(orderId, (order) => ({
      ...order,
      medicines: order.medicines.map((item) => {
        if (item.id !== medicine.id) return item;
        const updatedBatches = item.batches.map((batch) =>
          batch.id === activeBatch.id
            ? {
                ...batch,
                availableQuantity: Math.max(
                  0,
                  batch.availableQuantity - qty,
                ),
              }
            : batch,
        );
        const updatedLogs = item.dailyLogs.map((entry) =>
          entry.id === log.id
            ? {
                ...entry,
                status: (isFull
                  ? "Delivered"
                  : "Partially Delivered") as DailyDoseLog["status"],
                deliveredQtyForDose: qty,
                batchNumberUsed: activeBatch.batchNumber,
                unitPriceUsed: activeBatch.unitPrice,
                amount: qty * activeBatch.unitPrice,
                deliveredBy: CURRENT_PHARMACY_STAFF.name,
                deliveredAt: stamp,
                wardReceivedAt: stamp,
              }
            : entry,
        );
        return { ...item, batches: updatedBatches, dailyLogs: updatedLogs };
      }),
    }));
    toast.success(
      `${medicine.medicineName} (${log.slot}) marked delivered and sent to ward.`,
    );
  }

  function handleNotifyDoctor(
    orderId: string,
    medicine: PharmacyIpdMedicineItem,
    log: DailyDoseLog,
  ) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    syncSelected(orderId, (order) => ({
      ...order,
      medicines: order.medicines.map((item) =>
        item.id === medicine.id
          ? {
              ...item,
              dailyLogs: item.dailyLogs.map((entry) =>
                entry.id === log.id
                  ? {
                      ...entry,
                      doctorNotified: true,
                      doctorNotifiedAt: stamp,
                    }
                  : entry,
              ),
            }
          : item,
      ),
    }));
    toast.success(
      `Doctor and nurse notified: ${medicine.medicineName} is out of stock.`,
    );
  }

  function handleAddPayments(
    orderId: string,
    lines: Array<{ method: PharmacyPaymentMethod; amount: number }>,
  ) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    syncSelected(orderId, (order) => {
      const newPayments = lines.map((line, index) => ({
        id: `PAY-${Date.now()}-${index}`,
        method: line.method,
        amount: line.amount,
        receivedOn: stamp,
        receivedBy: CURRENT_PHARMACY_STAFF.name,
      }));
      const updatedOrder = {
        ...order,
        payments: [...order.payments, ...newPayments],
      };
      const balance = getBalanceDueValue(updatedOrder);
      return {
        ...updatedOrder,
        paymentStatus: balance <= 0 ? "Paid" : "Partially Paid",
        status: balance <= 0 ? "Payment Received" : "Partially Paid",
      };
    });
    toast.success("Payment recorded successfully.");
  }

  function handleAddDiscount(
    orderId: string,
    percentage: number,
    amount: number,
    reason: string,
  ) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    syncSelected(orderId, (order) => ({
      ...order,
      discounts: [
        ...order.discounts,
        {
          id: `DIS-${Date.now()}`,
          percentage,
          amount,
          reason,
          givenBy: CURRENT_PHARMACY_STAFF.name,
          givenByRole: CURRENT_PHARMACY_STAFF.role,
          givenOn: stamp,
        },
      ],
    }));
    toast.success(
      `${percentage}% discount (₹${amount.toFixed(2)}) applied by ${CURRENT_PHARMACY_STAFF.name}.`,
    );
  }

  function handleSendToBillingDept(orderId: string) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const current = orders.find((order) => order.id === orderId);
    syncSelected(orderId, (order) => ({
      ...order,
      billSentToBillingDeptAt: stamp,
      status: "Billed to Department",
    }));
    toast.success(
      `Bill sent to Billing Department for ${current?.patientName ?? "patient"}.`,
    );
  }

  const hasActiveFilters =
    filters.search ||
    filters.date ||
    filters.doctor ||
    filters.ward ||
    filters.status !== "All" ||
    filters.paymentStatus !== "All";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Collected",
      value: `₹${stats.income.toFixed(2)}`,
      icon: IndianRupee,
      accent: "emerald",
      footer: "All recorded payments",
      trend: buildTrend(stats.income, previousDay.income),
    },
    {
      label: "Total Emergency Orders",
      value: String(stats.totalOrders),
      icon: ReceiptText,
      accent: "blue",
      footer: `${stats.totalMedicines} medicines ordered`,
      trend: buildTrend(stats.totalOrders, previousDay.totalOrders),
    },
    {
      label: "Outstanding Balance",
      value: `₹${stats.outstanding.toFixed(2)}`,
      icon: CalendarClock,
      accent: "amber",
      footer: "Across all active orders",
      trend: buildTrend(stats.outstanding, previousDay.outstanding),
    },
    {
      label: "Urgent Orders",
      value: String(stats.urgentOrders),
      icon: AlertTriangle,
      accent: "rose",
      footer: "Contain at least one urgent medicine",
      trend: buildTrend(stats.urgentOrders, previousDay.urgentOrders),
    },
  ];

  const columns: OpsColumn<PharmacyIpdOrder>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (o) => (
        <div>
          <p className="font-semibold text-slate-800">{o.patientName}</p>
          <p className="text-xs text-slate-400">{o.uhid}</p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order ID",
      cell: (o) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{o.id}</p>
          <p className="text-xs text-slate-400">{o.ipdId}</p>
        </div>
      ),
    },
    {
      key: "ward",
      header: "Ward / Bed",
      cell: (o) => (
        <div className="text-sm text-slate-600">
          {o.ward}
          <p className="text-xs text-slate-400">
            {o.room} · {o.bed}
          </p>
        </div>
      ),
    },
    {
      key: "admitted",
      header: "Admitted",
      cell: (o) => (
        <span className="text-sm font-semibold text-slate-700">
          {getAdmittedDays(o.admissionDate)} day(s)
        </span>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (o) => (
        <div>
          <p className="text-sm font-medium text-slate-700">
            {o.orderingDoctor}
          </p>
          <p className="text-xs text-slate-400">{o.department}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Ordered On",
      cell: (o) => (
        <span className="text-sm text-slate-600">{o.orderDateTime}</span>
      ),
    },
    {
      key: "medicines",
      header: "Medicines",
      cell: (o) => (
        <span className="text-sm font-semibold text-slate-700">
          {o.medicines.length} item(s)
        </span>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      cell: (o) => (
        <UrgencyBadge urgency={hasUrgent(o) ? "Urgent" : "Routine"} />
      ),
    },
    {
      key: "gross",
      header: "Gross Value",
      cell: (o) => (
        <span className="text-sm font-medium text-slate-700">
          ₹{getMedicinesGrossValue(o).toFixed(2)}
        </span>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (o) => (
        <span className="text-sm text-amber-700">
          ₹{getDiscountTotalValue(o).toFixed(2)}
        </span>
      ),
    },
    {
      key: "netPayable",
      header: "Net Payable",
      cell: (o) => (
        <span className="text-sm font-bold text-slate-800">
          ₹{getNetPayableValue(o).toFixed(2)}
        </span>
      ),
    },
    {
      key: "paid",
      header: "Paid",
      cell: (o) => (
        <span className="text-sm font-medium text-emerald-700">
          ₹{getTotalPaidValue(o).toFixed(2)}
        </span>
      ),
    },
    {
      key: "balanceDue",
      header: "Balance Due",
      cell: (o) => {
        const balance = getBalanceDueValue(o);
        return (
          <span
            className={`text-sm font-bold ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}
          >
            ₹{balance.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (o) => <PaymentBadge status={o.paymentStatus} />,
    },
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      enableHiding: false,
      cell: (o) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedOrder(o)}
          className="border-blue-200 text-blue-700"
        >
          View
        </Button>
      ),
    },
  ];

  function renderCard(o: PharmacyIpdOrder) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800">{o.patientName}</p>
              <p className="text-xs text-slate-400">
                {o.uhid} · {o.ipdId}
              </p>
            </div>
            <PaymentBadge status={o.paymentStatus} />
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-700">
              {o.orderingDoctor}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {o.department} · {o.ward} · {o.bed}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Admitted {getAdmittedDays(o.admissionDate)} day(s)
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">Medicines</p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {o.medicines.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">
                Balance Due
              </p>
              <p
                className={`mt-1 text-sm font-bold ${getBalanceDueValue(o) > 0 ? "text-red-600" : "text-emerald-600"}`}
              >
                ₹{getBalanceDueValue(o).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <OrderStatusBadge status={o.status} />
            <UrgencyBadge urgency={hasUrgent(o) ? "Urgent" : "Routine"} />
          </div>
          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2 text-center text-xs text-slate-500">
            Net Payable:{" "}
            <span className="font-bold text-slate-800">
              ₹{getNetPayableValue(o).toFixed(2)}
            </span>
          </div>
          <Button
            className="mt-3 w-full border-blue-200 text-blue-700"
            variant="outline"
            onClick={() => setSelectedOrder(o)}
          >
            Manage Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Pharmacy Emergency Orders"
        description="Deliver medicines, manage returns, and handle emergency billing."
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {stats.urgentOrders} urgent order
            {stats.urgentOrders !== 1 ? "s" : ""}
          </div>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient Name, UHID, Emergency ID, ward or bed..."
            onSearch={(v) => updateFilter("search", v)}
            canClear={!!hasActiveFilters}
            onClear={() => setFilters(initialFilters)}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filters={[
              {
                key: "doctor",
                label: "Doctor",
                placeholder: "All Doctors",
                selected: filters.doctor,
                options: [
                  { value: "All", label: "All Doctors" },
                  ...PHARMACY_IPD_DOCTORS.map((d) => ({
                    value: d,
                    label: d,
                  })),
                ],
              },
              {
                key: "ward",
                label: "Ward",
                placeholder: "All Wards",
                selected: filters.ward,
                options: [
                  { value: "All", label: "All Wards" },
                  ...PHARMACY_IPD_WARDS.map((w) => ({
                    value: w,
                    label: w,
                  })),
                ],
              },
              {
                key: "status",
                label: "Order Status",
                placeholder: "All Status",
                selected: filters.status,
                options: [
                  { value: "All", label: "All Status" },
                  { value: "Active", label: "Active" },
                  { value: "Course Completed", label: "Course Completed" },
                  { value: "Payment Received", label: "Payment Received" },
                  { value: "Partially Paid", label: "Partially Paid" },
                  {
                    value: "Billed to Department",
                    label: "Billed to Department",
                  },
                ],
              },
              {
                key: "paymentStatus",
                label: "Payment",
                placeholder: "All Payments",
                selected: filters.paymentStatus,
                options: [
                  { value: "All", label: "All Payments" },
                  { value: "Paid", label: "Paid" },
                  { value: "Partially Paid", label: "Partially Paid" },
                  { value: "Unpaid", label: "Unpaid" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "doctor") updateFilter("doctor", value);
              if (key === "ward") updateFilter("ward", value);
              if (key === "status")
                updateFilter(
                  "status",
                  value as PharmacyIpdOrderFilters["status"],
                );
              if (key === "paymentStatus")
                updateFilter(
                  "paymentStatus",
                  value as PharmacyIpdOrderFilters["paymentStatus"],
                );
            }}
            extra={
              <input
                type="date"
                value={filters.date}
                onChange={(e) => updateFilter("date", e.target.value)}
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600"
              />
            }
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={filteredOrders}
            rowKey={(o) => o.id}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={filteredOrders}
            rowKey={(o) => o.id}
            renderCard={renderCard}
            pageSize={6}
          />
        )}

        <PharmacyIpdOrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSelectBatch={handleSelectBatch}
          onDeliverDose={handleDeliverDose}
          onNotifyDoctor={handleNotifyDoctor}
          onAddPayments={handleAddPayments}
          onAddDiscount={handleAddDiscount}
          onSendToBillingDept={handleSendToBillingDept}
        />
      </main>
    </div>
  );
}


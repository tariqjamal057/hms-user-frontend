// app/(dashboard)/pharmacy/opd/orders/page.tsx
"use client";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  IndianRupee,
  PackageCheck,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  PharmacyOPDOrder,
  PharmacyOrderFilters,
  PharmacyPaymentMethod,
} from "@/types/pharmacy/opd/pharmacy-opd-types";
import {
  PHARMACY_CATEGORIES,
  PHARMACY_DOCTORS,
  PHARMACY_OPD_ORDERS,
  getOrderStockStatus,
  getOrderValue,
} from "@/lib/pharmacy/opd/pharmacy-opd-orders-data";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import { PharmacyOrderDetailDrawer } from "./_components/pharmacy-order-detail-drawer";
import {
  StockBadge,
  OrderBadge,
} from "./_components/pharmacy-order-table";

type ViewMode = "list" | "grid";
const today = "18 Aug 2026";
const initialFilters: PharmacyOrderFilters = {
  search: "",
  date: "",
  doctor: "",
  category: "",
  stockStatus: "All",
  orderStatus: "All",
};

const previousDay = {
  totalEarning: 68750,
  total: 36,
  delivered: 30,
  todayOrders: 12,
  todayCollection: 23580,
  todayDelivered: 9,
  todayPending: 3,
};

export default function PharmacyOPDOrdersPage() {
  const [orders, setOrders] = useState<PharmacyOPDOrder[]>(PHARMACY_OPD_ORDERS);
  const [filters, setFilters] = useState<PharmacyOrderFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOPDOrder | null>(
    null,
  );

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const query = filters.search.trim().toLowerCase();
      const matchSearch =
        !query ||
        [
          order.id,
          order.appointmentId,
          order.patient.name,
          order.patient.uhid,
          order.patient.mobile,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchDate =
        !filters.date ||
        getOrderDateAsIso(order.orderDateTime) === filters.date;
      const matchDoctor =
        !filters.doctor || order.doctor.name === filters.doctor;
      const matchCategory =
        !filters.category ||
        order.medicines.some(
          (medicine) => medicine.category === filters.category,
        );
      const matchStock =
        filters.stockStatus === "All" ||
        getOrderStockStatus(order) === filters.stockStatus;
      const matchStatus =
        filters.orderStatus === "All" ||
        order.status === filters.orderStatus;
      return (
        matchSearch &&
        matchDate &&
        matchDoctor &&
        matchCategory &&
        matchStock &&
        matchStatus
      );
    });
  }, [orders, filters]);

  const stats = useMemo(() => {
    const totalEarning = orders
      .filter((order) => order.status !== "Pending")
      .reduce((sum, order) => sum + getOrderValue(order), 0);
    const todayOrders = orders.filter((order) =>
      order.orderDateTime.includes(today),
    );
    const todayCollection = todayOrders
      .filter((order) => order.status !== "Pending")
      .reduce((sum, order) => sum + getOrderValue(order), 0);
    return {
      totalEarning,
      total: orders.length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      todayOrders: todayOrders.length,
      todayCollection,
      todayDelivered: todayOrders.filter((o) => o.status === "Delivered").length,
      todayPending: todayOrders.filter((o) => o.status === "Pending").length,
    };
  }, [orders]);

  function change<K extends keyof PharmacyOrderFilters>(
    key: K,
    value: PharmacyOrderFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function markDelivered(
    orderId: string,
    paymentMethod: PharmacyPaymentMethod,
  ) {
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "Delivered",
              paymentMethod,
              deliveredAt: timestamp,
            }
          : order,
      ),
    );
    const delivered = orders.find((order) => order.id === orderId);
    setSelectedOrder(null);
    toast.success(
      `Medicines dispatched and delivered to ${delivered?.patient.name ?? "patient"} successfully.`,
    );
  }

  function getOrderDateAsIso(orderDateTime: string) {
    const datePart = orderDateTime.split(",")[0].trim();
    const parsedDate = new Date(`${datePart} 12:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return "";
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const hasActiveFilters =
    filters.search ||
    filters.date ||
    filters.doctor ||
    filters.category ||
    filters.stockStatus !== "All" ||
    filters.orderStatus !== "All";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Earnings",
      value: `₹${stats.totalEarning.toFixed(2)}`,
      icon: IndianRupee,
      accent: "emerald",
      footer: "Paid & delivered orders",
      trend: buildTrend(stats.totalEarning, previousDay.totalEarning),
    },
    {
      label: "Total Orders",
      value: String(stats.total),
      icon: ReceiptText,
      accent: "blue",
      footer: `${stats.delivered} delivered`,
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Today's Orders",
      value: String(stats.todayOrders),
      icon: CalendarDays,
      accent: "violet",
      footer: `₹${stats.todayCollection.toFixed(2)} collection`,
      trend: buildTrend(stats.todayOrders, previousDay.todayOrders),
    },
    {
      label: "Today's Delivery Status",
      value: `${stats.todayDelivered} / ${stats.todayOrders}`,
      icon: PackageCheck,
      accent: "amber",
      footer: `${stats.todayPending} pending orders`,
      trend: buildTrend(stats.todayDelivered, previousDay.todayDelivered),
    },
  ];

  const columns: OpsColumn<PharmacyOPDOrder>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (o) => (
        <div>
          <p className="font-semibold text-slate-800">{o.patient.name}</p>
          <p className="text-xs text-slate-400">
            {o.patient.uhid} · {o.patient.mobile}
          </p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order / Appointment",
      cell: (o) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{o.id}</p>
          <p className="text-xs text-slate-400">{o.appointmentId}</p>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (o) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{o.doctor.name}</p>
          <p className="text-xs text-slate-400">{o.doctor.specialty}</p>
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
      key: "qty",
      header: "Medicine Qty.",
      cell: (o) => (
        <span className="text-sm font-semibold text-slate-700">
          {o.medicines.reduce(
            (sum, medicine) => sum + medicine.prescribedQuantity,
            0,
          )}{" "}
          units
        </span>
      ),
    },
    {
      key: "value",
      header: "Total Value",
      cell: (o) => (
        <span className="text-sm font-bold text-slate-800">
          ₹{getOrderValue(o).toFixed(2)}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (o) => <StockBadge status={getOrderStockStatus(o)} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (o) => <OrderBadge status={o.status} />,
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
          View Details
        </Button>
      ),
    },
  ];

  function renderCard(o: PharmacyOPDOrder) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">
                {o.patient.name.split(" ").slice(-1)[0]?.charAt(0)}
                {o.patient.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{o.patient.name}</p>
                <p className="text-xs text-slate-400">{o.patient.uhid}</p>
              </div>
            </div>
            <OrderBadge status={o.status} />
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">
              {o.doctor.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {o.doctor.specialty} · {o.appointmentId}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">Medicines</p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {o.medicines.length} items
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">
                Order Value
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                ₹{getOrderValue(o).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <StockBadge status={getOrderStockStatus(o)} />
            <span className="text-xs text-slate-400">{o.orderDateTime}</span>
          </div>
          <Button
            className="mt-4 w-full border-blue-200 text-blue-700"
            variant="outline"
            onClick={() => setSelectedOrder(o)}
          >
            View & Dispense
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="OPD Pharmacy Orders"
        description="Verify prescriptions, select FEFO batches, collect payment, and deliver medicines."
        meta={
          <span className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            Live OPD Dispensing Queue
          </span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, appointment or order ID..."
            onSearch={(v) => change("search", v)}
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
                  ...PHARMACY_DOCTORS.map((d) => ({ value: d, label: d })),
                ],
              },
              {
                key: "category",
                label: "Category",
                placeholder: "All Categories",
                selected: filters.category,
                options: [
                  { value: "All", label: "All Categories" },
                  ...PHARMACY_CATEGORIES.map((c) => ({
                    value: c,
                    label: c,
                  })),
                ],
              },
              {
                key: "stockStatus",
                label: "Stock Status",
                placeholder: "All Stock",
                selected: filters.stockStatus,
                options: [
                  { value: "All", label: "All Stock" },
                  { value: "All Available", label: "All Available" },
                  { value: "Partially Available", label: "Partially Available" },
                  { value: "Out of Stock", label: "Out of Stock" },
                ],
              },
              {
                key: "orderStatus",
                label: "Order Status",
                placeholder: "All Status",
                selected: filters.orderStatus,
                options: [
                  { value: "All", label: "All Status" },
                  { value: "Pending", label: "Pending" },
                  { value: "Paid", label: "Paid" },
                  { value: "Delivered", label: "Delivered" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "doctor") change("doctor", value);
              if (key === "category") change("category", value);
              if (key === "stockStatus")
                change(
                  "stockStatus",
                  value as PharmacyOrderFilters["stockStatus"],
                );
              if (key === "orderStatus")
                change(
                  "orderStatus",
                  value as PharmacyOrderFilters["orderStatus"],
                );
            }}
            extra={
              <input
                type="date"
                value={filters.date}
                onChange={(e) => change("date", e.target.value)}
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600"
              />
            }
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={filtered}
            rowKey={(o) => o.id}
            columns={columns}
          />
        ) : (
          <OpsGrid
            data={filtered}
            rowKey={(o) => o.id}
            renderCard={renderCard}
            pageSize={6}
          />
        )}

        <PharmacyOrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDelivered={markDelivered}
        />
      </main>
    </div>
  );
}


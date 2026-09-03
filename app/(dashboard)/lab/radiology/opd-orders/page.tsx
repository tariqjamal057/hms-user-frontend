// app/(dashboard)/lab/radiology/opd-orders/page.tsx
"use client";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  ReceiptText,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import type {
  RadiologyOPDOrder,
  RadiologyOrderFilters,
  RadiologyPaymentMethod,
  RadiologyTestItem,
} from "@/types/lab/radiology/radiology-opd-types";
import {
  RADIOLOGY_CATEGORIES,
  RADIOLOGY_DOCTORS,
  RADIOLOGY_OPD_ORDERS,
  getRadiologyAggregateStatus,
  getTotalRadiologyValue,
} from "@/lib/lab/radiology/radiology-opd-orders-data";
import { RadiologyTestStatusBadge, RadiologyPaymentStatusBadge } from "./_components/radiology-status-badges";
import { RadiologyOrderDetailDrawer } from "./_components/radiology-order-detail-drawer";

type ViewMode = "list" | "grid";
const initialFilters: RadiologyOrderFilters = {
  search: "",
  date: "",
  doctor: "",
  category: "",
  status: "All",
  paymentStatus: "All",
};

function dateToIso(value: string) {
  const dateText = value.split(",")[0]?.trim();
  if (!dateText) return "";
  const date = new Date(`${dateText} 12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const previousDay = {
  income: 5100,
  orders: 11,
  ready: 19,
  processing: 7,
};

export default function RadiologyOPDOrdersPage() {
  const [orders, setOrders] = useState<RadiologyOPDOrder[]>(RADIOLOGY_OPD_ORDERS);
  const [filters, setFilters] = useState<RadiologyOrderFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOPDOrder | null>(null);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const query = filters.search.trim().toLowerCase();
        const matchesSearch =
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
        const matchesDate =
          !filters.date || dateToIso(order.orderedAt) === filters.date;
        const matchesDoctor =
          !filters.doctor || order.doctor.name === filters.doctor;
        const matchesCategory =
          !filters.category ||
          order.tests.some((test) => test.category === filters.category);
        const aggregate = getRadiologyAggregateStatus(order);
        const matchesStatus =
          filters.status === "All" ||
          aggregate === filters.status ||
          order.tests.some((test) => test.status === filters.status);
        const matchesPayment =
          filters.paymentStatus === "All" ||
          order.paymentStatus === filters.paymentStatus;
        return (
          matchesSearch &&
          matchesDate &&
          matchesDoctor &&
          matchesCategory &&
          matchesStatus &&
          matchesPayment
        );
      }),
    [orders, filters],
  );

  const stats = useMemo(() => {
    const income = orders
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((sum, order) => sum + getTotalRadiologyValue(order), 0);
    const tests = orders.reduce((sum, order) => sum + order.tests.length, 0);
    const ready = orders.reduce(
      (sum, order) =>
        sum +
        order.tests.filter((test) => test.status === "Report Ready").length,
      0,
    );
    const processing = orders.reduce(
      (sum, order) =>
        sum + order.tests.filter((test) => test.status === "Processing").length,
      0,
    );
    const unpaid = orders.filter(
      (order) => order.paymentStatus === "Unpaid",
    ).length;
    return { income, orders: orders.length, tests, ready, processing, unpaid };
  }, [orders]);

  const dateOptions = useMemo(() => {
    const dates = new Set<string>();
    orders.forEach((order) => {
      const iso = dateToIso(order.orderedAt);
      if (iso) dates.add(iso);
    });
    return Array.from(dates).sort().reverse();
  }, [orders]);

  function updateFilter<K extends keyof RadiologyOrderFilters>(
    key: K,
    value: RadiologyOrderFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function updateTest(orderId: string, updatedTest: RadiologyTestItem) {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? {
              ...order,
              tests: order.tests.map((test) =>
                test.id === updatedTest.id ? updatedTest : test,
              ),
            }
          : order,
      ),
    );
    setSelectedOrder((previous) =>
      previous?.id === orderId
        ? {
            ...previous,
            tests: previous.tests.map((test) =>
              test.id === updatedTest.id ? updatedTest : test,
            ),
          }
        : previous,
    );
    toast.success(
      updatedTest.status === "Report Ready"
        ? `${updatedTest.testName} report uploaded and locked.`
        : `${updatedTest.testName} moved to ${updatedTest.status}.`,
    );
  }

  function collectPayment(orderId: string, method: RadiologyPaymentMethod) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const target = orders.find((order) => order.id === orderId);
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paymentStatus: "Paid",
              paymentMethod: method,
              paidAt: stamp,
            }
          : order,
      ),
    );
    setSelectedOrder(null);
    toast.success(
      `Payment collected successfully from ${target?.patient.name ?? "patient"}.`,
    );
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Radiology Income", value: `₹${stats.income}`, icon: IndianRupee, accent: "emerald", footer: "Collected imaging payments", trend: buildTrend(stats.income, previousDay.income) },
    { label: "Total OPD Orders", value: String(stats.orders), icon: ReceiptText, accent: "blue", footer: `${stats.tests} ordered imaging tests`, trend: buildTrend(stats.orders, previousDay.orders) },
    { label: "Reports Ready", value: String(stats.ready), icon: CheckCircle2, accent: "violet", footer: "Uploaded and finalized reports", trend: buildTrend(stats.ready, previousDay.ready) },
    { label: "Processing / Unpaid", value: `${stats.processing} / ${stats.unpaid}`, icon: Clock3, accent: "amber", footer: "Imaging in progress / payment due", trend: buildTrend(stats.processing, previousDay.processing) },
  ];

  const columns: OpsColumn<RadiologyOPDOrder>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (order) => (
        <div>
          <p className="font-semibold text-slate-800">{order.patient.name}</p>
          <p className="text-xs text-slate-400">{order.patient.uhid} · {order.patient.mobile}</p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order / Appointment",
      cell: (order) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{order.id}</p>
          <p className="text-xs text-slate-400">{order.appointmentId}</p>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (order) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{order.doctor.name}</p>
          <p className="text-xs text-slate-400">{order.doctor.specialty}</p>
        </div>
      ),
    },
    {
      key: "orderedOn",
      header: "Ordered On",
      cell: (order) => <span className="text-sm text-slate-600">{order.orderedAt}</span>,
    },
    {
      key: "tests",
      header: "Imaging Tests",
      cell: (order) => (
        <span className="text-sm font-semibold text-slate-700">
          {order.tests.length} test{order.tests.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "testValue",
      header: "Test Value",
      cell: (order) => <span className="text-sm font-bold text-slate-800">₹{getTotalRadiologyValue(order)}</span>,
    },
    {
      key: "status",
      header: "Report Status",
      cell: (order) => <RadiologyTestStatusBadge status={getRadiologyAggregateStatus(order)} />,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (order) => <RadiologyPaymentStatusBadge status={order.paymentStatus} />,
    },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (order) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="border-sky-200 text-sky-700">
          <Eye className="mr-1 h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ];

  function renderCard(order: RadiologyOPDOrder) {
    return (
      <OpsGridCard
        avatar={order.patient.name.charAt(0).toUpperCase()}
        title={order.patient.name}
        subtitle={order.patient.uhid}
        badge={<RadiologyPaymentStatusBadge status={order.paymentStatus} />}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{order.doctor.name}</p>
            <p className="mt-1 text-xs text-slate-500">{order.doctor.specialty} · {order.appointmentId}</p>
          </>
        }
        stats={[
          { label: "Imaging Tests", value: order.tests.length },
          { label: "Total Value", value: `₹${getTotalRadiologyValue(order)}` },
        ]}
        footerTags={
          <>
            <RadiologyTestStatusBadge status={getRadiologyAggregateStatus(order)} />
            <span className="text-xs text-slate-400">{order.orderedAt}</span>
          </>
        }
        action={{
          label: "Process Imaging",
          icon: Eye,
          onClick: () => setSelectedOrder(order),
        }}
      />
    );
  }

  const isAnyFilterActive = Boolean(
    filters.search || filters.date || filters.doctor || filters.category ||
    filters.status !== "All" || filters.paymentStatus !== "All"
  );

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Radiology OPD Orders"
        description="Process imaging investigations, upload diagnostic reports, and collect radiology payments."
        meta={<span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">Imaging Queue</span>}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
            <ScanLine className="h-4 w-4" />
            {stats.processing} imaging test{stats.processing !== 1 ? "s" : ""} processing
          </div>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, appointment or radiology order..."
            onSearch={(v) => updateFilter("search", v)}
            canClear={isAnyFilterActive}
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
                options: [{ value: "", label: "All Doctors" }, ...RADIOLOGY_DOCTORS.map((d) => ({ value: d, label: d }))],
              },
              {
                key: "category",
                label: "Category",
                placeholder: "All Categories",
                selected: filters.category,
                options: [{ value: "", label: "All Categories" }, ...RADIOLOGY_CATEGORIES.map((c) => ({ value: c, label: c }))],
              },
              {
                key: "status",
                label: "Status",
                placeholder: "All Status",
                selected: filters.status,
                options: [
                  { value: "All", label: "All Status" },
                  { value: "Ordered", label: "Ordered" },
                  { value: "Processing", label: "Processing" },
                  { value: "Report Ready", label: "Report Ready" },
                ],
              },
              {
                key: "date",
                label: "Date",
                placeholder: "All Dates",
                selected: filters.date,
                options: [{ value: "", label: "All Dates" }, ...dateOptions.map((d) => ({ value: d, label: d }))],
              },
              {
                key: "paymentStatus",
                label: "Payment",
                placeholder: "All Payments",
                selected: filters.paymentStatus,
                options: [
                  { value: "All", label: "All Payments" },
                  { value: "Paid", label: "Paid" },
                  { value: "Unpaid", label: "Unpaid" },
                ],
              },
            ]}
            onFilterChange={(key, value) => updateFilter(key as keyof RadiologyOrderFilters, value as never)}
          />
        </div>

        {view === "list" ? (
          <OpsTable data={filteredOrders} rowKey={(o) => o.id} columns={columns} showColumnToggle />
        ) : (
          <OpsGrid data={filteredOrders} rowKey={(o) => o.id} renderCard={renderCard} pageSize={6} />
        )}

        <RadiologyOrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateTest={updateTest}
          onCollectPayment={collectPayment}
        />
      </main>
    </div>
  );
}


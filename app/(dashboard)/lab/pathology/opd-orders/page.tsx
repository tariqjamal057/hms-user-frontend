// app/(dashboard)/lab/pathology/opd-orders/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  ReceiptText,
  TestTube2,
} from "lucide-react";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import type {
  PathologyOPDOrder,
  PathologyOrderFilters,
} from "@/types/lab/pathology/pathology-opd-types";
import {
  PATHOLOGY_CATEGORIES,
  PATHOLOGY_DOCTORS,
  PATHOLOGY_OPD_ORDERS,
  getAggregateStatus,
  getTotalTestValue,
} from "@/lib/lab/pathology/pathology-opd-orders-data";
import { TestStatusBadge, PaymentStatusBadge } from "./_components/pathology-status-badges";

type ViewMode = "list" | "grid";
const initialFilters: PathologyOrderFilters = {
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const previousDay = {
  totalIncome: 4820,
  totalOrders: 14,
  reportsReady: 22,
  pendingTests: 11,
};

export default function PathologyOPDOrdersPage() {
  const router = useRouter();
  const orders = PATHOLOGY_OPD_ORDERS;
  const [filters, setFilters] = useState<PathologyOrderFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");

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
        const matchesStatus =
          filters.status === "All" ||
          getAggregateStatus(order) === filters.status ||
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
    const totalIncome = orders
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((sum, order) => sum + getTotalTestValue(order), 0);
    const totalTests = orders.reduce(
      (sum, order) => sum + order.tests.length,
      0,
    );
    const reportsReady = orders.reduce(
      (sum, order) =>
        sum +
        order.tests.filter((test) => test.status === "Report Ready").length,
      0,
    );
    const pendingTests = orders.reduce(
      (sum, order) =>
        sum +
        order.tests.filter((test) => test.status !== "Report Ready").length,
      0,
    );
    const unpaid = orders.filter(
      (order) => order.paymentStatus === "Unpaid",
    ).length;
    return {
      totalIncome,
      totalOrders: orders.length,
      totalTests,
      reportsReady,
      pendingTests,
      unpaid,
    };
  }, [orders]);

  const dateOptions = useMemo(() => {
    const dates = new Set<string>();
    orders.forEach((order) => {
      const iso = dateToIso(order.orderedAt);
      if (iso) dates.add(iso);
    });
    return Array.from(dates).sort().reverse();
  }, [orders]);

function updateFilter<K extends keyof PathologyOrderFilters>(
    key: K,
    value: PathologyOrderFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Pathology Income", value: `₹${stats.totalIncome}`, icon: IndianRupee, accent: "emerald", footer: "Collected payments", trend: buildTrend(stats.totalIncome, previousDay.totalIncome) },
    { label: "Total OPD Orders", value: String(stats.totalOrders), icon: ReceiptText, accent: "blue", footer: `${stats.totalTests} ordered tests`, trend: buildTrend(stats.totalOrders, previousDay.totalOrders) },
    { label: "Reports Ready", value: String(stats.reportsReady), icon: CheckCircle2, accent: "violet", footer: "Finalized laboratory reports", trend: buildTrend(stats.reportsReady, previousDay.reportsReady) },
    { label: "Pending / Unpaid", value: `${stats.pendingTests} / ${stats.unpaid}`, icon: Clock3, accent: "amber", footer: "Tests pending / orders unpaid", trend: buildTrend(stats.pendingTests, previousDay.pendingTests) },
  ];

  const columns: OpsColumn<PathologyOPDOrder>[] = [
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
      header: "Tests",
      cell: (order) => (
        <span className="text-sm font-semibold text-slate-700">
          {order.tests.length} test{order.tests.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "testValue",
      header: "Test Value",
      cell: (order) => <span className="text-sm font-bold text-slate-800">₹{getTotalTestValue(order)}</span>,
    },
    {
      key: "status",
      header: "Test Status",
      cell: (order) => <TestStatusBadge status={getAggregateStatus(order)} />,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (order) => <PaymentStatusBadge status={order.paymentStatus} />,
    },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (order) => (
        <div className="text-right">
          <OpsActionButton label="View Details" icon={Eye} onClick={() => router.push(`/lab/pathology/opd-orders/${order.id}`)} className="border-blue-200 text-blue-700" />
        </div>
      ),
    },
  ];

  function renderCard(order: PathologyOPDOrder) {
    return (
      <OpsGridCard
        avatar={order.patient.name.charAt(0).toUpperCase()}
        title={order.patient.name}
        subtitle={order.patient.uhid}
        badge={<PaymentStatusBadge status={order.paymentStatus} />}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{order.doctor.name}</p>
            <p className="mt-1 text-xs text-slate-500">{order.doctor.specialty} · {order.appointmentId}</p>
          </>
        }
        stats={[
          { label: "Total Tests", value: order.tests.length },
          { label: "Total Value", value: `₹${getTotalTestValue(order)}` },
        ]}
        footerTags={
          <>
            <TestStatusBadge status={getAggregateStatus(order)} />
            <span className="text-xs text-slate-400">{order.orderedAt}</span>
          </>
        }
        action={{
          label: "Process Tests",
          icon: Eye,
          onClick: () => router.push(`/lab/pathology/opd-orders/${order.id}`),
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
        title="Pathology OPD Orders"
        description="Collect samples, process diagnostic tests, finalize reports, and collect laboratory payments."
        meta={<span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Laboratory Queue</span>}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
            <TestTube2 className="h-4 w-4" />
            {stats.pendingTests} tests pending completion
          </div>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, appointment or pathology order..."
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
                options: [{ value: "", label: "All Doctors" }, ...PATHOLOGY_DOCTORS.map((d) => ({ value: d, label: d }))],
              },
              {
                key: "category",
                label: "Category",
                placeholder: "All Categories",
                selected: filters.category,
                options: [{ value: "", label: "All Categories" }, ...PATHOLOGY_CATEGORIES.map((c) => ({ value: c, label: c }))],
              },
              {
                key: "status",
                label: "Status",
                placeholder: "All Status",
                selected: filters.status,
                options: [
                  { value: "All", label: "All Status" },
                  { value: "Ordered", label: "Ordered" },
                  { value: "Sample Collected", label: "Sample Collected" },
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
            onFilterChange={(key, value) => updateFilter(key as keyof PathologyOrderFilters, value as never)}
          />
        </div>

{view === "list" ? (
          <OpsTable data={filteredOrders} rowKey={(o) => o.id} columns={columns} showColumnToggle />
        ) : (
          <OpsGrid data={filteredOrders} rowKey={(o) => o.id} renderCard={renderCard} pageSize={6} />
        )}
      </main>
    </div>
  );
}


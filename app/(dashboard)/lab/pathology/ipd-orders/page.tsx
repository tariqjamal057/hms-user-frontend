// app/(dashboard)/lab/pathology/ipd-orders/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle2, Clock3, Eye, IndianRupee,
  ReceiptText,
} from "lucide-react";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import type {
  PathologyIpdOrder, PathologyIpdOrderFilters,
} from "@/types/lab/pathology/pathology-ipd-types";
import {
  PATHOLOGY_IPD_DOCTORS, PATHOLOGY_IPD_ORDERS,
  getIpdAggregateStatus, getTotalIpdTestValue, hasUrgentTest,
} from "@/lib/lab/pathology/pathology-ipd-orders-data";
import { TestStatusBadge } from "../opd-orders/_components/pathology-status-badges";
import { UrgencyBadge, IpdPaymentBadge } from "./_components/pathology-ipd-badges";

type ViewMode = "list" | "grid";
const initialFilters: PathologyIpdOrderFilters = { search: "", date: "", doctor: "", category: "", status: "All", urgency: "All", paymentStatus: "All" };

function dateToIso(value: string) {
  const dateText = value.split(",")[0]?.trim();
  if (!dateText) return "";
  const date = new Date(`${dateText} 12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const previousDay = {
  totalIncome: 6340,
  totalOrders: 9,
  reportsReady: 18,
  pendingTests: 14,
};

export default function PathologyIpdOrdersPage() {
  const router = useRouter();
  const orders = PATHOLOGY_IPD_ORDERS;
  const [filters, setFilters] = useState<PathologyIpdOrderFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [order.id, order.ipdId, order.patient.name, order.patient.uhid, order.patient.ward, order.patient.bed].join(" ").toLowerCase().includes(query);
    const matchesDate = !filters.date || dateToIso(order.orderedAt) === filters.date;
    const matchesDoctor = !filters.doctor || order.doctor.name === filters.doctor;
    const matchesCategory = !filters.category || order.tests.some((test) => test.category === filters.category);
    const matchesStatus = filters.status === "All" || getIpdAggregateStatus(order) === filters.status || order.tests.some((test) => test.status === filters.status);
    const matchesUrgency = filters.urgency === "All" || (filters.urgency === "Urgent" ? hasUrgentTest(order) : !hasUrgentTest(order));
    const matchesPayment = filters.paymentStatus === "All" || order.paymentStatus === filters.paymentStatus;
    return matchesSearch && matchesDate && matchesDoctor && matchesCategory && matchesStatus && matchesUrgency && matchesPayment;
  }), [orders, filters]);

  const stats = useMemo(() => {
    const totalIncome = orders.filter((order) => order.paymentStatus === "Paid").reduce((sum, order) => sum + getTotalIpdTestValue(order), 0);
    const totalTests = orders.reduce((sum, order) => sum + order.tests.length, 0);
    const reportsReady = orders.reduce((sum, order) => sum + order.tests.filter((test) => test.status === "Report Ready").length, 0);
    const pendingTests = orders.reduce((sum, order) => sum + order.tests.filter((test) => test.status !== "Report Ready").length, 0);
    const urgentOrders = orders.filter((order) => hasUrgentTest(order)).length;
    const billsSentToDept = orders.filter((order) => Boolean(order.billSentToBillingDeptAt)).length;
    return { totalIncome, totalOrders: orders.length, totalTests, reportsReady, pendingTests, urgentOrders, billsSentToDept };
  }, [orders]);

  const dateOptions = useMemo(() => {
    const dates = new Set<string>();
    orders.forEach((order) => {
      const iso = dateToIso(order.orderedAt);
      if (iso) dates.add(iso);
    });
    return Array.from(dates).sort().reverse();
  }, [orders]);

function updateFilter<K extends keyof PathologyIpdOrderFilters>(key: K, value: PathologyIpdOrderFilters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Pathology Income", value: `₹${stats.totalIncome}`, icon: IndianRupee, accent: "emerald", footer: "Directly collected payments", trend: buildTrend(stats.totalIncome, previousDay.totalIncome) },
    { label: "Total IPD Orders", value: String(stats.totalOrders), icon: ReceiptText, accent: "blue", footer: `${stats.totalTests} ordered tests`, trend: buildTrend(stats.totalOrders, previousDay.totalOrders) },
    { label: "Reports Ready", value: String(stats.reportsReady), icon: CheckCircle2, accent: "violet", footer: "Finalized laboratory reports", trend: buildTrend(stats.reportsReady, previousDay.reportsReady) },
    { label: "Pending / Billed to Dept.", value: `${stats.pendingTests} / ${stats.billsSentToDept}`, icon: Clock3, accent: "amber", footer: "Tests pending / bills sent to billing dept.", trend: buildTrend(stats.pendingTests, previousDay.pendingTests) },
  ];

  const columns: OpsColumn<PathologyIpdOrder>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (order) => (
        <div>
          <p className="font-semibold text-slate-800">{order.patient.name}</p>
          <p className="text-xs text-slate-400">{order.patient.uhid}</p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order ID",
      cell: (order) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{order.id}</p>
          <p className="text-xs text-slate-400">{order.ipdId}</p>
        </div>
      ),
    },
    {
      key: "ward",
      header: "Ward / Bed",
      cell: (order) => (
        <div>
          <span className="text-sm text-slate-600">{order.patient.ward}</span>
          <p className="text-xs text-slate-400">{order.patient.room} · {order.patient.bed}</p>
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
      key: "urgency",
      header: "Urgency",
      cell: (order) => <UrgencyBadge urgency={hasUrgentTest(order) ? "Urgent" : "Routine"} />,
    },
    {
      key: "testValue",
      header: "Test Value",
      cell: (order) => <span className="text-sm font-bold text-slate-800">₹{getTotalIpdTestValue(order)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (order) => <TestStatusBadge status={getIpdAggregateStatus(order)} />,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (order) => <IpdPaymentBadge status={order.paymentStatus} />,
    },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (order) => (
        <div className="text-right">
          <OpsActionButton label="View Details" icon={Eye} onClick={() => router.push(`/lab/pathology/ipd-orders/${order.id}`)} className="border-violet-200 text-violet-700" />
        </div>
      ),
    },
  ];

  function renderCard(order: PathologyIpdOrder) {
    return (
      <OpsGridCard
        avatar={order.patient.name.charAt(0).toUpperCase()}
        title={order.patient.name}
        subtitle={`${order.patient.uhid} · ${order.ipdId}`}
        badge={<IpdPaymentBadge status={order.paymentStatus} />}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{order.doctor.name}</p>
            <p className="mt-1 text-xs text-slate-500">{order.doctor.specialty} · {order.patient.ward} · {order.patient.bed}</p>
          </>
        }
        stats={[
          { label: "Total Tests", value: order.tests.length },
          { label: "Total Value", value: `₹${getTotalIpdTestValue(order)}` },
        ]}
        footerTags={
          <>
            <TestStatusBadge status={getIpdAggregateStatus(order)} />
            <UrgencyBadge urgency={hasUrgentTest(order) ? "Urgent" : "Routine"} />
          </>
        }
action={{
          label: "Process Tests",
          icon: Eye,
          onClick: () => router.push(`/lab/pathology/ipd-orders/${order.id}`),
        }}
      />
    );
  }

  const isAnyFilterActive = Boolean(
    filters.search || filters.date || filters.doctor || filters.category ||
    filters.status !== "All" || filters.urgency !== "All" || filters.paymentStatus !== "All"
  );

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Pathology IPD Orders"
        description="Process ward-based diagnostic tests, finalize reports, and manage direct or department billing."
        meta={<span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Inpatient Queue</span>}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {stats.urgentOrders} urgent order{stats.urgentOrders !== 1 ? "s" : ""}
          </div>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, IPD ID, ward or bed..."
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
                options: [{ value: "", label: "All Doctors" }, ...PATHOLOGY_IPD_DOCTORS.map((d) => ({ value: d, label: d }))],
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
                key: "urgency",
                label: "Urgency",
                placeholder: "All Urgency",
                selected: filters.urgency,
                options: [
                  { value: "All", label: "All Urgency" },
                  { value: "Routine", label: "Routine" },
                  { value: "Urgent", label: "Urgent" },
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
            onFilterChange={(key, value) => updateFilter(key as keyof PathologyIpdOrderFilters, value as never)}
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


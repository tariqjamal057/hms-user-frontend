// app/(dashboard)/lab/radiology/ipd-orders/page.tsx
"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import type {
  RadiologyIpdOrder,
  RadiologyIpdOrderFilters,
  RadiologyIpdTestItem,
} from "@/types/lab/radiology/radiology-ipd-types";
import type { RadiologyPaymentMethod } from "@/types/lab/radiology/radiology-opd-types";
import {
  RADIOLOGY_IPD_DOCTORS,
  RADIOLOGY_IPD_ORDERS,
  getRadiologyIpdAggregateStatus,
  getTotalRadiologyIpdValue,
  hasUrgentRadiologyIpdTest,
} from "@/lib/lab/radiology/radiology-ipd-orders-data";
import { RadiologyTestStatusBadge } from "../opd-orders/_components/radiology-status-badges";
import { RadiologyUrgencyBadge, RadiologyIpdPaymentBadge } from "./_components/radiology-ipd-badges";
import { RadiologyIpdOrderDetailDrawer } from "./_components/radiology-ipd-order-detail-drawer";

type ViewMode = "list" | "grid";
const initialFilters: RadiologyIpdOrderFilters = {
  search: "",
  date: "",
  doctor: "",
  category: "",
  status: "All",
  urgency: "All",
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
  income: 7200,
  totalOrders: 8,
  ready: 15,
  processing: 6,
};

export default function RadiologyIpdOrdersPage() {
  const [orders, setOrders] = useState<RadiologyIpdOrder[]>(RADIOLOGY_IPD_ORDERS);
  const [filters, setFilters] = useState<RadiologyIpdOrderFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedOrder, setSelectedOrder] = useState<RadiologyIpdOrder | null>(null);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const query = filters.search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [
            order.id,
            order.ipdId,
            order.patient.name,
            order.patient.uhid,
            order.patient.ward,
            order.patient.bed,
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
          getRadiologyIpdAggregateStatus(order) === filters.status ||
          order.tests.some((test) => test.status === filters.status);
        const matchesUrgency =
          filters.urgency === "All" ||
          (filters.urgency === "Urgent"
            ? hasUrgentRadiologyIpdTest(order)
            : !hasUrgentRadiologyIpdTest(order));
        const matchesPayment =
          filters.paymentStatus === "All" ||
          order.paymentStatus === filters.paymentStatus;
        return (
          matchesSearch &&
          matchesDate &&
          matchesDoctor &&
          matchesCategory &&
          matchesStatus &&
          matchesUrgency &&
          matchesPayment
        );
      }),
    [orders, filters],
  );

  const stats = useMemo(() => {
    const income = orders
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((sum, order) => sum + getTotalRadiologyIpdValue(order), 0);
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
    const urgent = orders.filter((order) =>
      hasUrgentRadiologyIpdTest(order),
    ).length;
    const billingSent = orders.filter((order) =>
      Boolean(order.billSentToBillingDeptAt),
    ).length;
    return {
      income,
      totalOrders: orders.length,
      tests,
      ready,
      processing,
      urgent,
      billingSent,
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

  function updateFilter<K extends keyof RadiologyIpdOrderFilters>(
    key: K,
    value: RadiologyIpdOrderFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function updateTest(orderId: string, updatedTest: RadiologyIpdTestItem) {
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
    const current = orders.find((order) => order.id === orderId);
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
      `Payment collected successfully from ${current?.patient.name ?? "patient"}.`,
    );
  }

  function sendToBillingDept(orderId: string) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const current = orders.find((order) => order.id === orderId);
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? { ...order, billSentToBillingDeptAt: stamp }
          : order,
      ),
    );
    setSelectedOrder(null);
    toast.success(
      `Radiology reports delivered for ${current?.patient.name ?? "patient"}. Bill sent to IPD Billing Department.`,
    );
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Radiology Income", value: `₹${stats.income}`, icon: IndianRupee, accent: "emerald", footer: "Directly collected payments", trend: buildTrend(stats.income, previousDay.income) },
    { label: "Total IPD Orders", value: String(stats.totalOrders), icon: ReceiptText, accent: "blue", footer: `${stats.tests} imaging tests`, trend: buildTrend(stats.totalOrders, previousDay.totalOrders) },
    { label: "Reports Ready", value: String(stats.ready), icon: CheckCircle2, accent: "violet", footer: "Uploaded and finalized reports", trend: buildTrend(stats.ready, previousDay.ready) },
    { label: "Processing / Billed", value: `${stats.processing} / ${stats.billingSent}`, icon: Clock3, accent: "amber", footer: "Imaging in progress / bills sent", trend: buildTrend(stats.processing, previousDay.processing) },
  ];

  const columns: OpsColumn<RadiologyIpdOrder>[] = [
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
      header: "Imaging Tests",
      cell: (order) => (
        <span className="text-sm font-semibold text-slate-700">
          {order.tests.length} test{order.tests.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      cell: (order) => <RadiologyUrgencyBadge urgency={hasUrgentRadiologyIpdTest(order) ? "Urgent" : "Routine"} />,
    },
    {
      key: "testValue",
      header: "Test Value",
      cell: (order) => <span className="text-sm font-bold text-slate-800">₹{getTotalRadiologyIpdValue(order)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (order) => <RadiologyTestStatusBadge status={getRadiologyIpdAggregateStatus(order)} />,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (order) => <RadiologyIpdPaymentBadge status={order.paymentStatus} />,
    },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (order) => (
        <div className="text-right">
          <OpsActionButton label="View Details" icon={Eye} onClick={() => setSelectedOrder(order)} className="border-sky-200 text-sky-700" />
        </div>
      ),
    },
  ];

  function renderCard(order: RadiologyIpdOrder) {
    return (
      <OpsGridCard
        avatar={order.patient.name.charAt(0).toUpperCase()}
        title={order.patient.name}
        subtitle={`${order.patient.uhid} · ${order.ipdId}`}
        badge={<RadiologyIpdPaymentBadge status={order.paymentStatus} />}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{order.doctor.name}</p>
            <p className="mt-1 text-xs text-slate-500">{order.doctor.specialty} · {order.patient.ward} · {order.patient.bed}</p>
          </>
        }
        stats={[
          { label: "Imaging Tests", value: order.tests.length },
          { label: "Total Value", value: `₹${getTotalRadiologyIpdValue(order)}` },
        ]}
        footerTags={
          <>
            <RadiologyTestStatusBadge status={getRadiologyIpdAggregateStatus(order)} />
            <RadiologyUrgencyBadge urgency={hasUrgentRadiologyIpdTest(order) ? "Urgent" : "Routine"} />
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
    filters.status !== "All" || filters.urgency !== "All" || filters.paymentStatus !== "All"
  );

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Radiology IPD Orders"
        description="Process ward imaging orders, upload reports, and manage direct or billing-department payments."
        meta={<span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">Inpatient Imaging Queue</span>}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {stats.urgent} urgent order{stats.urgent !== 1 ? "s" : ""}
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
                options: [{ value: "", label: "All Doctors" }, ...RADIOLOGY_IPD_DOCTORS.map((d) => ({ value: d, label: d }))],
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
            onFilterChange={(key, value) => updateFilter(key as keyof RadiologyIpdOrderFilters, value as never)}
          />
        </div>

        {view === "list" ? (
          <OpsTable data={filteredOrders} rowKey={(o) => o.id} columns={columns} showColumnToggle />
        ) : (
          <OpsGrid data={filteredOrders} rowKey={(o) => o.id} renderCard={renderCard} pageSize={6} />
        )}

        <RadiologyIpdOrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateTest={updateTest}
          onCollectPayment={collectPayment}
          onSendToBillingDept={sendToBillingDept}
        />
      </main>
    </div>
  );
}


// app/(dashboard)/billing/ipd/page.tsx
"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, TrendingUp, Wallet } from "lucide-react";
import type { BillingFilters as BillingFiltersState, BillingPatient } from "@/types/billing/ipd/billing-types";
import { BILLING_PATIENTS, BILLING_WARDS, THIS_MONTH_PREFIX, TODAY_ISO } from "@/lib/billing/ipd/billing-data";
import { computeBilling, formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { BillingDetailDrawer } from "./_components/drawer/billing-detail-drawer";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import { BillingStatusBadge } from "./_components/billing-badges";

type ViewMode = "list" | "grid";
const initialFilters: BillingFiltersState = { search: "", ward: "All", status: "All" };

const previousDay = { collectedToday: 81250, collectedMonth: 1260000, due: 980000, fullyPaid: 14 };

export default function IpdBillingPage() {
  const [patients, setPatients] = useState<BillingPatient[]>(BILLING_PATIENTS);
  const [filters, setFilters] = useState<BillingFiltersState>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [viewingPatient, setViewingPatient] = useState<BillingPatient | null>(null);

  const filtered = useMemo(() => patients.filter((patient) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [patient.patientName, patient.uhid, patient.ipdId].join(" ").toLowerCase().includes(query);
    const matchesWard = filters.ward === "All" || patient.ward === filters.ward;
    const matchesStatus = filters.status === "All" || computeBilling(patient).status === filters.status;
    return matchesSearch && matchesWard && matchesStatus;
  }), [patients, filters]);

  const stats = useMemo(() => {
    let collectedToday = 0;
    let collectedThisMonth = 0;
    let totalDue = 0;
    let fullyPaidCount = 0;

    patients.forEach((patient) => {
      const computed = computeBilling(patient);
      totalDue += computed.dueAmount;
      if (computed.status === "Fully Paid") fullyPaidCount += 1;
      patient.payments.forEach((payment) => {
        if (payment.date === TODAY_ISO) collectedToday += payment.totalAmount;
        if (payment.date.startsWith(THIS_MONTH_PREFIX)) collectedThisMonth += payment.totalAmount;
      });
    });

    return { collectedToday, collectedThisMonth, totalDue, fullyPaidCount };
  }, [patients]);

  function updateFilter<K extends keyof BillingFiltersState>(key: K, value: BillingFiltersState[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function handlePatientUpdate(updated: BillingPatient) {
    setPatients((previous) => previous.map((p) => p.uhid === updated.uhid ? updated : p));
    setViewingPatient(updated);
  }

  const columns = useMemo<OpsColumn<BillingPatient>[]>(() => [
    { key: "Patient", header: "Patient", cell: (row) => <div><p className="font-semibold text-slate-800">{row.patientName}</p><p className="text-xs text-slate-400">{row.uhid}</p></div> },
    { key: "IPD ID", header: "IPD ID", cell: (row) => <span className="text-sm text-slate-600">{row.ipdId}</span> },
    { key: "Ward / Bed", header: "Ward / Bed", cell: (row) => <div className="text-sm text-slate-600">{row.ward}<p className="text-xs text-slate-400">{row.room} · {row.bed}</p></div> },
    { key: "Doctor", header: "Doctor", cell: (row) => <span className="text-sm text-slate-600">{row.admittingDoctor}</span> },
    { key: "Net Payable", header: "Net Payable", cell: (row) => <span className="text-sm font-bold text-slate-800">{formatCurrency(computeBilling(row).netPayable)}</span> },
    { key: "Collected", header: "Collected", cell: (row) => <span className="text-sm font-semibold text-emerald-600">{formatCurrency(computeBilling(row).totalCollected)}</span> },
    { key: "Due", header: "Due", cell: (row) => { const due = computeBilling(row).dueAmount; return <span className={`text-sm font-bold ${due > 0 ? "text-red-600" : "text-slate-400"}`}>{formatCurrency(due)}</span>; } },
    { key: "Status", header: "Status", cell: (row) => <BillingStatusBadge status={computeBilling(row).status} /> },
    { key: "Action", header: "Action", enableHiding: false, headerClassName: "text-right", cell: (row) => (<div className="text-right"><button type="button" onClick={() => setViewingPatient(row)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">View Details</button></div>) },
  ], []);

  const infoCards: KpiCardProps[] = [
    { label: "Collected Today", value: formatCurrency(stats.collectedToday), icon: Wallet, accent: "emerald", footer: "24 Aug 2026", trend: buildTrend(stats.collectedToday, previousDay.collectedToday, "vs yesterday") },
    { label: "Collected This Month", value: formatCurrency(stats.collectedThisMonth), icon: TrendingUp, accent: "blue", footer: "August 2026", trend: buildTrend(stats.collectedThisMonth, previousDay.collectedMonth, "vs yesterday") },
    { label: "Total Outstanding Due", value: formatCurrency(stats.totalDue), icon: AlertTriangle, accent: "rose", footer: "Across all patients", trend: buildTrend(stats.totalDue, previousDay.due, "vs yesterday") },
    { label: "Fully Paid Bills", value: String(stats.fullyPaidCount), icon: CheckCircle2, accent: "violet", footer: "Fully settled accounts", trend: buildTrend(stats.fullyPaidCount, previousDay.fullyPaid, "vs yesterday") },
  ];

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="IPD Billing"
        description="Track charges, discounts, payments, and insurance coverage for every admitted patient."
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Billing Department
          </span>
        }
      />

      <div className="flex flex-col gap-4">
        <StatsRow items={infoCards} />

        <FilterBar
          search={filters.search}
          searchPlaceholder="Patient, UHID, or IPD ID..."
          onSearch={(value) => setFilters((p) => ({ ...p, search: value }))}
          canClear={Boolean(filters.search || filters.ward !== "All" || filters.status !== "All")}
          onClear={() => setFilters(initialFilters)}
          viewSupported
          viewMode={view}
          onViewChange={(v) => setView(v as ViewMode)}
          filters={[
            { key: "ward", label: "Filter by ward", placeholder: "All Wards", selected: filters.ward, options: BILLING_WARDS.map((item) => ({ value: item, label: item })) },
            { key: "status", label: "Filter by status", placeholder: "All Statuses", selected: filters.status, options: ["Fully Paid", "Partially Paid", "Fully Due"].map((item) => ({ value: item, label: item })) },
          ]}
          onFilterChange={(key, value) => updateFilter(key as keyof BillingFiltersState, value as BillingFiltersState[keyof BillingFiltersState])}
        />

        {view === "list" ? (
          <OpsTable
            columns={columns}
            data={filtered}
            rowKey={(row) => row.uhid}
            onRowClick={setViewingPatient}
          />
        ) : (
          <OpsGrid
            data={filtered}
            rowKey={(row) => row.uhid}
            renderCard={(row) => (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="mb-1 h-1 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">{row.patientName.charAt(0)}</div>
                    <div><p className="font-bold text-slate-800">{row.patientName}</p><p className="text-xs text-slate-400">{row.uhid}</p></div>
                  </div>
                  <BillingStatusBadge status={computeBilling(row).status} />
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-700">{row.admittingDoctor}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.ward} · {row.room} · {row.bed}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-slate-100 p-2"><p className="text-[9px] uppercase text-slate-400">Net Payable</p><p className="mt-1 text-sm font-bold text-slate-800">{formatCurrency(computeBilling(row).netPayable)}</p></div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2"><p className="text-[9px] uppercase text-emerald-500">Collected</p><p className="mt-1 text-sm font-bold text-emerald-700">{formatCurrency(computeBilling(row).totalCollected)}</p></div>
                  <div className="rounded-lg border border-red-100 bg-red-50/40 p-2"><p className="text-[9px] uppercase text-red-500">Due</p><p className="mt-1 text-sm font-bold text-red-700">{formatCurrency(computeBilling(row).dueAmount)}</p></div>
                </div>
                <button type="button" onClick={() => setViewingPatient(row)} className="mt-4 w-full rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">View Details</button>
              </div>
            )}
          />
        )}

        <BillingDetailDrawer patient={viewingPatient} onClose={() => setViewingPatient(null)} onPatientUpdate={handlePatientUpdate} />
      </div>
    </div>
  );
}
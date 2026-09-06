// app/(dashboard)/billing/dashboard/page.tsx
"use client";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  HeartHandshake,
  History,
  Landmark,
  Plus,
  RotateCcw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { PageShellHeader, StatsRow } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import type {
  BillingPatient,
  DepositRecord,
  DiscountEntry,
  PaymentRecord,
  RefundRecord,
} from "@/types/billing/ipd/billing-types";
import {
  BILLING_PATIENTS,
  THIS_MONTH_PREFIX,
  TODAY_ISO,
} from "@/lib/billing/ipd/billing-data";
import {
  buildDashboardStats,
  buildHospitalAuditLog,
  computeDischargeSettlement,
  deriveApprovalRequests,
  deriveRevenueAlerts,
} from "@/lib/billing/ipd/billing-analytics";
import { computeBilling, formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { AccountStrip } from "./_components/account-strip";
import { ApprovalsModal } from "./_components/approvals-modal";
import { AuditTab } from "./_components/audit-tab";
import { ClaimsTab } from "./_components/claims-tab";
import { LedgerTab } from "./_components/ledger-tab";
import { SettlementCard } from "./_components/settlement-card";
import { TimetableOne } from "./_components/patients-timeline";
import { LeakageTab } from "./_components/leakage-tab";
import { TransactionDrawer } from "./_components/transaction-drawer";
import type { TransactionResult } from "./_components/transaction-drawer";

type DashboardTab = "ledger" | "timeline" | "payer" | "leakage" | "audit";

const TABS: { key: DashboardTab; label: string }[] = [
  { key: "ledger", label: "Billing Ledger" },
  { key: "timeline", label: "Financial Timeline" },
  { key: "payer", label: "Insurance / TPA" },
  { key: "leakage", label: "Revenue Assurance" },
  { key: "audit", label: "Audit Trail" },
];

export default function BillingDashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<BillingPatient[]>(BILLING_PATIENTS);
  const [selectedUhid, setSelectedUhid] = useState<string>(BILLING_PATIENTS[0].uhid);
  const [tab, setTab] = useState<DashboardTab>("ledger");
  const [txnOpen, setTxnOpen] = useState(false);
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [approvals, setApprovals] = useState(() => deriveApprovalRequests(BILLING_PATIENTS));

  const stats = useMemo(
    () => buildDashboardStats(patients, TODAY_ISO, THIS_MONTH_PREFIX),
    [patients],
  );
  const auditLog = useMemo(() => buildHospitalAuditLog(patients), [patients]);
  const alerts = useMemo(() => deriveRevenueAlerts(patients, TODAY_ISO), [patients]);

  const selectedPatient =
    patients.find((p) => p.uhid === selectedUhid) ?? patients[0];
  const selectedComputed = useMemo(
    () => computeBilling(selectedPatient),
    [selectedPatient],
  );
  const activeSettlement = useMemo(
    () => computeDischargeSettlement(selectedPatient),
    [selectedPatient],
  );

  const openPatient = useCallback(
    (uhid: string) => {
      router.push(`/billing/ipd/all-billings/${uhid}`);
    },
    [router],
  );

  const repairPatient = useCallback(
    (updater: (prev: BillingPatient) => BillingPatient) => {
      setPatients((prev) =>
        prev.map((p) => (p.uhid === selectedPatient.uhid ? updater(p) : p)),
      );
    },
    [selectedPatient.uhid],
  );

  function handleTransaction(result: TransactionResult) {
    repairPatient((p) => {
      if (result.kind === "Payment") {
        const payment: PaymentRecord = result.payment;
        return { ...p, payments: [...p.payments, payment] };
      }
      if (result.kind === "Deposit") {
        const deposit: DepositRecord = result.deposit;
        return { ...p, deposits: [...p.deposits, deposit] };
      }
      if (result.kind === "Refund") {
        const refund: RefundRecord = result.refund;
        return { ...p, refunds: [...p.refunds, refund] };
      }
      const discount: DiscountEntry = result.discount;
      return { ...p, discounts: [...p.discounts, discount] };
    });
    setTxnOpen(false);
  }

  function handleResolveApproval(id: string, status: "Approved" | "Rejected") {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  const kpiCards: KpiCardProps[] = [
    {
      label: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: Landmark,
      accent: "indigo",
      footer: "Charges + collections today",
      trend: { value: 1.6, label: "vs yesterday", tone: "positive" },
    },
    {
      label: "IPD Outstanding",
      value: formatCurrency(stats.ipdOutstanding),
      icon: AlertTriangle,
      accent: "rose",
      footer: `${stats.activeAccounts} active accounts`,
      onClick: () => setTab("ledger"),
    },
    {
      label: "Insurance / TPA",
      value: formatCurrency(stats.insurancePending),
      icon: HeartHandshake,
      accent: "violet",
      footer: "Pending settlement",
      onClick: () => setTab("payer"),
    },
    {
      label: "Today's Collection",
      value: formatCurrency(stats.todayCollection),
      icon: Wallet,
      accent: "emerald",
      footer: `${stats.todayTransactions} transactions`,
      trend: {
        value: stats.todayCollection > 0 ? 4.2 : 0,
        label: "vs yesterday",
        tone: stats.todayCollection > 0 ? "positive" : "neutral",
      },
    },
    {
      label: "Refund Pending",
      value: formatCurrency(stats.refundPending),
      icon: RotateCcw,
      accent: "amber",
      footer: `${stats.refundApprovals} approvals`,
    },
    {
      label: "Leakage Alerts",
      value: String(stats.leakageAlerts),
      icon: ShieldAlert,
      accent: "rose",
      footer: "Requires review",
      onClick: () => setTab("leakage"),
    },
  ];

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Billing & Revenue Management"
        description="Centralized charge capture, payer management, settlement and revenue assurance."
        meta={
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            Finance
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setApprovalsOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <ShieldAlert className="h-4 w-4" />
              Approvals
              <span className="rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {approvals.filter((a) => a.status === "Pending").length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("audit")}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <History className="h-4 w-4" /> Audit
            </button>
            <button
              type="button"
              onClick={() => setTxnOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> New Transaction
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <StatsRow items={kpiCards} />

        <AccountStrip
          patients={patients}
          selectedUhid={selectedPatient.uhid}
          onSelect={setSelectedUhid}
          onCollect={() => setTxnOpen(true)}
          onOpenPatient={() => openPatient(selectedPatient.uhid)}
        />

        <div className="overflow-x-auto border-b border-slate-200">
          <div className="flex w-max gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  tab === t.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "ledger" && <LedgerTab patients={patients} />}

        {tab === "timeline" && <TimetableOne patients={patients} selectedUhid={selectedPatient.uhid} onOpenPatient={openPatient} />}

        {tab === "payer" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {patients.map((p) => (
                <button
                  key={p.uhid}
                  type="button"
                  onClick={() => setSelectedUhid(p.uhid)}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    p.uhid === selectedPatient.uhid
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p.patientName}
                </button>
              ))}
            </div>
            <ClaimsTab patient={selectedPatient} />
          </div>
        )}

        {tab === "leakage" && (
          <LeakageTab alerts={alerts} onOpenPatient={openPatient} />
        )}

        {tab === "audit" && <AuditTab events={auditLog} />}

        <SettlementCard
          settlement={activeSettlement}
          onCollect={() => setTxnOpen(true)}
        />
      </div>

      <TransactionDrawer
        open={txnOpen}
        dueAmount={selectedComputed.dueAmount}
        onCancel={() => setTxnOpen(false)}
        onSubmit={handleTransaction}
      />

      <ApprovalsModal
        open={approvalsOpen}
        onOpenChange={setApprovalsOpen}
        requests={approvals}
        onResolve={handleResolveApproval}
      />
    </div>
  );
}
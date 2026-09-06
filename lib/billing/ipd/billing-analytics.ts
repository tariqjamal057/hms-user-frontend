// lib/billing/ipd/billing-analytics.ts
import type {
  ApprovalRequest,
  AuditEvent,
  BillingDashboardStats,
  BillingEvent,
  BillingPatient,
  CategoryLedgerRow,
  ChargeCategory,
  ClaimStage,
  ClaimStageKey,
  ClaimStageState,
  DepartmentLedgerRow,
  DischargeSettlement,
  PayerBreakdown,
  RevenueAlert,
  RevenueAlertSeverity,
  RevenueAlertType,
} from "@/types/billing/ipd/billing-types";
import { computeBilling } from "./billing-calculations";
import { displayDateToIso } from "@/lib/date-utils";

/**
 * Builds a single chronological financial timeline for a patient by merging
 * admission, charges, discounts, payments, coverage receipts, refunds and
 * deposits into a common `BillingEvent` shape. Sorted oldest-first so a
 * vertical timeline renders the admission at the top.
 */
export function buildBillingTimeline(patient: BillingPatient): BillingEvent[] {
  const events: BillingEvent[] = [];

  events.push({
    id: "admission",
    date: displayDateToIso(patient.admissionDateTime),
    dateTime: patient.admissionDateTime,
    kind: "Admission",
    title: `Admitted to ${patient.ward}`,
    detail: `${patient.room} · ${patient.bed} · attending ${patient.admittingDoctor}`,
    amount: 0,
    direction: "adjustment",
    actor: "Admissions",
  });

  patient.charges.forEach((c) => {
    events.push({
      id: `charge-${c.id}`,
      date: c.date,
      kind: "Charge",
      title: c.description,
      category: c.category,
      amount: c.amount,
      direction: "in",
      actor: c.addedBy,
    });
  });

  patient.discounts.forEach((d) => {
    events.push({
      id: `discount-${d.id}`,
      date: d.date,
      kind: "Discount",
      title: `Discount ${d.percentage}% applied`,
      detail: d.reason,
      amount: -d.amountDeducted,
      direction: "adjustment",
      actor: d.givenBy,
    });
  });

  patient.payments.forEach((p) => {
    events.push({
      id: `payment-${p.id}`,
      date: p.date,
      dateTime: p.dateTime,
      kind: "Payment",
      title: `Payment from ${p.partyName}`,
      detail: p.methods.map((m) => `${m.method} ${m.amount.toLocaleString("en-IN")}`).join(" · "),
      amount: p.totalAmount,
      direction: "in",
      actor: p.collectedBy,
      reference: p.relationToPatient,
    });
  });

  const coverage = patient.coverage;
  if (coverage && coverage.type !== "None" && coverage.receivedAmount > 0) {
    events.push({
      id: "coverage-receipt",
      date: coverage.receivedDate ? displayDateToIso(coverage.receivedDate) : "",
      dateTime: coverage.receivedDate,
      kind: "Coverage Receipt",
      title: `${coverage.type} receipt · ${coverage.schemeName}`,
      detail: `Policy ${coverage.policyOrCardNumber} · ${coverage.status}`,
      amount: coverage.receivedAmount,
      direction: "in",
      actor: coverage.schemeName,
    });
  }

  patient.refunds.forEach((r) => {
    events.push({
      id: `refund-${r.id}`,
      date: r.date,
      kind: "Refund",
      title:
        r.status === "Pending"
          ? `Refund requested — ${r.reason}`
          : `Refund to ${r.refundedTo}`,
      detail: r.reason,
      amount: -r.amount,
      direction: "out",
      actor: r.processedBy,
      reference: `${r.method} · ${r.status}`,
    });
  });

  patient.deposits.forEach((d) => {
    events.push({
      id: `deposit-${d.id}`,
      date: d.date,
      dateTime: d.dateTime,
      kind: "Deposit",
      title: `${d.source} deposit`,
      detail: `Method ${d.method}${d.reference ? ` · ${d.reference}` : ""}`,
      amount: d.amount,
      direction: "in",
      actor: d.collectedBy,
    });
  });

  return events.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.dateTime ?? "").localeCompare(b.dateTime ?? ""),
  );
}

const ALERT_ORDER: Record<RevenueAlertType, number> = {
  unpaid: 0,
  coverage: 1,
  overdue: 2,
  "high-value": 3,
};

const DAY_MS = 86_400_000;

/**
 * Derives revenue-leakage / follow-up alerts across a set of patients:
 * fully-due bills with no payment, pending insurance/TPA receipts, overdue
 * partially-paid bills, and unusually large outstanding balances.
 */
export function deriveRevenueAlerts(
  patients: BillingPatient[],
  todayIso: string,
): RevenueAlert[] {
  const alerts: RevenueAlert[] = [];

  patients.forEach((patient) => {
    const computed = computeBilling(patient);
    const coverage = patient.coverage;
    const pendingInsurance =
      coverage && coverage.type !== "None" && coverage.status !== "Fully Received"
        ? Math.max(0, coverage.approvedAmount - coverage.receivedAmount)
        : 0;

    let type: RevenueAlertType | null = null;
    let severity: RevenueAlertSeverity = "medium";
    let title = "";
    let detail = "";
    let amount = computed.dueAmount;
    let ageDays: number | undefined;

    if (
      computed.status === "Fully Due" &&
      computed.totalCollected === 0 &&
      computed.dueAmount > 0
    ) {
      type = "unpaid";
      severity = "high";
      title = "No payment received yet";
      detail = `Bill is fully due with ${formatAlertAmount(computed.dueAmount)} outstanding against IPD ${patient.ipdId}.`;
    } else if (pendingInsurance > 0 && coverage) {
      type = "coverage";
      severity = "medium";
      title = `Pending ${coverage.type} receipt`;
      detail = `${formatAlertAmount(pendingInsurance)} approved but not yet received from ${coverage.schemeName} — follow up with the insurer.`;
      amount = pendingInsurance;
    } else if (computed.status === "Partially Paid" && computed.dueAmount > 0) {
      const last = patient.payments[0];
      const lastDate = last ? displayDateToIso(last.dateTime) : todayIso;
      const days = Math.max(
        0,
        Math.round((new Date(todayIso).getTime() - new Date(lastDate).getTime()) / DAY_MS),
      );
      const highValue = computed.dueAmount >= 50000;
      if (days >= 2 || highValue) {
        type = "overdue";
        severity = highValue ? "high" : "medium";
        title = highValue ? "High-value bill outstanding" : "Payment overdue";
        detail = `${formatAlertAmount(computed.dueAmount)} still due · last payment ${last?.dateTime ?? "n/a"} (${days} day${days === 1 ? "" : "s"} ago).`;
        amount = computed.dueAmount;
        ageDays = days;
      }
    } else if (computed.dueAmount >= 50000) {
      type = "high-value";
      severity = "medium";
      title = "Large outstanding balance";
      detail = `${formatAlertAmount(computed.dueAmount)} remains due on IPD ${patient.ipdId}.`;
    }

    if (type) {
      alerts.push({
        id: `${patient.uhid}-${type}`,
        uhid: patient.uhid,
        patientName: patient.patientName,
        type,
        severity,
        title,
        detail,
        amount,
        ageDays,
      });
    }
  });

  return alerts.sort((a, b) => ALERT_ORDER[a.type] - ALERT_ORDER[b.type]);
}

/** Aggregates a patient's charges by category (department-wise ledger). */
export function categoryLedger(
  charges: { category: ChargeCategory; amount: number }[],
): CategoryLedgerRow[] {
  const map = new Map<ChargeCategory, CategoryLedgerRow>();
  charges.forEach((c) => {
    const row = map.get(c.category) ?? { category: c.category, total: 0, count: 0 };
    row.total += c.amount;
    row.count += 1;
    map.set(c.category, row);
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function formatAlertAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── Insurance / TPA claims lifecycle ─────────────────────────────────

function claimStage(
  key: ClaimStageKey,
  state: ClaimStageState,
  label: string,
  detail: string,
  value?: string,
): ClaimStage {
  return { key, state, label, detail, value };
}

/**
 * Maps a patient's coverage posture to the six-step insurance claims
 * lifecycle shown in the billing command-center reference.
 */
export function deriveClaimLifecycle(patient: BillingPatient): ClaimStage[] {
  const coverage = patient.coverage;
  const insured = Boolean(coverage && coverage.type !== "None");
  const approved = coverage?.approvedAmount ?? 0;
  const received = coverage?.receivedAmount ?? 0;
  const interimPending = insured && approved > received && received > 0;
  const fullyReceived = insured && approved > 0 && received >= approved;
  const fmt = (v: number) => formatAlertAmount(v);

  return [
    claimStage(
      "Eligibility",
      "done",
      "Eligibility",
      insured ? `${coverage!.type} verified` : "Self-pay patient",
      insured ? coverage!.schemeName : "Self Pay",
    ),
    claimStage(
      "Pre-Auth",
      insured && approved > 0 ? "done" : insured ? "current" : "upcoming",
      "Pre-Auth",
      insured
        ? approved > 0
          ? `${fmt(approved)} approved`
          : "Approval request submitted"
        : "Not applicable",
      approved > 0 ? fmt(approved) : undefined,
    ),
    claimStage(
      "Treatment",
      patient.charges.length > 0 ? "done" : "upcoming",
      "Treatment",
      "Charges captured from source departments",
      `${patient.charges.length} events`,
    ),
    claimStage(
      "Interim Claim",
      interimPending ? "current" : approved > 0 ? "done" : "upcoming",
      "Interim Claim",
      interimPending
        ? "Further insurer receipt pending"
        : approved > 0
          ? "Interim settlement posted"
          : "Not started",
      approved > 0 ? fmt(received) : undefined,
    ),
    claimStage(
      "Final Claim",
      fullyReceived || (insured && approved > 0 && !interimPending) ? "done" : "upcoming",
      "Final Claim",
      fullyReceived
        ? "Received in full"
        : approved > 0
          ? "Ready for final claim"
          : "Not started",
      approved > 0 ? fmt(approved) : undefined,
    ),
    claimStage(
      "Settlement",
      fullyReceived ? "current" : "upcoming",
      "Settlement",
      fullyReceived
        ? "Awaiting final settlement posting"
        : "Awaits full insurer receipt",
    ),
  ];
}

/** Payer mix for a single account: insurer, deposit, self-pay, payable. */
export function buildPayerBreakdown(patient: BillingPatient): PayerBreakdown {
  const computed = computeBilling(patient);
  const coverage = patient.coverage;
  const insuranceApproved =
    coverage && coverage.type !== "None" ? coverage.approvedAmount : 0;
  const insuranceReceived =
    coverage && coverage.type !== "None" ? coverage.receivedAmount : 0;
  return {
    insuranceApproved,
    insuranceReceived,
    insurancePending: Math.max(0, insuranceApproved - insuranceReceived),
    deposits: computed.totalDeposits,
    selfPaid: computed.totalCollected,
    patientPayable: computed.dueAmount,
  };
}

// ── Hospital-wide audit trail ───────────────────────────────────────

function auditSortKey(e: AuditEvent): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(e.timestamp)
    ? e.timestamp
    : displayDateToIso(e.timestamp);
}

/**
 * Aggregates every attributable financial action across all patients into a
 * single hospital-wide audit trail: payments, deposits, discounts, refunds,
 * coverage receipts and auto-posted charges.
 */
export function buildHospitalAuditLog(patients: BillingPatient[]): AuditEvent[] {
  const events: AuditEvent[] = [];

  patients.forEach((p) => {
    p.payments.forEach((pay) => {
      events.push({
        id: `audit-payment-${pay.id}`,
        timestamp: pay.dateTime,
        uhid: p.uhid,
        ipdId: p.ipdId,
        patientName: p.patientName,
        user: pay.collectedBy,
        role: "Billing Executive",
        action: "Payment Collected",
        previous: "0",
        newValue: formatAlertAmount(pay.totalAmount),
        reason: `Payment from ${pay.partyName} (${pay.relationToPatient})`,
        source: pay.methods.map((m) => m.method).join(" + "),
      });
    });

    p.deposits.forEach((d) => {
      events.push({
        id: `audit-deposit-${d.id}`,
        timestamp: d.dateTime,
        uhid: p.uhid,
        ipdId: p.ipdId,
        patientName: p.patientName,
        user: d.collectedBy,
        role: "Billing Executive",
        action: "Advance Deposit Posted",
        previous: "0",
        newValue: formatAlertAmount(d.amount),
        reason: `${d.source} deposit`,
        source: d.method,
      });
    });

    p.discounts.forEach((disc) => {
      events.push({
        id: `audit-discount-${disc.id}`,
        timestamp: disc.date,
        uhid: p.uhid,
        ipdId: p.ipdId,
        patientName: p.patientName,
        user: disc.givenBy,
        role: "Billing Manager",
        action: "Discount Approved",
        previous: "0",
        newValue: `${formatAlertAmount(disc.amountDeducted)} (${disc.percentage}%)`,
        reason: disc.reason ?? "Discretionary adjustment",
        source: "IPD Billing",
      });
    });

    p.refunds.forEach((r) => {
      events.push({
        id: `audit-refund-${r.id}`,
        timestamp: r.date,
        uhid: p.uhid,
        ipdId: p.ipdId,
        patientName: p.patientName,
        user: r.processedBy,
        role: "Billing Executive",
        action: r.status === "Processed" ? "Refund Processed" : "Refund Requested",
        previous: "0",
        newValue: formatAlertAmount(r.amount),
        reason: r.reason,
        source: r.method,
      });
    });

    const coverage = p.coverage;
    if (coverage && coverage.type !== "None") {
      events.push({
        id: `audit-coverage-${p.uhid}`,
        timestamp: coverage.receivedDate ?? p.admissionDateTime,
        uhid: p.uhid,
        ipdId: p.ipdId,
        patientName: p.patientName,
        user: "TPA Portal",
        role: "TPA Executive",
        action: "Pre-Auth / Receipt Updated",
        previous: "0",
        newValue: `Approved ${formatAlertAmount(coverage.approvedAmount)} · Received ${formatAlertAmount(coverage.receivedAmount)}`,
        reason: `${coverage.schemeName} · ${coverage.policyOrCardNumber}`,
        source: coverage.type,
      });
    }

    p.charges
      .filter((c) => c.addedBy === "System")
      .forEach((c) => {
        events.push({
          id: `audit-charge-${c.id}`,
          timestamp: c.date,
          uhid: p.uhid,
          ipdId: p.ipdId,
          patientName: p.patientName,
          user: "System",
          role: "Charge Engine",
          action: "Charge Auto-Posted",
          previous: "—",
          newValue: formatAlertAmount(c.amount),
          reason: c.description,
          source: c.category,
        });
      });
  });

  return events.sort((a, b) => auditSortKey(b).localeCompare(auditSortKey(a)));
}

// ── Discharge settlement ────────────────────────────────────────────

/**
 * Final financial reconciliation for an account before closure: gross bill,
 * discounts, coverage, deposits, self payments and the residual payable.
 */
export function computeDischargeSettlement(patient: BillingPatient): DischargeSettlement {
  const computed = computeBilling(patient);
  const coverage = patient.coverage;
  const insured = Boolean(coverage && coverage.type !== "None");
  const insuranceApproved = insured ? coverage!.approvedAmount : 0;
  const insurancePending = insured ? Math.max(0, coverage!.approvedAmount - coverage!.receivedAmount) : 0;

  const afterCoverage = Math.max(0, computed.netPayable - computed.coverageReceived);
  const selfCollected = computed.totalCollected;
  const patientPayable = Math.max(0, afterCoverage - selfCollected);

  const checklist = [
    { label: "All clinical charges captured", done: computed.grossTotal > 0 },
    {
      label: "Pharmacy / lab returns reconciled",
      done: computed.excludedPharmacyLab === 0 || patient.universalPaymentEnabled,
    },
    { label: "Insurance documents complete", done: !insured || coverage!.approvedAmount > 0 },
    { label: "Final payer approval received", done: !insured || insurancePending === 0 },
    { label: "Patient balance collected", done: patientPayable === 0 },
  ];

  return {
    uhid: patient.uhid,
    ipdId: patient.ipdId,
    patientName: patient.patientName,
    grossBill: computed.grossTotal,
    packageDiscount: computed.totalDiscount,
    insuranceApproved,
    insurancePending,
    deposits: computed.totalDeposits,
    selfCollected,
    patientPayable,
    refundDue: computed.pendingRefund,
    ready: checklist.filter((c) => c.done).length >= 4,
    checklist,
  };
}

// ── Approval workflows ──────────────────────────────────────────────

const DISCOUNT_APPROVAL_THRESHOLD = 1000;

/**
 * Collects items that need sign-off before being finalized: pending refunds
 * and high-value discounts (configurable, default ≥ ₹1,000).
 */
export function deriveApprovalRequests(patients: BillingPatient[]): ApprovalRequest[] {
  const requests: ApprovalRequest[] = [];

  patients.forEach((p) => {
    p.refunds
      .filter((r) => r.status === "Pending")
      .forEach((r) => {
        requests.push({
          id: `approval-refund-${r.id}`,
          kind: "Refund",
          status: "Pending",
          uhid: p.uhid,
          ipdId: p.ipdId,
          patientName: p.patientName,
          amount: r.amount,
          requestedBy: r.processedBy,
          date: r.date,
          reason: r.reason,
        });
      });

    p.discounts
      .filter((d) => d.amountDeducted >= DISCOUNT_APPROVAL_THRESHOLD)
      .forEach((d) => {
        requests.push({
          id: `approval-discount-${d.id}`,
          kind: "Discount",
          status: "Pending",
          uhid: p.uhid,
          ipdId: p.ipdId,
          patientName: p.patientName,
          amount: d.amountDeducted,
          requestedBy: d.givenBy,
          date: d.date,
          reason: d.reason ?? "Discretionary discount",
        });
      });
  });

  return requests.sort((a, b) => a.date.localeCompare(b.date));
}

// ── Department ledger ───────────────────────────────────────────────

const DEPT_BY_CATEGORY: Record<ChargeCategory, string> = {
  "Doctor Fee": "Doctor",
  "Nurse Fee": "Nursing",
  "Bed Fee": "Room",
  Diagnostic: "Laboratory",
  Pharmacy: "Pharmacy",
  Procedure: "Doctor",
  Other: "Other",
};

function payerLabel(p: BillingPatient): string {
  const coverage = p.coverage;
  if (!coverage || coverage.type === "None") return "Self Pay";
  return coverage.type === "Ayushman Bharat" ? "AB-PMJAY" : "Insurance / TPA";
}

/** Flattens every charge and deposit across patients into one ledger. */
export function buildDepartmentLedger(patients: BillingPatient[]): DepartmentLedgerRow[] {
  const rows: DepartmentLedgerRow[] = [];

  patients.forEach((p) => {
    const computed = computeBilling(p);
    const payer = payerLabel(p);
    const billingStatus = computed.status === "Fully Paid" ? "Paid" : computed.dueAmount > 0 ? "Due" : "Posted";

    p.charges.forEach((c) => {
      const status =
        billingStatus === "Paid"
          ? c.category === "Pharmacy"
            ? "Dispensed"
            : c.category === "Diagnostic"
              ? "Result Ready"
              : "Posted"
          : billingStatus;
      rows.push({
        id: `ledger-${c.id}`,
        date: c.date,
        dept: DEPT_BY_CATEGORY[c.category],
        service: c.description,
        orderedBy: c.addedBy === "System" ? "Billing Engine" : c.addedBy,
        qty: 1,
        rate: c.amount,
        discount: 0,
        tax: 0,
        net: c.amount,
        payer,
        status,
        uhid: p.uhid,
        ipdId: p.ipdId,
        patientName: p.patientName,
      });
    });

    p.deposits.forEach((d) => {
      rows.push({
        id: `ledger-dep-${d.id}`,
        date: d.date,
        dept: "Other",
        service: "Advance Deposit",
        orderedBy: d.collectedBy,
        qty: 1,
        rate: d.amount,
        discount: 0,
        tax: 0,
        net: d.amount,
        payer: "Self Pay",
        status: "Paid",
        uhid: p.uhid,
        ipdId: p.ipdId,
        patientName: p.patientName,
      });
    });
  });

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Dashboard aggregates ────────────────────────────────────────────

/** One-pass aggregation used by the billing dashboard KPI row. */
export function buildDashboardStats(
  patients: BillingPatient[],
  todayIso: string,
  monthPrefix: string,
): BillingDashboardStats {
  let todayRevenue = 0;
  let ipdOutstanding = 0;
  let insurancePending = 0;
  let todayCollection = 0;
  let todayTransactions = 0;
  let refundPending = 0;
  let refundApprovals = 0;
  let fullyPaidCount = 0;

  patients.forEach((p) => {
    const computed = computeBilling(p);
    ipdOutstanding += computed.dueAmount;
    if (computed.status === "Fully Paid") fullyPaidCount += 1;

    const coverage = p.coverage;
    if (coverage && coverage.type !== "None") {
      insurancePending += Math.max(0, coverage.approvedAmount - coverage.receivedAmount);
    }

    p.charges.forEach((c) => {
      if (c.date === todayIso) todayRevenue += c.amount;
    });

    p.payments.forEach((pay) => {
      if (pay.date === todayIso) {
        todayCollection += pay.totalAmount;
        todayTransactions += 1;
      }
      if (pay.date.startsWith(monthPrefix)) todayRevenue += pay.totalAmount;
    });

    p.deposits.forEach((d) => {
      if (d.date === todayIso) {
        todayCollection += d.amount;
        todayTransactions += 1;
      }
    });

    p.refunds.forEach((r) => {
      if (r.status === "Pending") {
        refundPending += r.amount;
        refundApprovals += 1;
      }
    });
  });

  return {
    todayRevenue,
    ipdOutstanding,
    activeAccounts: patients.length,
    insurancePending,
    todayCollection,
    todayTransactions,
    refundPending,
    refundApprovals,
    leakageAlerts: deriveRevenueAlerts(patients, todayIso).length,
    fullyPaidCount,
  };
}
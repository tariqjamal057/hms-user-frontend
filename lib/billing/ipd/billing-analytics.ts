// lib/billing/ipd/billing-analytics.ts
import type {
  BillingEvent,
  BillingPatient,
  CategoryLedgerRow,
  ChargeCategory,
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
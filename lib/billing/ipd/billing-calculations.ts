// lib/billing/ipd/billing-calculations.ts
import type { BillingComputed, BillingPatient, BillingStatus } from "@/types/billing/ipd/billing-types";

export function computeBilling(patient: BillingPatient): BillingComputed {
  const pharmacyLabCharges = patient.charges.filter((c) => c.category === "Pharmacy" || c.category === "Diagnostic");
  const otherCharges = patient.charges.filter((c) => c.category !== "Pharmacy" && c.category !== "Diagnostic");

  const otherTotal = otherCharges.reduce((sum, c) => sum + c.amount, 0);
  const pharmacyLabTotal = pharmacyLabCharges.reduce((sum, c) => sum + c.amount, 0);

  const grossTotal = patient.universalPaymentEnabled ? otherTotal + pharmacyLabTotal : otherTotal;
  const excludedPharmacyLab = patient.universalPaymentEnabled ? 0 : pharmacyLabTotal;

  const totalDiscount = patient.discounts.reduce((sum, d) => sum + d.amountDeducted, 0);
  const netPayable = Math.max(0, grossTotal - totalDiscount);

  const coverageReceived = patient.coverage ? patient.coverage.receivedAmount : 0;
  const patientResponsibility = Math.max(0, netPayable - coverageReceived);

  const processedRefunds = (patient.refunds ?? []).filter((r) => r.status === "Processed");
  const totalRefunded = processedRefunds.reduce((sum, r) => sum + r.amount, 0);
  const pendingRefund = (patient.refunds ?? [])
    .filter((r) => r.status === "Pending")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalDeposits = (patient.deposits ?? []).reduce((sum, d) => sum + d.amount, 0);

  const totalCollected = Math.max(
    0,
    patient.payments.reduce((sum, p) => sum + p.totalAmount, 0) - totalRefunded,
  );
  const dueAmount = Math.max(0, patientResponsibility - totalCollected);

  let status: BillingStatus = "Fully Due";
  if (dueAmount <= 0 && patientResponsibility > 0) status = "Fully Paid";
  else if (dueAmount <= 0 && patientResponsibility === 0) status = "Fully Paid";
  else if (totalCollected > 0 && dueAmount > 0) status = "Partially Paid";
  else status = "Fully Due";

  return { grossTotal, excludedPharmacyLab, totalDiscount, netPayable, coverageReceived, patientResponsibility, totalCollected, totalRefunded, pendingRefund, totalDeposits, dueAmount, status };
}

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
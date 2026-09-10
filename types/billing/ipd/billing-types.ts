// types/billing/ipd/billing-types.ts

export type BillingStatus = "Fully Paid" | "Partially Paid" | "Fully Due";
export type ChargeCategory = "Doctor Fee" | "Nurse Fee" | "Bed Fee" | "Diagnostic" | "Pharmacy" | "Procedure" | "Other" | "Ambulance" | "OT Charges" | "Consumables" | "Miscellaneous";
export type PaymentMethod = "Cash" | "Card" | "UPI" | "Net Banking";
export type CoverageType = "Ayushman Bharat" | "Insurance" | "None";
export type CoverageStatus = "Approved" | "Partially Received" | "Fully Received" | "Pending" | "Rejected";

export interface DailyCharge {
  id: string;
  date: string;
  category: ChargeCategory;
  description: string;
  amount: number;
  addedBy: string;
}

export interface DiscountEntry {
  id: string;
  date: string;
  percentage: number;
  amountDeducted: number;
  givenBy: string;
  reason?: string;
}

export interface PaymentMethodSplit {
  method: PaymentMethod;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  dateTime: string;
  partyName: string;
  relationToPatient: string;
  totalAmount: number;
  methods: PaymentMethodSplit[];
  collectedBy: string;
}

export interface CoverageDetails {
  type: CoverageType;
  schemeName: string;
  policyOrCardNumber: string;
  approvedAmount: number;
  receivedAmount: number;
  receivedDate?: string;
  status: CoverageStatus;
}

export interface BillingPatient {
  uhid: string;
  ipdId: string;
  patientName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  ward: string;
  room: string;
  bed: string;
  admittingDoctor: string;
  admissionDateTime: string;
  contactNumber: string;
  guardianName?: string;
  universalPaymentEnabled: boolean;
  charges: DailyCharge[];
  discounts: DiscountEntry[];
  payments: PaymentRecord[];
  coverage?: CoverageDetails;
  refunds: RefundRecord[];
  deposits: DepositRecord[];
}

export interface BillingFilters {
  search: string;
  ward: "All" | string;
  status: "All" | BillingStatus;
}

export interface BillingComputed {
  grossTotal: number;
  excludedPharmacyLab: number;
  totalDiscount: number;
  netPayable: number;
  coverageReceived: number;
  patientResponsibility: number;
  totalCollected: number;
  totalRefunded: number;
  pendingRefund: number;
  totalDeposits: number;
  dueAmount: number;
  status: BillingStatus;
}

export type BillingEventKind =
  | "Admission"
  | "Charge"
  | "Discount"
  | "Payment"
  | "Coverage Receipt"
  | "Refund"
  | "Deposit";

export type BillingEventDirection = "in" | "out" | "adjustment";

export interface BillingEvent {
  id: string;
  date: string; // ISO yyyy-mm-dd
  dateTime?: string; // display string, e.g. "20 Aug 2026, 11:30 AM"
  kind: BillingEventKind;
  title: string;
  detail?: string;
  category?: ChargeCategory;
  amount: number; // signed: positive receivables, negative refunds/discounts
  direction: BillingEventDirection;
  actor: string;
  reference?: string;
}

export interface RefundRecord {
  id: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  reason: string;
  method: PaymentMethod;
  status: "Processed" | "Pending";
  refundedTo: string;
  processedBy: string;
}

export interface DepositRecord {
  id: string;
  date: string; // ISO yyyy-mm-dd
  dateTime: string;
  amount: number;
  method: PaymentMethod;
  source: "Advance" | "Security" | "Other";
  collectedBy: string;
  reference?: string;
}

export type RevenueAlertType = "unpaid" | "overdue" | "coverage" | "high-value";
export type RevenueAlertSeverity = "high" | "medium" | "low";

export interface RevenueAlert {
  id: string;
  uhid: string;
  patientName: string;
  type: RevenueAlertType;
  severity: RevenueAlertSeverity;
  title: string;
  detail: string;
  amount: number;
  ageDays?: number;
}

export interface CategoryLedgerRow {
  category: ChargeCategory;
  total: number;
  count: number;
}

// ── Insurance / TPA claims lifecycle ────────────────────────────────

export type ClaimStageKey =
  | "Eligibility"
  | "Pre-Auth"
  | "Treatment"
  | "Interim Claim"
  | "Final Claim"
  | "Settlement";

export type ClaimStageState = "done" | "current" | "upcoming";

export interface ClaimStage {
  key: ClaimStageKey;
  state: ClaimStageState;
  label: string;
  detail?: string;
  value?: string;
}

export interface PayerBreakdown {
  insuranceApproved: number;
  insuranceReceived: number;
  insurancePending: number;
  deposits: number;
  selfPaid: number;
  patientPayable: number;
}

// ── Hospital-wide audit trail ───────────────────────────────────────

export interface AuditEvent {
  id: string;
  timestamp: string;
  uhid: string;
  ipdId: string;
  patientName: string;
  user: string;
  role: string;
  action: string;
  previous: string;
  newValue: string;
  reason: string;
  source: string;
}

// ── Discharge settlement ────────────────────────────────────────────

export interface SettlementChecklistItem {
  label: string;
  done: boolean;
}

export interface DischargeSettlement {
  uhid: string;
  ipdId: string;
  patientName: string;
  grossBill: number;
  packageDiscount: number;
  insuranceApproved: number;
  insurancePending: number;
  deposits: number;
  selfCollected: number;
  patientPayable: number;
  refundDue: number;
  ready: boolean;
  checklist: SettlementChecklistItem[];
}

// ── Approval workflows ──────────────────────────────────────────────

export type ApprovalKind = "Refund" | "Discount" | "Write-Off";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface ApprovalRequest {
  id: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  uhid: string;
  ipdId: string;
  patientName: string;
  amount: number;
  requestedBy: string;
  date: string;
  reason: string;
}

// ── Department ledger (cross-patient) ───────────────────────────────

export interface DepartmentLedgerRow {
  id: string;
  date: string;
  dept: string;
  service: string;
  orderedBy: string;
  qty: number;
  rate: number;
  discount: number;
  tax: number;
  net: number;
  payer: string;
  status: string;
  uhid: string;
  ipdId: string;
  patientName: string;
}

// ── Dashboard aggregates ────────────────────────────────────────────

export interface BillingDashboardStats {
  todayRevenue: number;
  ipdOutstanding: number;
  activeAccounts: number;
  insurancePending: number;
  todayCollection: number;
  todayTransactions: number;
  refundPending: number;
  refundApprovals: number;
  leakageAlerts: number;
  fullyPaidCount: number;
}
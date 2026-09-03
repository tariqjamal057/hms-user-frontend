// sample-data/billing.ts
// Sample billing records for the Billing role.

export interface SampleCharge {
  id: string;
  description: string;
  category: "Bed" | "Doctor" | "Pharmacy" | "Diagnostics" | "Consumables" | "OT";
  amount: number;
  date: string;
}

export interface SampleBill {
  billId: string;
  uhid: string;
  patientName: string;
  department: string;
  totalAmount: number;
  discount: number;
  insuranceCovered: number;
  dueAmount: number;
  status: "Paid" | "Partial" | "Deposit Pending" | "Unbilled";
  paymentMethods: string[];
  charges: SampleCharge[];
}

export const SAMPLE_BILLS: SampleBill[] = [
  {
    billId: "BILL-2026-008921",
    uhid: "UHID-2026-000982",
    patientName: "Ravi Sharma",
    department: "General Medicine",
    totalAmount: 18500,
    discount: 0,
    insuranceCovered: 0,
    dueAmount: 7500,
    status: "Deposit Pending",
    paymentMethods: ["Cash", "UPI"],
    charges: [
      { id: "c1", description: "General ward bed (G-14) - 3 days", category: "Bed", amount: 6000, date: "22 Aug 2026" },
      { id: "c2", description: "Consultant visit - Dr. Soumitra Das", category: "Doctor", amount: 4500, date: "22 Aug 2026" },
      { id: "c3", description: "Medicines & injections", category: "Pharmacy", amount: 5000, date: "22 Aug 2026" },
      { id: "c4", description: "CBC + Lipid profile", category: "Diagnostics", amount: 3000, date: "22 Aug 2026" },
    ],
  },
  {
    billId: "BILL-2026-00061",
    uhid: "UHID-2026-001260",
    patientName: "Debasish Roy",
    department: "ICU",
    totalAmount: 35900,
    discount: 0,
    insuranceCovered: 12000,
    dueAmount: 12000,
    status: "Deposit Pending",
    paymentMethods: ["Insurance"],
    charges: [
      { id: "c1", description: "ICU bed (ICU-06)", category: "Bed", amount: 12000, date: "22 Aug 2026" },
      { id: "c2", description: "Ventilator support", category: "Consumables", amount: 9000, date: "22 Aug 2026" },
      { id: "c3", description: "Critical care doctor", category: "Doctor", amount: 8000, date: "22 Aug 2026" },
      { id: "c4", description: "Medicines & IV fluids", category: "Pharmacy", amount: 5000, date: "22 Aug 2026" },
      { id: "c5", description: "Emergency lab panel", category: "Diagnostics", amount: 1900, date: "22 Aug 2026" },
    ],
  },
];

export function getSampleBill(uhid: string): SampleBill | undefined {
  return SAMPLE_BILLS.find((b) => b.uhid === uhid);
}

// lib/billing/ipd/billing-data.ts
import type { BillingPatient } from "@/types/billing/ipd/billing-types";

export const BILLING_PATIENTS: BillingPatient[] = [
  {
    uhid: "UHID12345685", ipdId: "IPD240520-0001", patientName: "Ravi Sharma", age: 48, gender: "Male",
    ward: "Semi Private", room: "Room-2", bed: "B-203", admittingDoctor: "Dr. Amit Verma",
    admissionDateTime: "20 Aug 2026, 11:30 AM", contactNumber: "+91 98765 43210", guardianName: "Sunita Sharma (Wife)",
    universalPaymentEnabled: true,
    charges: [
      { id: "C1", date: "2026-08-20", category: "Bed Fee", description: "Semi Private Room - Day 1", amount: 3500, addedBy: "System" },
      { id: "C2", date: "2026-08-20", category: "Doctor Fee", description: "Admission Consultation - Dr. Amit Verma", amount: 1500, addedBy: "System" },
      { id: "C3", date: "2026-08-21", category: "Bed Fee", description: "Semi Private Room - Day 2", amount: 3500, addedBy: "System" },
      { id: "C4", date: "2026-08-21", category: "Nurse Fee", description: "Nursing Care Charges - Day 2", amount: 800, addedBy: "System" },
      { id: "C5", date: "2026-08-21", category: "Diagnostic", description: "ECG + Troponin Panel", amount: 2200, addedBy: "Lab Dept" },
      { id: "C6", date: "2026-08-22", category: "Bed Fee", description: "Semi Private Room - Day 3", amount: 3500, addedBy: "System" },
      { id: "C7", date: "2026-08-22", category: "Pharmacy", description: "Aspirin, Metoprolol, Atorvastatin (3 days)", amount: 1450, addedBy: "Pharmacy Dept" },
      { id: "C8", date: "2026-08-23", category: "Bed Fee", description: "Semi Private Room - Day 4", amount: 3500, addedBy: "System" },
      { id: "C9", date: "2026-08-23", category: "Doctor Fee", description: "Cardiology Review - Dr. Amit Verma", amount: 1200, addedBy: "System" },
      { id: "C10", date: "2026-08-24", category: "Bed Fee", description: "Semi Private Room - Day 5", amount: 3500, addedBy: "System" },
      { id: "C11", date: "2026-08-24", category: "Pharmacy", description: "Clopidogrel, Metoprolol (1 day)", amount: 620, addedBy: "Pharmacy Dept" },
    ],
    discounts: [
      { id: "D1", date: "2026-08-22", percentage: 5, amountDeducted: 1240, givenBy: "Billing Manager - Ritu Kapoor", reason: "Corporate insurance tie-up discount" },
    ],
    payments: [
      { id: "P1", date: "2026-08-20", dateTime: "20 Aug 2026, 12:15 PM", partyName: "Sunita Sharma", relationToPatient: "Wife", totalAmount: 5000, methods: [{ method: "Cash", amount: 2000 }, { method: "Card", amount: 3000 }], collectedBy: "Front Desk - Priya" },
      { id: "P2", date: "2026-08-24", dateTime: "24 Aug 2026, 09:30 AM", partyName: "Suresh Sharma", relationToPatient: "Brother", totalAmount: 20000, methods: [{ method: "Cash", amount: 10000 }, { method: "Card", amount: 10000 }], collectedBy: "Billing - Ritu Kapoor" },
    ],
    coverage: { type: "Insurance", schemeName: "Star Health Comprehensive", policyOrCardNumber: "SH-88221134", approvedAmount: 12000, receivedAmount: 8000, receivedDate: "23 Aug 2026", status: "Partially Received" },
    refunds: [
      { id: "RF1", date: "2026-08-24", amount: 400, reason: "Pharmacy co-pay reversal (universal billing)", method: "Card", status: "Processed", refundedTo: "Sunita Sharma", processedBy: "Billing - Ritu Kapoor" },
      { id: "RF2", date: "2026-08-24", amount: 250, reason: "Bed tariff adjustment — insurance dispute under review", method: "UPI", status: "Pending", refundedTo: "Sunita Sharma", processedBy: "Billing - Ritu Kapoor" },
    ],
    deposits: [],
  },
  {
    uhid: "UHID12345683", ipdId: "IPD240520-0003", patientName: "Suresh Yadav", age: 55, gender: "Male",
    ward: "ICU", room: "Bay-1", bed: "ICU-03", admittingDoctor: "Dr. Rahul Mehta",
    admissionDateTime: "20 Aug 2026, 08:50 AM", contactNumber: "+91 99887 76655", guardianName: "Manoj Yadav (Son)",
    universalPaymentEnabled: false,
    charges: [
      { id: "C12", date: "2026-08-20", category: "Bed Fee", description: "ICU Bed - Day 1", amount: 9000, addedBy: "System" },
      { id: "C13", date: "2026-08-20", category: "Doctor Fee", description: "Emergency + ICU Admission - Dr. Rahul Mehta", amount: 2500, addedBy: "System" },
      { id: "C14", date: "2026-08-21", category: "Bed Fee", description: "ICU Bed - Day 2", amount: 9000, addedBy: "System" },
      { id: "C15", date: "2026-08-21", category: "Procedure", description: "Central Line Insertion", amount: 4500, addedBy: "System" },
      { id: "C16", date: "2026-08-22", category: "Bed Fee", description: "ICU Bed - Day 3", amount: 9000, addedBy: "System" },
      { id: "C17", date: "2026-08-22", category: "Nurse Fee", description: "1:1 ICU Nursing Care - Day 3", amount: 2000, addedBy: "System" },
      { id: "C18", date: "2026-08-23", category: "Bed Fee", description: "ICU Bed - Day 4", amount: 9000, addedBy: "System" },
      { id: "C19", date: "2026-08-24", category: "Bed Fee", description: "ICU Bed - Day 5", amount: 9000, addedBy: "System" },
      { id: "C20", date: "2026-08-24", category: "Diagnostic", description: "Blood Culture, CBC, CRP Panel", amount: 3800, addedBy: "Lab Dept" },
      { id: "C21", date: "2026-08-24", category: "Pharmacy", description: "IV Antibiotics + Vasopressor Support", amount: 6200, addedBy: "Pharmacy Dept" },
    ],
    discounts: [],
    payments: [
      { id: "P3", date: "2026-08-21", dateTime: "21 Aug 2026, 05:00 PM", partyName: "Manoj Yadav", relationToPatient: "Son", totalAmount: 15000, methods: [{ method: "Cash", amount: 15000 }], collectedBy: "Front Desk - Priya" },
    ],
    coverage: { type: "Ayushman Bharat", schemeName: "PM-JAY", policyOrCardNumber: "PMJAY-77229981", approvedAmount: 20000, receivedAmount: 20000, receivedDate: "22 Aug 2026", status: "Fully Received" },
    refunds: [],
    deposits: [
      { id: "DP1", date: "2026-08-20", dateTime: "20 Aug 2026, 09:10 AM", amount: 10000, method: "Cash", source: "Advance", collectedBy: "Front Desk - Priya", reference: "Advance against final bill" },
    ],
  },
  {
    uhid: "UHID12345684", ipdId: "IPD240520-0002", patientName: "Neha Singh", age: 36, gender: "Female",
    ward: "General Ward", room: "Room-5", bed: "G-108", admittingDoctor: "Dr. Priya Nair",
    admissionDateTime: "20 Aug 2026, 09:45 AM", contactNumber: "+91 91234 56789",
    universalPaymentEnabled: true,
    charges: [
      { id: "C22", date: "2026-08-20", category: "Bed Fee", description: "General Ward Bed - Day 1", amount: 1200, addedBy: "System" },
      { id: "C23", date: "2026-08-20", category: "Doctor Fee", description: "Admission Consultation - Dr. Priya Nair", amount: 900, addedBy: "System" },
      { id: "C24", date: "2026-08-21", category: "Bed Fee", description: "General Ward Bed - Day 2", amount: 1200, addedBy: "System" },
      { id: "C25", date: "2026-08-21", category: "Diagnostic", description: "Dengue NS1 + CBC", amount: 1100, addedBy: "Lab Dept" },
      { id: "C26", date: "2026-08-24", category: "Pharmacy", description: "Paracetamol + ORS (4 days)", amount: 480, addedBy: "Pharmacy Dept" },
    ],
    discounts: [],
    payments: [],
    coverage: { type: "None", schemeName: "", policyOrCardNumber: "", approvedAmount: 0, receivedAmount: 0, status: "Pending" },
    refunds: [],
    deposits: [],
  },
  {
    uhid: "UHID12345670", ipdId: "IPD240815-0090", patientName: "Meena Kapoor", age: 52, gender: "Female",
    ward: "Semi Private", room: "Room-1", bed: "B-201", admittingDoctor: "Dr. Priya Nair",
    admissionDateTime: "15 Aug 2026, 10:00 AM", contactNumber: "+91 90000 11122",
    universalPaymentEnabled: true,
    charges: [
      { id: "C27", date: "2026-08-15", category: "Bed Fee", description: "Semi Private Room - Day 1", amount: 3500, addedBy: "System" },
      { id: "C28", date: "2026-08-15", category: "Doctor Fee", description: "Admission Consultation", amount: 1500, addedBy: "System" },
      { id: "C29", date: "2026-08-16", category: "Bed Fee", description: "Semi Private Room - Day 2", amount: 3500, addedBy: "System" },
      { id: "C30", date: "2026-08-17", category: "Diagnostic", description: "Chest X-Ray + CBC", amount: 1800, addedBy: "Lab Dept" },
      { id: "C31", date: "2026-08-18", category: "Pharmacy", description: "IV Antibiotics course", amount: 3200, addedBy: "Pharmacy Dept" },
      { id: "C32", date: "2026-08-22", category: "Bed Fee", description: "Semi Private Room - Day 7", amount: 3500, addedBy: "System" },
    ],
    discounts: [
      { id: "D2", date: "2026-08-23", percentage: 10, amountDeducted: 1700, givenBy: "Billing Manager - Ritu Kapoor", reason: "Senior citizen discount" },
    ],
    payments: [
      { id: "P4", date: "2026-08-16", dateTime: "16 Aug 2026, 11:00 AM", partyName: "Meena Kapoor", relationToPatient: "Self", totalAmount: 8000, methods: [{ method: "UPI", amount: 8000 }], collectedBy: "Front Desk - Priya" },
      { id: "P5", date: "2026-08-23", dateTime: "23 Aug 2026, 11:00 AM", partyName: "Rajesh Kapoor", relationToPatient: "Son", totalAmount: 7300, methods: [{ method: "Cash", amount: 3300 }, { method: "Net Banking", amount: 4000 }], collectedBy: "Billing - Ritu Kapoor" },
    ],
    coverage: { type: "None", schemeName: "", policyOrCardNumber: "", approvedAmount: 0, receivedAmount: 0, status: "Pending" },
    refunds: [],
    deposits: [],
  },
];

export function getBillingPatientByUhid(uhid: string) {
  return BILLING_PATIENTS.find((p) => p.uhid === uhid);
}
export const BILLING_WARDS = Array.from(new Set(BILLING_PATIENTS.map((p) => p.ward)));
export const TODAY_ISO = "2026-08-24";
export const THIS_MONTH_PREFIX = "2026-08";

function patientHaystack(p: BillingPatient): string {
  const coverage = p.coverage;
  return [
    p.patientName,
    p.uhid,
    p.ipdId,
    p.contactNumber,
    p.admittingDoctor,
    p.ward,
    p.room,
    p.bed,
    p.guardianName ?? "",
    coverage && coverage.type !== "None" ? coverage.policyOrCardNumber : "",
    coverage ? coverage.schemeName : "",
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * True when a patient matches a free-text search term across name, UHID,
 * mobile, IPD ID, doctor, ward/bed, guardian and insurance identifiers.
 * Multi-word queries require every word to match somewhere.
 */
export function matchesBillingPatientQuery(patient: BillingPatient, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = patientHaystack(patient);
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

/** Global patient lookup used by the command-center header search. */
export function searchBillingPatients(query: string, limit = 8) {
  const q = query.trim();
  if (q.length < 2) return [];
  return BILLING_PATIENTS.filter((p) => matchesBillingPatientQuery(p, q)).slice(0, limit);
}
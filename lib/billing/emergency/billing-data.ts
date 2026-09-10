// lib/billing/emergency/billing-data.ts
import type { BillingPatient } from "@/types/billing/ipd/billing-types";

export const BILLING_PATIENTS: BillingPatient[] = [
  {
    uhid: "UHID12345685", ipdId: "ER240824-0001", patientName: "Ravi Sharma", age: 48, gender: "Male",
    ward: "ER-Bay-2", room: "Bay-2", bed: "ER-Bay-2",
    admittingDoctor: "Dr. Amit Verma",
    admissionDateTime: "27 Aug 2026, 09:30 AM", contactNumber: "+91 98765 43210", guardianName: "Sunita Sharma (Wife)",
    universalPaymentEnabled: true,
    charges: [
      { id: "EC1", date: "2026-08-27", category: "Bed Fee", description: "ER Bay Observation - 6 hours", amount: 2200, addedBy: "System" },
      { id: "EC2", date: "2026-08-27", category: "Doctor Fee", description: "Emergency Consultation - Dr. Amit Verma", amount: 1800, addedBy: "System" },
      { id: "EC3", date: "2026-08-27", category: "Diagnostic", description: "ECG + Troponin I (Stat)", amount: 1850, addedBy: "Lab Dept" },
      { id: "EC4", date: "2026-08-27", category: "Procedure", description: "IV Cannulation + Oxygen Support", amount: 950, addedBy: "System" },
      { id: "EC5", date: "2026-08-27", category: "Pharmacy", description: "Aspirin, Metoprolol (Emergency dose)", amount: 320, addedBy: "Pharmacy Dept" },
      { id: "EC6", date: "2026-08-27", category: "Ambulance", description: "Emergency transport - City Ambulance Service", amount: 1500, addedBy: "System" },
    ],
    discounts: [
      { id: "ED1", date: "2026-08-27", percentage: 5, amountDeducted: 431, givenBy: "Billing Manager - Ritu Kapoor", reason: "Corporate insurance tie-up discount" },
    ],
    payments: [
      { id: "EP1", date: "2026-08-27", dateTime: "27 Aug 2026, 10:15 AM", partyName: "Sunita Sharma", relationToPatient: "Wife", totalAmount: 5000, methods: [{ method: "Cash", amount: 2000 }, { method: "Card", amount: 3000 }], collectedBy: "ER Front Desk - Priya" },
    ],
    coverage: { type: "Insurance", schemeName: "Star Health Comprehensive", policyOrCardNumber: "SH-88221134", approvedAmount: 6000, receivedAmount: 3000, receivedDate: "27 Aug 2026", status: "Partially Received" },
    refunds: [],
    deposits: [],
  },
  {
    uhid: "UHID12398211", ipdId: "ER240824-0002", patientName: "Unknown Male (RTA)", age: 30, gender: "Male",
    ward: "ER-Bay-1 (Trauma)", room: "Bay-1", bed: "ER-Bay-1",
    admittingDoctor: "Dr. Rahul Mehta",
    admissionDateTime: "27 Aug 2026, 08:10 AM", contactNumber: "Not Available", guardianName: "—",
    universalPaymentEnabled: false,
    charges: [
      { id: "EC7", date: "2026-08-27", category: "Bed Fee", description: "Trauma Bay Resuscitation - 4 hours", amount: 3200, addedBy: "System" },
      { id: "EC8", date: "2026-08-27", category: "Doctor Fee", description: "Trauma Surgery Consultation - Dr. Rahul Mehta", amount: 2500, addedBy: "System" },
      { id: "EC9", date: "2026-08-27", category: "Diagnostic", description: "FAST Abdomen Scan + CBC + Blood Grouping", amount: 2650, addedBy: "Lab Dept" },
      { id: "EC10", date: "2026-08-27", category: "Diagnostic", description: "CT Brain Plain (Emergency)", amount: 3500, addedBy: "Lab Dept" },
      { id: "EC11", date: "2026-08-27", category: "Procedure", description: "Wound Dressing + Splinting", amount: 1200, addedBy: "System" },
      { id: "EC12", date: "2026-08-27", category: "Pharmacy", description: "Tranexamic Acid, IV Fluids, Analgesics", amount: 1450, addedBy: "Pharmacy Dept" },
      { id: "EC13", date: "2026-08-27", category: "Ambulance", description: "Trauma transport - 108 Emergency Service", amount: 0, addedBy: "System" },
    ],
    discounts: [],
    payments: [],
    coverage: { type: "None", schemeName: "", policyOrCardNumber: "", approvedAmount: 0, receivedAmount: 0, status: "Pending" },
    refunds: [],
    deposits: [],
  },
  {
    uhid: "UHID12345750", ipdId: "ER240824-0003", patientName: "Meera Joshi", age: 30, gender: "Female",
    ward: "ER-Bay-4", room: "Bay-4", bed: "ER-Bay-4",
    admittingDoctor: "Dr. Priya Nair",
    admissionDateTime: "27 Aug 2026, 10:45 AM", contactNumber: "+91 91234 56789", guardianName: "Anil Joshi (Husband)",
    universalPaymentEnabled: true,
    charges: [
      { id: "EC14", date: "2026-08-27", category: "Bed Fee", description: "ER Bay Observation - 3 hours", amount: 1500, addedBy: "System" },
      { id: "EC15", date: "2026-08-27", category: "Doctor Fee", description: "Emergency Medicine Consultation - Dr. Priya Nair", amount: 1200, addedBy: "System" },
      { id: "EC16", date: "2026-08-27", category: "Diagnostic", description: "Liver Function Test + Toxicology Screen", amount: 1450, addedBy: "Lab Dept" },
      { id: "EC17", date: "2026-08-27", category: "Procedure", description: "Gastric Lavage", amount: 1800, addedBy: "System" },
      { id: "EC18", date: "2026-08-27", category: "Pharmacy", description: "Activated Charcoal, Anti-emetics", amount: 480, addedBy: "Pharmacy Dept" },
    ],
    discounts: [],
    payments: [
      { id: "EP2", date: "2026-08-27", dateTime: "27 Aug 2026, 11:00 AM", partyName: "Anil Joshi", relationToPatient: "Husband", totalAmount: 500, methods: [{ method: "UPI", amount: 500 }], collectedBy: "ER Front Desk - Priya" },
    ],
    coverage: { type: "None", schemeName: "", policyOrCardNumber: "", approvedAmount: 0, receivedAmount: 0, status: "Pending" },
    refunds: [],
    deposits: [],
  },
  {
    uhid: "UHID12398250", ipdId: "ER240830-0018", patientName: "Anjali Deshmukh", age: 41, gender: "Female",
    ward: "ER-Bay-3", room: "Bay-3", bed: "ER-Bay-3",
    admittingDoctor: "Dr. Neha Gupta",
    admissionDateTime: "30 Aug 2026, 08:15 AM", contactNumber: "+91 90000 22334", guardianName: "—",
    universalPaymentEnabled: true,
    charges: [
      { id: "EC19", date: "2026-08-30", category: "Bed Fee", description: "ER Bay Observation - 3.5 hours", amount: 1400, addedBy: "System" },
      { id: "EC20", date: "2026-08-30", category: "Doctor Fee", description: "Emergency Consultation - Dr. Neha Gupta", amount: 900, addedBy: "System" },
      { id: "EC21", date: "2026-08-30", category: "Diagnostic", description: "CBC + Electrolytes Panel", amount: 850, addedBy: "Lab Dept" },
      { id: "EC22", date: "2026-08-30", category: "Pharmacy", description: "IV Fluids + Antiemetic", amount: 350, addedBy: "Pharmacy Dept" },
    ],
    discounts: [],
    payments: [
      { id: "EP3", date: "2026-08-30", dateTime: "30 Aug 2026, 11:40 AM", partyName: "Anjali Deshmukh", relationToPatient: "Self", totalAmount: 3500, methods: [{ method: "Card", amount: 3500 }], collectedBy: "ER Front Desk - Rohan" },
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
export const TODAY_ISO = "2026-08-30";
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
 * mobile, ER ID, doctor, bay/bed, guardian and insurance identifiers.
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
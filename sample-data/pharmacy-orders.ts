// sample-data/pharmacy-orders.ts
// Sample pharmacy / medicine orders for the Pharmacy role.

export type SamplePharmacyStatus =
  | "Ordered"
  | "Accepted"
  | "Dispensed"
  | "Ready for Dispatch"
  | "Collected"
  | "Returned";

export interface SamplePharmacyOrder {
  orderId: string;
  uhid: string;
  patientName: string;
  medicineName: string;
  strengthForm: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  qty: number;
  price: number;
  total: number;
  orderedBy: string;
  orderedAt: string;
  status: SamplePharmacyStatus;
  visitType: "OPD" | "IPD" | "Emergency" | "ICU";
}

export const SAMPLE_PHARMACY_ORDERS: SamplePharmacyOrder[] = [
  {
    orderId: "RX-2026-007892",
    uhid: "UHID-2026-001251",
    patientName: "Madhurima Sen",
    medicineName: "Tab. Pantoprazole",
    strengthForm: "40 mg Tablet",
    dose: "40 mg",
    route: "Oral",
    frequency: "OD (Once a day)",
    duration: "10 Days",
    qty: 10,
    price: 8,
    total: 80,
    orderedBy: "Dr. Riya Mukherjee",
    orderedAt: "22 Aug 2026, 10:05 AM",
    status: "Ready for Dispatch",
    visitType: "OPD",
  },
  {
    orderId: "RX-2026-007893",
    uhid: "UHID-2026-000982",
    patientName: "Ravi Sharma",
    medicineName: "Tab. Ecosprin AV",
    strengthForm: "75 mg Tablet",
    dose: "75 mg",
    route: "Oral",
    frequency: "OD (Once a day)",
    duration: "30 Days",
    qty: 30,
    price: 6,
    total: 180,
    orderedBy: "Dr. Soumitra Das",
    orderedAt: "22 Aug 2026, 08:30 AM",
    status: "Dispensed",
    visitType: "IPD",
  },
  {
    orderId: "RX-2026-007894",
    uhid: "UHID-2026-001198",
    patientName: "Anita Roy",
    medicineName: "Inj. Piperacillin-Tazobactam",
    strengthForm: "4.5 g Vial",
    dose: "4.5 g",
    route: "IV",
    frequency: "QID (Four times a day)",
    duration: "5 Days",
    qty: 20,
    price: 320,
    total: 6400,
    orderedBy: "Dr. R. Kapoor",
    orderedAt: "22 Aug 2026, 11:20 AM",
    status: "Accepted",
    visitType: "Emergency",
  },
];

export function getSamplePharmacyOrders(status?: SamplePharmacyStatus): SamplePharmacyOrder[] {
  return status
    ? SAMPLE_PHARMACY_ORDERS.filter((o) => o.status === status)
    : SAMPLE_PHARMACY_ORDERS;
}

// sample-data/lab-orders.ts
// Sample pathology & radiology orders for the Lab role.

export type SampleLabStatus =
  | "Ordered"
  | "Sample Collected"
  | "Processing"
  | "Ready"
  | "Reported"
  | "Cancelled";

export interface SampleLabOrder {
  orderId: string;
  uhid: string;
  patientName: string;
  testName: string;
  department: "Pathology" | "Radiology";
  category: string;
  priority: "Normal" | "Urgent" | "Stat";
  orderedBy: string;
  orderedAt: string;
  status: SampleLabStatus;
  reportDue?: string;
}

export const SAMPLE_LAB_ORDERS: SampleLabOrder[] = [
  {
    orderId: "LAB-2026-008421",
    uhid: "UHID-2026-000982",
    patientName: "Ravi Sharma",
    testName: "Complete Blood Count",
    department: "Pathology",
    category: "Hematology",
    priority: "Urgent",
    orderedBy: "Dr. Soumitra Das",
    orderedAt: "22 Aug 2026, 11:58 AM",
    status: "Processing",
  },
  {
    orderId: "LAB-2026-008422",
    uhid: "UHID-2026-001260",
    patientName: "Debasish Roy",
    testName: "Chest X-Ray (AP)",
    department: "Radiology",
    category: "X-Ray",
    priority: "Stat",
    orderedBy: "Dr. R. Kapoor",
    orderedAt: "22 Aug 2026, 12:05 PM",
    status: "Ready",
    reportDue: "22 Aug 2026, 12:30 PM",
  },
  {
    orderId: "LAB-2026-008423",
    uhid: "UHID-2026-000982",
    patientName: "Ravi Sharma",
    testName: "Lipid Profile",
    department: "Pathology",
    category: "Biochemistry",
    priority: "Normal",
    orderedBy: "Dr. Soumitra Das",
    orderedAt: "22 Aug 2026, 08:30 AM",
    status: "Reported",
  },
  {
    orderId: "LAB-2026-008424",
    uhid: "UHID-2026-001198",
    patientName: "Anita Roy",
    testName: "Serum Potassium",
    department: "Pathology",
    category: "Biochemistry",
    priority: "Stat",
    orderedBy: "Dr. R. Kapoor",
    orderedAt: "22 Aug 2026, 12:18 PM",
    status: "Processing",
  },
];

export function getSampleLabOrders(status?: SampleLabStatus): SampleLabOrder[] {
  return status
    ? SAMPLE_LAB_ORDERS.filter((o) => o.status === status)
    : SAMPLE_LAB_ORDERS;
}

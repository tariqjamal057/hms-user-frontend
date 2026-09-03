// sample-data/treatment-plans.ts
// Sample treatment plans for the Doctor role.

export type SampleActivityStatus =
  | "Completed"
  | "In Progress"
  | "Pending"
  | "Overdue"
  | "Held";

export type SampleActivitySource =
  | "Medication"
  | "Lab"
  | "Monitoring"
  | "Nursing"
  | "Diet"
  | "Radiology";

export interface SampleActivity {
  id: string;
  name: string;
  source: SampleActivitySource;
  progress: number; // 0 - 100
  owner: string;
  due: string;
  status: SampleActivityStatus;
}

export interface SampleTreatmentPlan {
  planId: string;
  uhid: string;
  patientName: string;
  diagnosis: string;
  overallProgress: number; // 0 - 100
  completedCount: number;
  totalCount: number;
  startDate: string;
  status: "Active" | "On Hold" | "Completed";
  activities: SampleActivity[];
}

export const SAMPLE_TREATMENT_PLANS: SampleTreatmentPlan[] = [
  {
    planId: "TP-2026-00218",
    uhid: "UHID-2026-000982",
    patientName: "Ravi Sharma",
    diagnosis: "Acute Coronary Syndrome (ACS)",
    overallProgress: 72,
    completedCount: 18,
    totalCount: 25,
    startDate: "20 Aug 2026",
    status: "Active",
    activities: [
      { id: "a1", name: "Tab. Ecosprin AV 75mg", source: "Medication", progress: 100, owner: "Pharmacy", due: "20 Aug", status: "Completed" },
      { id: "a2", name: "Troponin-I", source: "Lab", progress: 60, owner: "Pathology", due: "22 Aug", status: "In Progress" },
      { id: "a3", name: "ECG Monitoring", source: "Monitoring", progress: 100, owner: "Nurse", due: "21 Aug", status: "Completed" },
      { id: "a4", name: "Cardiac Diet", source: "Diet", progress: 40, owner: "Dietician", due: "23 Aug", status: "Pending" },
      { id: "a5", name: "Inj. Pantoprazole 40mg", source: "Medication", progress: 0, owner: "Pharmacy", due: "22 Aug", status: "Overdue" },
    ],
  },
  {
    planId: "TP-2026-00061",
    uhid: "UHID-2026-001260",
    patientName: "Debasish Roy",
    diagnosis: "Sepsis with respiratory failure",
    overallProgress: 45,
    completedCount: 9,
    totalCount: 20,
    startDate: "21 Aug 2026",
    status: "Active",
    activities: [
      { id: "b1", name: "IV Antibiotics", source: "Medication", progress: 80, owner: "Pharmacy", due: "22 Aug", status: "In Progress" },
      { id: "b2", name: "Ventilator Settings", source: "Monitoring", progress: 100, owner: "ICU Nurse", due: "21 Aug", status: "Completed" },
      { id: "b3", name: "Blood Culture", source: "Lab", progress: 30, owner: "Pathology", due: "23 Aug", status: "Pending" },
    ],
  },
];

export function getSampleTreatmentPlan(uhid: string): SampleTreatmentPlan | undefined {
  return SAMPLE_TREATMENT_PLANS.find((p) => p.uhid === uhid);
}

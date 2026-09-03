// sample-data/admissions.ts
// Sample IPD admission records for Admission Desk and Nurse Admin.

export type AdmissionStatus =
  | "Pending"
  | "In Progress"
  | "Admitted"
  | "Discharged"
  | "Cancelled"
  | "Transferred";

export interface SampleAdmission {
  admissionId: string;
  uhid: string;
  patientName: string;
  department: string;
  consultant: string;
  bed?: string;
  ward?: string;
  admissionDate: string;
  packageName?: string;
  status: AdmissionStatus;
  priority: "Elective" | "Urgent" | "Emergency";
  depositRequired: number;
  depositReceived: number;
}

export const SAMPLE_ADMISSIONS: SampleAdmission[] = [
  {
    admissionId: "ADM-2026-00112",
    uhid: "UHID-2026-000982",
    patientName: "Ravi Sharma",
    department: "General Medicine",
    consultant: "Dr. Soumitra Das",
    bed: "G-14",
    ward: "General Ward",
    admissionDate: "22 Aug 2026",
    packageName: "General Ward Package",
    status: "Admitted",
    priority: "Urgent",
    depositRequired: 18500,
    depositReceived: 11000,
  },
  {
    admissionId: "ADM-2026-00113",
    uhid: "UHID-2026-001260",
    patientName: "Debasish Roy",
    department: "ICU",
    consultant: "Dr. R. Kapoor",
    bed: "ICU-06",
    ward: "ICU",
    admissionDate: "22 Aug 2026",
    packageName: "ICU Package - Critical",
    status: "Admitted",
    priority: "Emergency",
    depositRequired: 35900,
    depositReceived: 23900,
  },
  {
    admissionId: "ADM-2026-00114",
    uhid: "UHID-2026-001311",
    patientName: "Kunal Basu",
    department: "Orthopedics",
    consultant: "Dr. A. Mukherjee",
    admissionDate: "22 Aug 2026",
    status: "Pending",
    priority: "Elective",
    depositRequired: 24000,
    depositReceived: 0,
  },
];

export function getSampleAdmissions(status?: AdmissionStatus): SampleAdmission[] {
  return status
    ? SAMPLE_ADMISSIONS.filter((a) => a.status === status)
    : SAMPLE_ADMISSIONS;
}

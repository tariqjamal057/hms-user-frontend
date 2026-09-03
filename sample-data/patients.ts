// sample-data/patients.ts
// Central sample patient records shared across roles (Doctor, Admission, Nurse, etc.)

export interface SamplePatient {
  uhid: string;
  name: string;
  initials: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  mobile: string;
  email?: string;
  department: string;
  doctor: string;
  bed?: string;
  ward?: string;
  status: "Waiting" | "Consultation" | "Admitted" | "Under Observation" | "Critical" | "Ready for Dispatch";
  priority: "Low" | "Normal" | "High" | "Critical";
  allergies: string[];
  visitType: "OPD" | "IPD" | "Emergency" | "ICU";
  visitId: string;
}

export const SAMPLE_PATIENTS: SamplePatient[] = [
  {
    uhid: "UHID-2026-001247",
    name: "Sanjay Paul",
    initials: "SP",
    age: 58,
    gender: "Male",
    bloodGroup: "A+",
    mobile: "9830012345",
    email: "sanjay.paul@example.com",
    department: "Cardiology",
    doctor: "Dr. Arindam Sen",
    status: "Consultation",
    priority: "High",
    allergies: ["Penicillin"],
    visitType: "OPD",
    visitId: "OPD-2026-008921",
  },
  {
    uhid: "UHID-2026-000982",
    name: "Ravi Sharma",
    initials: "RS",
    age: 67,
    gender: "Male",
    bloodGroup: "B+",
    mobile: "9831011122",
    department: "General Medicine",
    doctor: "Dr. Soumitra Das",
    bed: "G-14",
    ward: "General Ward",
    status: "Admitted",
    priority: "High",
    allergies: ["Penicillin"],
    visitType: "IPD",
    visitId: "IPD-2026-00218",
  },
  {
    uhid: "UHID-2026-001198",
    name: "Anita Roy",
    initials: "AR",
    age: 34,
    gender: "Female",
    bloodGroup: "O+",
    mobile: "9831234567",
    department: "Emergency",
    doctor: "Dr. R. Kapoor",
    status: "Under Observation",
    priority: "Critical",
    allergies: [],
    visitType: "Emergency",
    visitId: "ER-2026-004821",
  },
  {
    uhid: "UHID-2026-001260",
    name: "Debasish Roy",
    initials: "DR",
    age: 65,
    gender: "Male",
    bloodGroup: "AB+",
    mobile: "9831345678",
    department: "ICU",
    doctor: "Dr. R. Kapoor",
    bed: "ICU-06",
    ward: "ICU",
    status: "Critical",
    priority: "High",
    allergies: [],
    visitType: "ICU",
    visitId: "ICU-2026-00061",
  },
  {
    uhid: "UHID-2026-001251",
    name: "Madhurima Sen",
    initials: "MS",
    age: 42,
    gender: "Female",
    bloodGroup: "O-",
    mobile: "9831456789",
    department: "General Medicine",
    doctor: "Dr. Riya Mukherjee",
    status: "Waiting",
    priority: "Normal",
    allergies: [],
    visitType: "OPD",
    visitId: "OPD-2026-008925",
  },
];

export function getSamplePatient(uhid: string): SamplePatient | undefined {
  return SAMPLE_PATIENTS.find((p) => p.uhid === uhid);
}

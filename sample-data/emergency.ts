// sample-data/emergency.ts
// Sample emergency department patient records for Emergency / Resuscitation workflows.

export type SampleTriage =
  | "RED / Critical"
  | "ORANGE / Urgent"
  | "YELLOW / Priority"
  | "GREEN / Stable"
  | "BLUE / Non-urgent";

export type SampleEmergencyStatus =
  | "Waiting Triage"
  | "In Treatment"
  | "Observation"
  | "Awaiting Admission"
  | "Disposed";

export interface SampleEmergencyPatient {
  uhid: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  arrivalTime: string;
  complaint: string;
  triage: SampleTriage;
  doctor: string;
  location: string;
  waitTime: string;
  status: SampleEmergencyStatus;
  vitals: { bp: string; pulse: number; spo2: number; temp: number };
}

export const SAMPLE_EMERGENCY_PATIENTS: SampleEmergencyPatient[] = [
  {
    uhid: "UHID-2026-001198",
    name: "Anita Roy",
    age: 34,
    gender: "Female",
    arrivalTime: "11:20 AM",
    complaint: "Acute breathlessness",
    triage: "RED / Critical",
    doctor: "Dr. R. Kapoor",
    location: "Resus Bay 1",
    waitTime: "62 min",
    status: "In Treatment",
    vitals: { bp: "108/66", pulse: 118, spo2: 89, temp: 38.2 },
  },
  {
    uhid: "UHID-2026-001306",
    name: "Rahul Ghosh",
    age: 51,
    gender: "Male",
    arrivalTime: "11:45 AM",
    complaint: "Chest pain",
    triage: "ORANGE / Urgent",
    doctor: "Dr. Arindam Sen",
    location: "Observation Area",
    waitTime: "18 min",
    status: "Observation",
    vitals: { bp: "142/88", pulse: 96, spo2: 97, temp: 37.1 },
  },
  {
    uhid: "UHID-2026-001330",
    name: "Sneha Das",
    age: 22,
    gender: "Female",
    arrivalTime: "12:05 PM",
    complaint: "Minor laceration",
    triage: "GREEN / Stable",
    doctor: "Dr. A. Mukherjee",
    location: "Cubicle 3",
    waitTime: "5 min",
    status: "Waiting Triage",
    vitals: { bp: "118/74", pulse: 82, spo2: 99, temp: 36.8 },
  },
];

export function getEmergencyByTriage(triage: SampleTriage): SampleEmergencyPatient[] {
  return SAMPLE_EMERGENCY_PATIENTS.filter((p) => p.triage === triage);
}

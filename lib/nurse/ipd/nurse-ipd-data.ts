// lib/nurse/ipd/nurse-ipd-data.ts
import type {
  DischargeSummaryForm, EmarDose, FluidBalanceEntry, NurseIpdPatient, ProgressNote,
  ShiftHandoverEntry, TreatmentPlanItem, VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";

export const CURRENT_NURSE = { name: "Nurse Kavita", shift: "Morning (6 AM - 2 PM)", staffId: "NUR-STF-021" };

export const NURSE_IPD_PATIENTS: NurseIpdPatient[] = [
  {
    uhid: "UHID12345685", ipdId: "IPD240520-0001", patientName: "Ravi Sharma", age: 48, gender: "Male", bloodGroup: "B+",
    acuity: "Stable", ward: "Semi Private", room: "Room-2", bed: "B-203", department: "Cardiology",
    admittingDoctor: "Dr. Amit Verma", admissionDateTime: "20 May 2024, 11:30 AM", allergies: ["Penicillin"],
    currentDiagnosis: "Stable Angina", diagnosisCode: "I20.8", assignedNurse: "Nurse Kavita", currentShift: "Morning (6 AM - 2 PM)",
  },
  {
    uhid: "UHID12345684", ipdId: "IPD240520-0002", patientName: "Neha Singh", age: 36, gender: "Female", bloodGroup: "O+",
    acuity: "Under Observation", ward: "General Ward", room: "Room-5", bed: "G-108", department: "General Medicine",
    admittingDoctor: "Dr. Priya Nair", admissionDateTime: "20 May 2024, 09:45 AM", allergies: [],
    currentDiagnosis: "Viral Fever", diagnosisCode: "A99", assignedNurse: "Nurse Kavita", currentShift: "Morning (6 AM - 2 PM)",
  },
  {
    uhid: "UHID12345683", ipdId: "IPD240520-0003", patientName: "Suresh Yadav", age: 55, gender: "Male", bloodGroup: "A+",
    acuity: "Critical", ward: "ICU", room: "Bed-3", bed: "ICU-03", department: "General Surgery",
    admittingDoctor: "Dr. Rahul Mehta", admissionDateTime: "20 May 2024, 08:50 AM", allergies: ["Sulfa Drugs"],
    currentDiagnosis: "Post-Op Sepsis", diagnosisCode: "A41.9", assignedNurse: "Nurse Kavita", currentShift: "Morning (6 AM - 2 PM)",
  },
];

export function getNursePatients() { return NURSE_IPD_PATIENTS; }
export function getNursePatientByUhid(uhid: string) {
  return NURSE_IPD_PATIENTS.find((p) => p.uhid === uhid) ?? NURSE_IPD_PATIENTS[0];
}
export const NURSE_IPD_WARDS = Array.from(new Set(NURSE_IPD_PATIENTS.map((p) => p.ward)));
export const NURSE_IPD_SHIFTS = Array.from(new Set(NURSE_IPD_PATIENTS.map((p) => p.currentShift)));

export const VITALS_RECORDS: Record<string, VitalRecord[]> = {
  UHID12345685: [
    { id: "V1", dateTime: "20 May 2024, 08:00 AM", bp: "120/80", systolic: 120, diastolic: 80, pulse: 78, respRate: 18, spo2: 98, temp: 98.4, pain: 2, recordedBy: "Nurse Neha" },
    { id: "V2", dateTime: "19 May 2024, 08:00 PM", bp: "118/78", systolic: 118, diastolic: 78, pulse: 76, respRate: 18, spo2: 98, temp: 99.2, pain: 3, recordedBy: "Nurse Neha" },
    { id: "V3", dateTime: "19 May 2024, 08:00 AM", bp: "124/82", systolic: 124, diastolic: 82, pulse: 80, respRate: 20, spo2: 96, temp: 98.6, pain: 3, recordedBy: "Nurse Ravi" },
  ],
  UHID12345684: [
    { id: "V4", dateTime: "20 May 2024, 08:10 AM", bp: "110/70", systolic: 110, diastolic: 70, pulse: 84, respRate: 20, spo2: 97, temp: 99.1, pain: 2, recordedBy: "Nurse Neha" },
  ],
  UHID12345683: [
    { id: "V5", dateTime: "20 May 2024, 08:15 AM", bp: "90/60", systolic: 90, diastolic: 60, pulse: 110, respRate: 26, spo2: 92, temp: 100.8, pain: 6, recordedBy: "Nurse Pooja" },
  ],
};
export const EXTRA_VITALS: Record<string, VitalRecord[]> = {};
export function getVitalsForPatient(uhid: string) {
  return [...(EXTRA_VITALS[uhid] ?? []), ...(VITALS_RECORDS[uhid] ?? [])];
}
export function saveVitalForPatient(uhid: string, vital: VitalRecord) {
  (EXTRA_VITALS[uhid] ??= []).unshift(vital);
}

export const EMAR_DOSES: Record<string, EmarDose[]> = {
  UHID12345685: [
    { id: "E1", medicineName: "Tab. Aspirin 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "After breakfast", givenBy: "Nurse Kavita", givenAt: "20 May 2024, 08:05 AM" },
    { id: "E2", medicineName: "Tab. Metoprolol 25mg", strength: "25 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "After breakfast", givenBy: "Nurse Kavita", givenAt: "20 May 2024, 08:05 AM" },
    { id: "E3", medicineName: "Tab. Metoprolol 25mg", strength: "25 mg", route: "Oral", slot: "Night", scheduledTime: "08:00 PM", qtyRequired: 1, status: "Pending", urgency: "Urgent", instructions: "After dinner" },
    { id: "E4", medicineName: "Tab. Atorvastatin 40mg", strength: "40 mg", route: "Oral", slot: "Night", scheduledTime: "09:00 PM", qtyRequired: 1, status: "Pending", urgency: "Routine", instructions: "At bedtime" },
    { id: "E5", medicineName: "Tab. Clopidogrel 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Out of Stock", urgency: "Urgent", instructions: "After breakfast", remarks: "Batch exhausted, pharmacy notified" },
  ],
  UHID12345684: [
    { id: "E6", medicineName: "Tab. Paracetamol 650mg", strength: "650 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "After food", givenBy: "Nurse Kavita", givenAt: "20 May 2024, 08:10 AM" },
    { id: "E7", medicineName: "Tab. Paracetamol 650mg", strength: "650 mg", route: "Oral", slot: "Afternoon", scheduledTime: "02:00 PM", qtyRequired: 1, status: "Pending", urgency: "Urgent", instructions: "After food" },
    { id: "E8", medicineName: "ORS Sachet", strength: "1 sachet", route: "Oral", slot: "Morning", scheduledTime: "09:00 AM", qtyRequired: 1, status: "Given", urgency: "Routine", instructions: "As needed", givenBy: "Nurse Kavita", givenAt: "20 May 2024, 09:05 AM" },
  ],
  UHID12345683: [
    { id: "E9", medicineName: "Inj. Piperacillin-Tazobactam", strength: "4.5 g", route: "IV", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "As per nursing schedule", givenBy: "Nurse Anjali", givenAt: "20 May 2024, 08:05 AM" },
    { id: "E10", medicineName: "Inj. Piperacillin-Tazobactam", strength: "4.5 g", route: "IV", slot: "Afternoon", scheduledTime: "02:00 PM", qtyRequired: 1, status: "Pending", urgency: "Urgent", instructions: "As per nursing schedule" },
    { id: "E11", medicineName: "Noradrenaline Infusion", strength: "0.1 mcg/kg/min", route: "IV", slot: "Morning", scheduledTime: "Continuous", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "Continuous infusion", givenBy: "Nurse Anjali", givenAt: "Ongoing" },
  ],
};
export function getEmarForPatient(uhid: string) { return EMAR_DOSES[uhid] ?? []; }

export const FLUID_BALANCE: Record<string, FluidBalanceEntry[]> = {
  UHID12345685: [
    { id: "F1", dateTime: "20 May 2024, 08:00 AM", direction: "Intake", route: "Oral", description: "Water + breakfast fluids", volumeMl: 400, recordedBy: "Nurse Kavita" },
    { id: "F2", dateTime: "20 May 2024, 09:00 AM", direction: "Output", route: "Urine", description: "Morning void", volumeMl: 350, recordedBy: "Nurse Kavita" },
    { id: "F3", dateTime: "19 May 2024, 08:00 PM", direction: "Intake", route: "IV", description: "NS 500ml infusion", volumeMl: 500, recordedBy: "Nurse Priya" },
  ],
  UHID12345683: [
    { id: "F4", dateTime: "20 May 2024, 08:00 AM", direction: "Intake", route: "IV", description: "NS + antibiotics", volumeMl: 600, recordedBy: "Nurse Anjali" },
    { id: "F5", dateTime: "20 May 2024, 08:30 AM", direction: "Output", route: "Urine", description: "Catheter output", volumeMl: 200, recordedBy: "Nurse Anjali" },
    { id: "F6", dateTime: "20 May 2024, 09:00 AM", direction: "Output", route: "Drain", description: "Surgical drain output", volumeMl: 80, recordedBy: "Nurse Anjali" },
  ],
};
export function getFluidBalanceForPatient(uhid: string) { return FLUID_BALANCE[uhid] ?? []; }

export const PROGRESS_NOTES: Record<string, ProgressNote[]> = {
  UHID12345685: [
    { id: "PN-1001", uhid: "UHID12345685", title: "Morning Ward Round", author: "Dr. Amit Verma", role: "Doctor", category: "Doctor Round", priority: "Routine", createdAt: "Today · 08:40 AM", status: "Signed & Locked", subjective: "Patient comfortable at rest. No recurrent chest pain since last evening.", objective: "Hemodynamically stable. BP 120/80 mmHg, pulse 78/min, SpO₂ 98%.", assessment: "Stable angina with controlled symptoms. No signs of acute cardiac event.", plan: "Continue ACS protocol. Continue antiplatelet and statin therapy. Await serial cardiology review.", noteText: "Patient comfortable at rest. No recurrent chest pain since last evening. Hemodynamically stable. Continue ACS protocol. Await serial cardiology decision." },
    { id: "PN-1003", uhid: "UHID12345685", title: "Nursing Handover Note", author: "Nurse Priya", role: "Nurse", category: "Nursing Update", priority: "Routine", createdAt: "Yesterday · 08:00 PM", status: "Signed & Locked", subjective: "Patient denies chest pain and shortness of breath.", objective: "Patient alert and oriented. Pain score 1/10. Oral intake adequate.", assessment: "Comfortable and stable during evening shift.", plan: "Continue routine monitoring. Escalate if chest pain or breathing difficulty develops.", noteText: "Patient alert and oriented. No acute distress. Continue routine monitoring and medication schedule." },
  ],
  UHID12345684: [], UHID12345683: [],
};
export function getProgressNotesForPatient(uhid: string) { return PROGRESS_NOTES[uhid] ?? []; }

export const TREATMENT_PLANS: Record<string, TreatmentPlanItem[]> = {
  UHID12345685: [
    { id: "T1", title: "ACS Protocol Continuation", description: "Continue dual antiplatelet therapy and statin. Monitor for chest pain recurrence.", orderedBy: "Dr. Amit Verma", orderedOn: "20 May 2024, 09:00 AM", followStatus: "Following", lastUpdatedBy: "Nurse Kavita", lastUpdatedAt: "20 May 2024, 09:15 AM" },
    { id: "T2", title: "Cardiac Diet", description: "Low-sodium, low-fat diet. Restrict fluid intake to 1.5L/day.", orderedBy: "Dr. Amit Verma", orderedOn: "20 May 2024, 09:00 AM", followStatus: "Following" },
    { id: "T3", title: "Ambulation Plan", description: "Assist with short supervised walks twice daily as tolerated.", orderedBy: "Dr. Amit Verma", orderedOn: "20 May 2024, 09:00 AM", followStatus: "Not Following" },
  ],
  UHID12345684: [
    { id: "T4", title: "Antipyretic Protocol", description: "Administer paracetamol for fever above 100°F. Monitor temperature every 4 hours.", orderedBy: "Dr. Priya Nair", orderedOn: "20 May 2024, 09:45 AM", followStatus: "Following" },
  ],
  UHID12345683: [
    { id: "T5", title: "Sepsis Bundle", description: "IV antibiotics, vasopressor support, hourly vitals and urine output monitoring.", orderedBy: "Dr. Rahul Mehta", orderedOn: "20 May 2024, 08:50 AM", followStatus: "Following", lastUpdatedBy: "Nurse Anjali", lastUpdatedAt: "20 May 2024, 09:00 AM" },
  ],
};
export function getTreatmentPlanForPatient(uhid: string) { return TREATMENT_PLANS[uhid] ?? []; }

export const SHIFT_HANDOVERS: Record<string, ShiftHandoverEntry[]> = {
  UHID12345685: [
    { id: "H1", fromNurse: "Nurse Priya", fromShift: "Night (10 PM - 6 AM)", toNurse: "Nurse Kavita", toShift: "Morning (6 AM - 2 PM)", handoverDateTime: "20 May 2024, 06:05 AM", notes: "Patient slept well. No overnight chest pain episodes. Continue morning medication schedule." },
  ],
  UHID12345684: [], UHID12345683: [],
};
export function getShiftHandoversForPatient(uhid: string) { return SHIFT_HANDOVERS[uhid] ?? []; }

export const AVAILABLE_NEXT_SHIFT_NURSES = ["Nurse Priya (Evening 2 PM - 10 PM)", "Nurse Anjali (Evening 2 PM - 10 PM)", "Nurse Ritu (Night 10 PM - 6 AM)"];

export const DISCHARGE_FORM_DEFAULT: DischargeSummaryForm = {
  patientConditionOnDischarge: "", vitalsStableAtDischarge: false, woundStatus: "", medicationsHandedOver: false,
  belongingsReturned: false, patientEducationGiven: false, followUpInstructions: "", dischargedBy: CURRENT_NURSE.name,
  dischargeDateTime: "", additionalNotes: "",
};
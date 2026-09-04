// lib/nurse/icu/nurse-icu-data.ts
import { NurseAssignment } from "@/types/doctor/icu/doctor-icu-types";
import { OxygenTherapyRecord, VentilationRecord } from "@/types/nurse/icu/nurse-icu-types";
import type {
  DischargeSummaryForm, EmarDose, FluidBalanceEntry, NurseIpdPatient, ProgressNote,
  ShiftHandoverEntry, TreatmentPlanItem, VitalRecord,
} from "@/types/nurse/ipd/nurse-ipd-types";


export const CURRENT_NURSE = { name: "Nurse Kavita", shift: "Morning (6 AM - 2 PM)", staffId: "NUR-STF-021" };

export const NURSE_ICU_PATIENTS: NurseIpdPatient[] = [
  {
    uhid: "UHID12345685", ipdId: "ICU-2026-001", patientName: "Ravi Sharma", age: 48, gender: "Male", bloodGroup: "B+",
    acuity: "Stable", ward: "ICU-A", room: "Room-1", bed: "ICU-A-01", department: "Cardiology",
    admittingDoctor: "Dr. Amit Verma", admissionDateTime: "27 Aug 2026, 09:30 AM", allergies: ["Penicillin"],
    currentDiagnosis: "Acute Myocardial Infarction - Post PCI", diagnosisCode: "I21.9", assignedNurse: "Nurse Kavita", currentShift: "Morning (6 AM - 2 PM)",
  },
  {
    uhid: "UHID12398211", ipdId: "ICU-2026-002", patientName: "Rahul Roy", age: 30, gender: "Male", bloodGroup: "O+",
    acuity: "Critical", ward: "ICU-B", room: "Room-3", bed: "ICU-B-03", department: "Trauma Surgery",
    admittingDoctor: "Dr. Rahul Mehta", admissionDateTime: "27 Aug 2026, 11:15 AM", allergies: [],
    currentDiagnosis: "Multiple Traumatic Injuries - Post Splenectomy", diagnosisCode: "T14.90", assignedNurse: "Nurse Kavita", currentShift: "Morning (6 AM - 2 PM)",
  },
  {
    uhid: "UHID12345750", ipdId: "ICU-2026-003", patientName: "Meera Joshi", age: 30, gender: "Female", bloodGroup: "A+",
    acuity: "Under Observation", ward: "ICU-A", room: "Room-2", bed: "ICU-A-02", department: "Emergency Medicine",
    admittingDoctor: "Dr. Priya Nair", admissionDateTime: "27 Aug 2026, 10:45 AM", allergies: [],
    currentDiagnosis: "Drug Overdose - Suicide Attempt", diagnosisCode: "T39.9", assignedNurse: "Nurse Kavita", currentShift: "Morning (6 AM - 2 PM)",
  },
];

export function getNursePatients() { return NURSE_ICU_PATIENTS; }
export function getNursePatientByUhid(uhid: string) {
  return NURSE_ICU_PATIENTS.find((p) => p.uhid === uhid) ?? NURSE_ICU_PATIENTS[0];
}
export const NURSE_ICU_WARDS = Array.from(new Set(NURSE_ICU_PATIENTS.map((p) => p.ward)));
export const NURSE_ICU_SHIFTS = Array.from(new Set(NURSE_ICU_PATIENTS.map((p) => p.currentShift)));

export const VITALS_RECORDS: Record<string, VitalRecord[]> = {
  UHID12345685: [
    { id: "V1", dateTime: "27 Aug 2026, 08:00 AM", bp: "128/84", systolic: 128, diastolic: 84, pulse: 82, respRate: 18, spo2: 97, temp: 98.6, pain: 2, recordedBy: "Nurse Kavita" },
    { id: "V2", dateTime: "26 Aug 2026, 08:00 PM", bp: "132/86", systolic: 132, diastolic: 86, pulse: 88, respRate: 20, spo2: 96, temp: 99.0, pain: 3, recordedBy: "Nurse Priya" },
  ],
  UHID12398211: [
    { id: "V3", dateTime: "27 Aug 2026, 08:15 AM", bp: "92/62", systolic: 92, diastolic: 62, pulse: 112, respRate: 24, spo2: 93, temp: 100.2, pain: 8, recordedBy: "Nurse Anjali" },
  ],
  UHID12345750: [
    { id: "V4", dateTime: "27 Aug 2026, 08:10 AM", bp: "112/72", systolic: 112, diastolic: 72, pulse: 90, respRate: 19, spo2: 98, temp: 98.4, pain: 1, recordedBy: "Nurse Neha" },
  ],
};
export function getVitalsForPatient(uhid: string) { return VITALS_RECORDS[uhid] ?? []; }

export const EMAR_DOSES: Record<string, EmarDose[]> = {
  UHID12345685: [
    // Given
    { id: "E1", medicineName: "Tab. Aspirin 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "After breakfast", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 08:05 AM" },
    { id: "E2", medicineName: "Tab. Atorvastatin 40mg", strength: "40 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Routine", instructions: "After breakfast", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 08:10 AM" },
    { id: "E3", medicineName: "Inj. Heparin 5000 IU", strength: "5000 IU", route: "SC", slot: "Morning", scheduledTime: "09:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "As per ACS protocol", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 09:02 AM" },
    { id: "E4", medicineName: "Inj. Pantoprazole 40mg", strength: "40 mg", route: "IV", slot: "Morning", scheduledTime: "10:00 AM", qtyRequired: 1, status: "Given", urgency: "Routine", instructions: "Slow IV push", givenBy: "Nurse Kavita", givenAt: "27 Aug 2026, 10:05 AM" },
    // Not Given
    { id: "E5", medicineName: "Tab. Metoprolol 25mg", strength: "25 mg", route: "Oral", slot: "Afternoon", scheduledTime: "02:00 PM", qtyRequired: 1, status: "Not Given", urgency: "Urgent", instructions: "After lunch" },
    { id: "E6", medicineName: "Tab. Aspirin 75mg", strength: "75 mg", route: "Oral", slot: "Afternoon", scheduledTime: "02:00 PM", qtyRequired: 1, status: "Not Given", urgency: "Routine", instructions: "After lunch" },
    // Pending
    { id: "E7", medicineName: "Tab. Metoprolol 25mg", strength: "25 mg", route: "Oral", slot: "Night", scheduledTime: "08:00 PM", qtyRequired: 1, status: "Pending", urgency: "Urgent", instructions: "After dinner" },
    { id: "E8", medicineName: "Tab. Atorvastatin 40mg", strength: "40 mg", route: "Oral", slot: "Night", scheduledTime: "09:00 PM", qtyRequired: 1, status: "Pending", urgency: "Routine", instructions: "At bedtime" },
    // Out of Stock
    { id: "E9", medicineName: "Tab. Clopidogrel 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Out of Stock", urgency: "Urgent", instructions: "After breakfast", remarks: "Batch exhausted, pharmacy notified" },
    { id: "E10", medicineName: "Tab. Spironolactone 25mg", strength: "25 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Out of Stock", urgency: "Routine", instructions: "After breakfast", remarks: "Awaiting next pharmacy delivery" },
  ],
  UHID12398211: [
    { id: "E4", medicineName: "Inj. Piperacillin-Tazobactam", strength: "4.5 g", route: "IV", slot: "Morning", scheduledTime: "08:00 AM", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "As per nursing schedule", givenBy: "Nurse Anjali", givenAt: "27 Aug 2026, 08:05 AM" },
    { id: "E5", medicineName: "Noradrenaline Infusion", strength: "0.1 mcg/kg/min", route: "IV", slot: "Morning", scheduledTime: "Continuous", qtyRequired: 1, status: "Given", urgency: "Urgent", instructions: "Continuous infusion", givenBy: "Nurse Anjali", givenAt: "Ongoing" },
  ],
  UHID12345750: [
    { id: "E6", medicineName: "Tab. Ondansetron 4mg", strength: "4 mg", route: "Oral", slot: "Morning", scheduledTime: "09:20 AM", qtyRequired: 1, status: "Given", urgency: "Routine", instructions: "Before meal", givenBy: "Nurse Neha", givenAt: "27 Aug 2026, 09:22 AM" },
  ],
};
export function getEmarForPatient(uhid: string) { return EMAR_DOSES[uhid] ?? []; }

export const FLUID_BALANCE: Record<string, FluidBalanceEntry[]> = {
  UHID12345685: [
    { id: "F1", dateTime: "27 Aug 2026, 08:00 AM", direction: "Intake", route: "Oral", description: "Water + breakfast fluids", volumeMl: 400, recordedBy: "Nurse Kavita" },
    { id: "F2", dateTime: "27 Aug 2026, 09:00 AM", direction: "Output", route: "Urine", description: "Morning void", volumeMl: 350, recordedBy: "Nurse Kavita" },
  ],
  UHID12398211: [
    { id: "F3", dateTime: "27 Aug 2026, 08:00 AM", direction: "Intake", route: "IV", description: "NS + antibiotics", volumeMl: 600, recordedBy: "Nurse Anjali" },
    { id: "F4", dateTime: "27 Aug 2026, 08:30 AM", direction: "Output", route: "Drain", description: "Surgical drain output", volumeMl: 80, recordedBy: "Nurse Anjali" },
  ],
};
export function getFluidBalanceForPatient(uhid: string) { return FLUID_BALANCE[uhid] ?? []; }

export const PROGRESS_NOTES: Record<string, ProgressNote[]> = {
  UHID12345685: [
    { id: "PN-1001", uhid: "UHID12345685", title: "ICU Morning Round", author: "Dr. Amit Verma", role: "Doctor", category: "Doctor Round", priority: "Routine", createdAt: "Today · 08:40 AM", status: "Signed & Locked", subjective: "Patient comfortable, no recurrent chest pain.", objective: "Hemodynamically stable. BP 128/84, SpO₂ 97%.", assessment: "Post-PCI recovery on track.", plan: "Continue monitoring, step-down planning tomorrow.", noteText: "Patient stable post-PCI. Continue current management." },
  ],
  UHID12398211: [], UHID12345750: [],
};
export function getProgressNotesForPatient(uhid: string) { return PROGRESS_NOTES[uhid] ?? []; }

export const TREATMENT_PLANS: Record<string, TreatmentPlanItem[]> = {
  UHID12345685: [
    { id: "T1", title: "ACS Protocol Continuation", description: "Continue dual antiplatelet therapy and statin. Monitor for chest pain recurrence.", orderedBy: "Dr. Amit Verma", orderedOn: "27 Aug 2026, 09:35 AM", followStatus: "Following", lastUpdatedBy: "Nurse Kavita", lastUpdatedAt: "27 Aug 2026, 09:45 AM" },
  ],
  UHID12398211: [
    { id: "T2", title: "Sepsis & Trauma Bundle", description: "IV antibiotics, vasopressor support, hourly vitals and urine output monitoring.", orderedBy: "Dr. Rahul Mehta", orderedOn: "27 Aug 2026, 11:20 AM", followStatus: "Following", lastUpdatedBy: "Nurse Anjali", lastUpdatedAt: "27 Aug 2026, 11:30 AM" },
  ],
  UHID12345750: [
    { id: "T3", title: "Poisoning Management Protocol", description: "Monitor LFTs, psychiatric evaluation mandatory.", orderedBy: "Dr. Priya Nair", orderedOn: "27 Aug 2026, 09:15 AM", followStatus: "Following" },
  ],
};
export function getTreatmentPlanForPatient(uhid: string) { return TREATMENT_PLANS[uhid] ?? []; }

export const NURSE_SHIFT_ASSIGNMENTS: Record<string, NurseAssignment[]> = {
  UHID12345685: [
    { id: "NS1", uhid: "UHID12345685", nurseName: "Nurse Kavita", nurseId: "NUR-001", shift: "Morning", date: "2026-08-27", ward: "ICU-A" },
    { id: "NS2", uhid: "UHID12345685", nurseName: "Nurse Priya", nurseId: "NUR-002", shift: "Afternoon", date: "2026-08-27", ward: "ICU-A" },
    { id: "NS3", uhid: "UHID12345685", nurseName: "Nurse Anjali", nurseId: "NUR-003", shift: "Night", date: "2026-08-27", ward: "ICU-A" },
    { id: "NS4", uhid: "UHID12345685", nurseName: "Nurse Kavita", nurseId: "NUR-001", shift: "Morning", date: "2026-08-28", ward: "ICU-A" },
  ],
  UHID12398211: [
    { id: "NS5", uhid: "UHID12398211", nurseName: "Nurse Anjali", nurseId: "NUR-003", shift: "Morning", date: "2026-08-27", ward: "ICU-B" },
    { id: "NS6", uhid: "UHID12398211", nurseName: "Nurse Ritu", nurseId: "NUR-004", shift: "Afternoon", date: "2026-08-27", ward: "ICU-B" },
    { id: "NS7", uhid: "UHID12398211", nurseName: "Nurse Priya", nurseId: "NUR-002", shift: "Night", date: "2026-08-27", ward: "ICU-B" },
  ],
  UHID12345750: [
    { id: "NS8", uhid: "UHID12345750", nurseName: "Nurse Neha", nurseId: "NUR-005", shift: "Morning", date: "2026-08-27", ward: "ICU-A" },
    { id: "NS9", uhid: "UHID12345750", nurseName: "Nurse Kavita", nurseId: "NUR-001", shift: "Afternoon", date: "2026-08-27", ward: "ICU-A" },
    { id: "NS10", uhid: "UHID12345750", nurseName: "Nurse Anjali", nurseId: "NUR-003", shift: "Night", date: "2026-08-27", ward: "ICU-A" },
  ],
};

export const SHIFT_HANDOVERS: Record<string, ShiftHandoverEntry[]> = {
  UHID12345685: [
    { id: "H1", fromNurse: "Nurse Priya", fromShift: "Night (10 PM - 6 AM)", toNurse: "Nurse Kavita", toShift: "Morning (6 AM - 2 PM)", handoverDateTime: "27 Aug 2026, 06:05 AM", notes: "Patient slept well. Continue morning medication schedule." },
  ],
  UHID12398211: [], UHID12345750: [],
};
export function getShiftHandoversForPatient(uhid: string) { return SHIFT_HANDOVERS[uhid] ?? []; }

export const AVAILABLE_NEXT_SHIFT_NURSES = ["Nurse Priya (Evening 2 PM - 10 PM)", "Nurse Anjali (Evening 2 PM - 10 PM)", "Nurse Ritu (Night 10 PM - 6 AM)"];

export const DISCHARGE_FORM_DEFAULT: DischargeSummaryForm = {
  patientConditionOnDischarge: "", vitalsStableAtDischarge: false, woundStatus: "", medicationsHandedOver: false,
  belongingsReturned: false, patientEducationGiven: false, followUpInstructions: "", dischargedBy: CURRENT_NURSE.name,
  dischargeDateTime: "", additionalNotes: "",
};

// Placeholder ICU-specific records — structure to be finalized once you share the Ventilation/Oxygen spec.
export const VENTILATION_RECORDS: Record<string, VentilationRecord[]> = {
  UHID12398211: [],
};
export function getVentilationForPatient(uhid: string) { return VENTILATION_RECORDS[uhid] ?? []; }

export const OXYGEN_THERAPY_RECORDS: Record<string, OxygenTherapyRecord[]> = {
  UHID12345685: [],
  UHID12398211: [],
};
export function getOxygenTherapyForPatient(uhid: string) { return OXYGEN_THERAPY_RECORDS[uhid] ?? []; }
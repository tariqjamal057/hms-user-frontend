// lib/nurse-admin/ipd/ward-detail-data.ts
import type { BedInfo, VitalRecordFull, WardPatientFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { NURSE_DIRECTORY } from "./nurse-admin-data";

export const WARD_STRUCTURE: Record<string, string[]> = {
  ICU: ["Bay-1"],
  "Semi Private": ["Room-1", "Room-2", "Room-3", "Room-4"],
  "General Ward": ["Room-5", "Room-6", "Room-7"],
};

export const WARD_PATIENTS_FULL: WardPatientFull[] = [
  {
    uhid: "UHID12345685", ipdId: "IPD240520-0001", patientName: "Ravi Sharma", age: 48, gender: "Male", bloodGroup: "B+",
    acuity: "Stable", status: "Stable", ward: "Semi Private", room: "Room-2", bed: "B-203", department: "Cardiology",
    admittingDoctor: "Dr. Amit Verma", admissionDateTime: "20 Aug 2026, 11:30 AM", admittedFrom: "OPD Referral",
    allergies: ["Penicillin"], currentDiagnosis: "Stable Angina", diagnosisCode: "I20.8",
    contactNumber: "+91 98765 43210", guardianName: "Sunita Sharma (Wife)",
    assignments: [
      { date: "2026-08-20", shift: "Morning", nurseIds: ["N1"] }, { date: "2026-08-20", shift: "Evening", nurseIds: ["N2"] }, { date: "2026-08-20", shift: "Night", nurseIds: ["N7"] },
      { date: "2026-08-24", shift: "Morning", nurseIds: ["N1"] }, { date: "2026-08-24", shift: "Evening", nurseIds: ["N2"] }, { date: "2026-08-24", shift: "Night", nurseIds: ["N7"] },
      { date: "2026-08-25", shift: "Morning", nurseIds: ["N1"] }, { date: "2026-08-25", shift: "Evening", nurseIds: ["N2"] },
      { date: "2026-08-26", shift: "Morning", nurseIds: ["N1"] },
    ],
    vitals: [
      { id: "V1", date: "2026-08-24", dateTime: "24 Aug 2026, 08:00 AM", bp: "120/80", pulse: 78, respRate: 18, spo2: 98, temp: 98.4, pain: 2, recordedBy: "Nurse Kavita", recordedByRole: "Nurse" },
      { id: "V2", date: "2026-08-23", dateTime: "23 Aug 2026, 08:00 PM", bp: "118/78", pulse: 76, respRate: 18, spo2: 98, temp: 99.2, pain: 3, recordedBy: "Nurse Priya", recordedByRole: "Nurse" },
      { id: "V3", date: "2026-08-23", dateTime: "23 Aug 2026, 08:00 AM", bp: "124/82", pulse: 80, respRate: 20, spo2: 96, temp: 98.6, pain: 3, recordedBy: "Dr. Amit Verma", recordedByRole: "Doctor" },
    ],
    medicines: [
      { id: "M1", date: "2026-08-24", medicineName: "Tab. Aspirin 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", status: "Given", urgency: "Urgent", deliveredFromPharmacyAt: "24 Aug 2026, 06:30 AM", givenBy: "Nurse Kavita", givenAt: "24 Aug 2026, 08:05 AM" },
      { id: "M2", date: "2026-08-24", medicineName: "Tab. Metoprolol 25mg", strength: "25 mg", route: "Oral", slot: "Night", scheduledTime: "08:00 PM", status: "Pending", urgency: "Urgent", deliveredFromPharmacyAt: "24 Aug 2026, 06:30 AM" },
      { id: "M3", date: "2026-08-24", medicineName: "Tab. Clopidogrel 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", status: "Out of Stock", urgency: "Urgent", outOfStockRemark: "Batch exhausted, pharmacy notified" },
      { id: "M4", date: "2026-08-23", medicineName: "Tab. Aspirin 75mg", strength: "75 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", status: "Given", urgency: "Urgent", deliveredFromPharmacyAt: "23 Aug 2026, 06:20 AM", givenBy: "Nurse Priya", givenAt: "23 Aug 2026, 08:10 AM" },
    ],
    progressNotes: [
      { id: "PN1", date: "2026-08-24", title: "Morning Ward Round", author: "Dr. Amit Verma", role: "Doctor", category: "Doctor Round", createdAt: "24 Aug 2026, 08:40 AM", noteText: "Patient comfortable at rest. No recurrent chest pain. Continue ACS protocol." },
      { id: "PN2", date: "2026-08-23", title: "Evening Nursing Update", author: "Nurse Priya", role: "Nurse", category: "Nursing Update", createdAt: "23 Aug 2026, 08:00 PM", noteText: "Patient alert and oriented, pain score 1/10. Continue routine monitoring." },
    ],
    fluidBalance: [
      { id: "F1", date: "2026-08-24", dateTime: "24 Aug 2026, 08:00 AM", direction: "Intake", route: "Oral", description: "Water + breakfast fluids", volumeMl: 400, recordedBy: "Nurse Kavita" },
      { id: "F2", date: "2026-08-24", dateTime: "24 Aug 2026, 09:00 AM", direction: "Output", route: "Urine", description: "Morning void", volumeMl: 350, recordedBy: "Nurse Kavita" },
    ],
    treatmentPlans: [
      { id: "T1", title: "ACS Protocol Continuation", description: "Continue dual antiplatelet therapy and statin.", orderedBy: "Dr. Amit Verma", orderedOn: "24 Aug 2026, 09:00 AM", followStatus: "Following" },
      { id: "T2", title: "Ambulation Plan", description: "Assist with short supervised walks twice daily.", orderedBy: "Dr. Amit Verma", orderedOn: "24 Aug 2026, 09:00 AM", followStatus: "Not Following" },
    ],
    handovers: [
      { id: "H1", fromNurse: "Nurse Priya", fromShift: "Night", toNurse: "Nurse Kavita", toShift: "Morning", handoverDateTime: "24 Aug 2026, 06:05 AM", notes: "Slept well, no overnight chest pain." },
    ],
    statusLog: [
      { id: "S1", status: "Stable", changedBy: "Nurse Kavita", changedAt: "24 Aug 2026, 08:10 AM" },
      { id: "S2", status: "Under Observation", changedBy: "Nurse Priya", changedAt: "22 Aug 2026, 09:00 PM", reason: "Mild chest discomfort reported" },
    ],
    discharge: {
      finalDiagnosis: "Resolved Community Acquired Pneumonia",
      dischargeSummary: "Patient responded well to IV antibiotics, afebrile for 48 hours, chest clear on auscultation.",
      dischargeMedicines: [{ name: "Tab. Amoxiclav 625mg", dosage: "1 tablet twice daily", duration: "5 days" }, { name: "Tab. Paracetamol 650mg", dosage: "SOS for fever", duration: "5 days" }],
      followUpDate: "30 Aug 2026", followUpInstructions: "Review in OPD with chest X-ray if symptoms recur.",
      dietInstructions: "High protein diet, adequate fluid intake, avoid cold beverages.",
      dischargedByDoctor: "Dr. Priya Nair", doctorApprovedAt: "23 Aug 2026, 10:30 AM",
      nurseApprovedBy: "Nurse Sunita", nurseApprovedAt: "23 Aug 2026, 10:50 AM", sentToBillingAt: "23 Aug 2026, 11:00 AM",
    },
  },
  {
    uhid: "UHID12345683", ipdId: "IPD240520-0003", patientName: "Suresh Yadav", age: 55, gender: "Male", bloodGroup: "A+",
    acuity: "Critical", status: "Critical", ward: "ICU", room: "Bay-1", bed: "ICU-03", department: "General Surgery",
    admittingDoctor: "Dr. Rahul Mehta", admissionDateTime: "20 Aug 2026, 08:50 AM", admittedFrom: "Emergency",
    allergies: ["Sulfa Drugs"], currentDiagnosis: "Post-Op Sepsis", diagnosisCode: "A41.9",
    contactNumber: "+91 99887 76655", guardianName: "Manoj Yadav (Son)",
    assignments: [
      { date: "2026-08-24", shift: "Morning", nurseIds: ["N3", "N6"] }, { date: "2026-08-24", shift: "Evening", nurseIds: ["N3"] }, { date: "2026-08-24", shift: "Night", nurseIds: ["N6"] },
      { date: "2026-08-25", shift: "Morning", nurseIds: ["N3"] },
    ],
    vitals: [
      { id: "V4", date: "2026-08-24", dateTime: "24 Aug 2026, 08:15 AM", bp: "90/60", pulse: 110, respRate: 26, spo2: 92, temp: 100.8, pain: 6, recordedBy: "Nurse Anjali", recordedByRole: "Nurse" },
      { id: "V5", date: "2026-08-24", dateTime: "24 Aug 2026, 06:00 AM", bp: "88/58", pulse: 114, respRate: 27, spo2: 91, temp: 101.2, pain: 7, recordedBy: "Dr. Rahul Mehta", recordedByRole: "Doctor" },
    ],
    medicines: [
      { id: "M5", date: "2026-08-24", medicineName: "Inj. Piperacillin-Tazobactam", strength: "4.5 g", route: "IV", slot: "Morning", scheduledTime: "08:00 AM", status: "Given", urgency: "Urgent", deliveredFromPharmacyAt: "24 Aug 2026, 06:00 AM", givenBy: "Nurse Anjali", givenAt: "24 Aug 2026, 08:05 AM" },
      { id: "M6", date: "2026-08-24", medicineName: "Noradrenaline Infusion", strength: "0.1 mcg/kg/min", route: "IV", slot: "Morning", scheduledTime: "Continuous", status: "Given", urgency: "Urgent", givenBy: "Nurse Anjali", givenAt: "Ongoing" },
    ],
    progressNotes: [
      { id: "PN3", date: "2026-08-24", title: "ICU Round Note", author: "Dr. Rahul Mehta", role: "Doctor", category: "Doctor Round", createdAt: "24 Aug 2026, 07:00 AM", noteText: "Patient hemodynamically unstable, on vasopressor support. Sepsis bundle continued." },
    ],
    fluidBalance: [
      { id: "F3", date: "2026-08-24", dateTime: "24 Aug 2026, 08:00 AM", direction: "Intake", route: "IV", description: "NS + antibiotics", volumeMl: 600, recordedBy: "Nurse Anjali" },
      { id: "F4", date: "2026-08-24", dateTime: "24 Aug 2026, 08:30 AM", direction: "Output", route: "Urine", description: "Catheter output", volumeMl: 200, recordedBy: "Nurse Anjali" },
    ],
    treatmentPlans: [
      { id: "T3", title: "Sepsis Bundle", description: "IV antibiotics, vasopressor support, hourly monitoring.", orderedBy: "Dr. Rahul Mehta", orderedOn: "24 Aug 2026, 07:00 AM", followStatus: "Following" },
    ],
    handovers: [
      { id: "H2", fromNurse: "Nurse Pooja", fromShift: "Night", toNurse: "Nurse Anjali", toShift: "Morning", handoverDateTime: "24 Aug 2026, 06:10 AM", notes: "BP trending low, vasopressor titrated overnight." },
    ],
    statusLog: [
      { id: "S3", status: "Critical", changedBy: "Nurse Anjali", changedAt: "24 Aug 2026, 08:20 AM", reason: "Hemodynamic instability, doctor informed" },
      { id: "S4", status: "Under Observation", changedBy: "Nurse Pooja", changedAt: "23 Aug 2026, 10:00 PM" },
    ],
  },
  {
    uhid: "UHID12345684", ipdId: "IPD240520-0002", patientName: "Neha Singh", age: 36, gender: "Female", bloodGroup: "O+",
    acuity: "Under Observation", status: "Under Observation", ward: "General Ward", room: "Room-5", bed: "G-108", department: "General Medicine",
    admittingDoctor: "Dr. Priya Nair", admissionDateTime: "20 Aug 2026, 09:45 AM", admittedFrom: "Emergency",
    allergies: [], currentDiagnosis: "Viral Fever", diagnosisCode: "A99",
    contactNumber: "+91 91234 56789",
    assignments: [
      { date: "2026-08-24", shift: "Morning", nurseIds: ["N4"] }, { date: "2026-08-24", shift: "Evening", nurseIds: ["N5"] },
    ],
    vitals: [{ id: "V6", date: "2026-08-24", dateTime: "24 Aug 2026, 08:10 AM", bp: "110/70", pulse: 84, respRate: 20, spo2: 97, temp: 99.1, pain: 2, recordedBy: "Nurse Neha", recordedByRole: "Nurse" }],
    medicines: [{ id: "M7", date: "2026-08-24", medicineName: "Tab. Paracetamol 650mg", strength: "650 mg", route: "Oral", slot: "Morning", scheduledTime: "08:00 AM", status: "Given", urgency: "Urgent", deliveredFromPharmacyAt: "24 Aug 2026, 07:00 AM", givenBy: "Nurse Neha", givenAt: "24 Aug 2026, 08:10 AM" }],
    progressNotes: [{ id: "PN4", date: "2026-08-24", title: "Fever Monitoring Note", author: "Nurse Neha", role: "Nurse", category: "Nursing Update", createdAt: "24 Aug 2026, 08:30 AM", noteText: "Temperature settling with antipyretics. Adequate oral intake." }],
    fluidBalance: [],
    treatmentPlans: [{ id: "T4", title: "Antipyretic Protocol", description: "Administer paracetamol for fever above 100°F.", orderedBy: "Dr. Priya Nair", orderedOn: "24 Aug 2026, 09:45 AM", followStatus: "Following" }],
    handovers: [],
    statusLog: [{ id: "S5", status: "Under Observation", changedBy: "Nurse Neha", changedAt: "24 Aug 2026, 08:15 AM" }],
  },
  {
    uhid: "UHID12345670", ipdId: "IPD240815-0090", patientName: "Meena Kapoor", age: 52, gender: "Female", bloodGroup: "AB+",
    acuity: "Stable", status: "Discharged", ward: "Semi Private", room: "Room-1", bed: "B-201", department: "General Medicine",
    admittingDoctor: "Dr. Priya Nair", admissionDateTime: "15 Aug 2026, 10:00 AM", admittedFrom: "OPD Referral",
    allergies: [], currentDiagnosis: "Community Acquired Pneumonia", diagnosisCode: "J18.9",
    contactNumber: "+91 90000 11122", assignments: [],
    vitals: [{ id: "V7", date: "2026-08-22", dateTime: "22 Aug 2026, 08:00 AM", bp: "118/76", pulse: 74, respRate: 17, spo2: 98, temp: 98.2, pain: 0, recordedBy: "Nurse Sunita", recordedByRole: "Nurse" }],
    medicines: [], progressNotes: [], fluidBalance: [], treatmentPlans: [], handovers: [],
    statusLog: [
      { id: "S6", status: "Discharged", changedBy: "Nurse Sunita", changedAt: "23 Aug 2026, 11:00 AM" },
      { id: "S7", status: "Stable", changedBy: "Nurse Sunita", changedAt: "21 Aug 2026, 09:00 AM" },
    ],
    discharge: {
      finalDiagnosis: "Resolved Community Acquired Pneumonia",
      dischargeSummary: "Patient responded well to IV antibiotics, afebrile for 48 hours, chest clear on auscultation.",
      dischargeMedicines: [{ name: "Tab. Amoxiclav 625mg", dosage: "1 tablet twice daily", duration: "5 days" }, { name: "Tab. Paracetamol 650mg", dosage: "SOS for fever", duration: "5 days" }],
      followUpDate: "30 Aug 2026", followUpInstructions: "Review in OPD with chest X-ray if symptoms recur.",
      dietInstructions: "High protein diet, adequate fluid intake, avoid cold beverages.",
      dischargedByDoctor: "Dr. Priya Nair", doctorApprovedAt: "23 Aug 2026, 10:30 AM",
      nurseApprovedBy: "Nurse Sunita", nurseApprovedAt: "23 Aug 2026, 10:50 AM", sentToBillingAt: "23 Aug 2026, 11:00 AM",
    },
  },
];

export const BEDS: BedInfo[] = [
  { bedId: "ICU-01", ward: "ICU", room: "Bay-1", bedLabel: "ICU-01", status: "Available" },
  { bedId: "ICU-02", ward: "ICU", room: "Bay-1", bedLabel: "ICU-02", status: "Reserved" },
  { bedId: "ICU-03", ward: "ICU", room: "Bay-1", bedLabel: "ICU-03", status: "Occupied", patientUhid: "UHID12345683" },
  { bedId: "ICU-04", ward: "ICU", room: "Bay-1", bedLabel: "ICU-04", status: "Maintenance" },
  { bedId: "B-201", ward: "Semi Private", room: "Room-1", bedLabel: "B-201", status: "Available" },
  { bedId: "B-202", ward: "Semi Private", room: "Room-1", bedLabel: "B-202", status: "Available" },
  { bedId: "B-203", ward: "Semi Private", room: "Room-2", bedLabel: "B-203", status: "Occupied", patientUhid: "UHID12345685" },
  { bedId: "B-204", ward: "Semi Private", room: "Room-2", bedLabel: "B-204", status: "Available" },
  { bedId: "B-205", ward: "Semi Private", room: "Room-3", bedLabel: "B-205", status: "Reserved" },
  { bedId: "B-206", ward: "Semi Private", room: "Room-3", bedLabel: "B-206", status: "Available" },
  { bedId: "B-210", ward: "Semi Private", room: "Room-4", bedLabel: "B-210", status: "Available" },
  { bedId: "G-107", ward: "General Ward", room: "Room-5", bedLabel: "G-107", status: "Available" },
  { bedId: "G-108", ward: "General Ward", room: "Room-5", bedLabel: "G-108", status: "Occupied", patientUhid: "UHID12345684" },
  { bedId: "G-109", ward: "General Ward", room: "Room-5", bedLabel: "G-109", status: "Available" },
  { bedId: "G-110", ward: "General Ward", room: "Room-6", bedLabel: "G-110", status: "Available" },
  { bedId: "G-111", ward: "General Ward", room: "Room-6", bedLabel: "G-111", status: "Maintenance" },
  { bedId: "G-112", ward: "General Ward", room: "Room-7", bedLabel: "G-112", status: "Available" },
];

export function getWardPatientByUhid(uhid: string) {
  return WARD_PATIENTS_FULL.find((p) => p.uhid === uhid);
}
export const EXTRA_VITALS: Record<string, VitalRecordFull[]> = {};
export function getWardVitalsForPatient(uhid: string) {
  const source = WARD_PATIENTS_FULL.find((p) => p.uhid === uhid);
  return [...(EXTRA_VITALS[uhid] ?? []), ...(source?.vitals ?? [])];
}
export function saveWardVital(uhid: string, vital: VitalRecordFull) {
  (EXTRA_VITALS[uhid] ??= []).unshift(vital);
}
export function getNurseName(id: string) {
  return NURSE_DIRECTORY.find((n) => n.id === id)?.name ?? id;
}
export const ALL_WARDS = Object.keys(WARD_STRUCTURE);
export const ALL_ROOMS_BY_WARD = WARD_STRUCTURE;
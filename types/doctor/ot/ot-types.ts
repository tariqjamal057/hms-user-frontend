// types/doctor/ot/ot-types.ts

export type OtStatus =
  | "Scheduled"
  | "Pre-Op Ready"
  | "In Surgery"
  | "In Recovery"
  | "Post-Operative"
  | "Ready for Transfer"
  | "Completed"
  | "Cancelled";

export interface OtPatient {
  uhid: string;
  otId: string;
  patientName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  allergies: string[];
  department: string;
  procedure: string;
  procedureCode: string;
  plannedDateTime: string;
  otRoom: string;
  surgeon: string;
  anesthetist: string;
  scrubNurse: string;
  otTechnician: string;
  status: OtStatus;
  indications: string;
}

export interface PreOpAssessment {
  id: string;
  procedure: string;
  consentTaken: boolean;
  consentSignedBy: string;
  fastingFrom: string;
  comorbidConditions: string[];
  baselineBp: string;
  baselinePulse: string;
  baselineSpo2: string;
  baselineTemp: string;
  riskScore: string;
  notes: string;
  assessedBy: string;
  assessedAt: string;
}

export interface SurgicalSafetyItem {
  id: string;
  step: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface SurgicalCount {
  id: string;
  item: string;
  beforeSurgery: number;
  duringSurgery: number;
  finalCount: number;
  status: "Correct" | "Reconciliation Required";
  countedBy: string;
}

export interface ProcedureRecord {
  id: string;
  procedureName: string;
  surgeons: string[];
  startedAt?: string;
  endedAt?: string;
  findings: string;
  complications: string;
  specimenRemoved: string;
  notes: string;
  documentedBy: string;
}

export interface AnesthesiaRecord {
  id: string;
  type: string;
  plan: string;
  preInductionChecklist: string[];
  airway: string;
  inductionAgent: string;
  vitalMonitoring: string;
  fluidsGiven: string;
  bloodProducts: string;
  intraOpEvents: string;
  postOpPosition: string;
  recordedBy: string;
  recordedAt: string;
}

export interface OtMedicationDose {
  id: string;
  medicine: string;
  dose: string;
  route: string;
  time: string;
  givenBy: string;
  purpose: string;
}

export interface OtConsumable {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  usedBy: string;
}

export interface OtImplant {
  id: string;
  implant: string;
  size: string;
  batchNo: string;
  expiry: string;
  usedBy: string;
  notedAt: string;
}

export interface OtSpecimen {
  id: string;
  specimen: string;
  container: string;
  category: "Histopathology" | "Biopsy" | "Blood" | "Other";
  accessionedNo: string;
  sentTo: string;
  disposition: string;
  sentAt: string;
}

export interface PostOpNote {
  id: string;
  patientCondition: string;
  vitals: string;
  woundStatus: string;
  medications: string;
  instructions: string;
  documentedBy: string;
  documentedAt: string;
}

export interface RecoveryAssessment {
  id: string;
  gcs: number;
  painScore: number;
  spo2: number;
  bp: string;
  pulse: number;
  awareness: "Awake" | "Drowsy" | "Responds to Stimulus" | "Unresponsive";
  airway: "Clear" | "Needs Support";
  dischargeCriteriaMet: boolean;
  toDestination: string;
  assessedBy: string;
  assessedAt: string;
}

export interface OtHandoverEntry {
  id: string;
  toStaff: string;
  toRole: string;
  handoverDateTime: string;
  notes?: string;
}

export interface OtDocument {
  id: string;
  title: string;
  category: string;
  addedBy: string;
  addedAt: string;
  status: string;
}
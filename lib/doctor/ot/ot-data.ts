// lib/doctor/ot/ot-data.ts
import type {
  AnesthesiaRecord,
  OtConsumable,
  OtDocument,
  OtHandoverEntry,
  OtImplant,
  OtMedicationDose,
  OtPatient,
  OtSpecimen,
  OtStatus,
  PostOpNote,
  PreOpAssessment,
  ProcedureRecord,
  RecoveryAssessment,
  SurgicalCount,
  SurgicalSafetyItem,
} from "@/types/doctor/ot/ot-types";

export const CURRENT_SURGEON = {
  name: "Dr. Amit Verma",
  role: "Senior Surgeon",
  staffId: "SRG-001",
};

export const OT_PATIENTS: OtPatient[] = [
  {
    uhid: "UHID12345685", otId: "OT-2026-001", patientName: "Ravi Sharma", age: 48, gender: "Male", bloodGroup: "B+",
    allergies: ["Penicillin"], department: "Cardiology",
    procedure: "Coronary Angioplasty (PCI)", procedureCode: "92920", plannedDateTime: "27 Aug 2026, 12:30 PM",
    otRoom: "OT-1", surgeon: "Dr. Amit Verma", anesthetist: "Dr. Sneha Rao", scrubNurse: "Sr. Nurse Meena",
    otTechnician: "Tech. Raju", status: "Scheduled",
    indications: "Acute MI – Post thrombolysis, ongoing chest pain with 3-vessel disease on angiogram.",
  },
  {
    uhid: "UHID12398211", otId: "OT-2026-002", patientName: "Rahul Roy", age: 30, gender: "Male", bloodGroup: "O+",
    allergies: [], department: "Trauma Surgery",
    procedure: "Exploratory Laparotomy Post Trauma", procedureCode: "49000", plannedDateTime: "27 Aug 2026, 02:00 PM",
    otRoom: "OT-2", surgeon: "Dr. Rakesh Gupta", anesthetist: "Dr. Sneha Rao", scrubNurse: "Sr. Nurse Rajni",
    otTechnician: "Tech. Imran", status: "Pre-Op Ready",
    indications: "Blunt abdominal trauma with suspected splenic rupture — hemodynamically borderline.",
  },
];

export function getOtPatients() { return OT_PATIENTS; }
export function getOtPatientByUhid(uhid: string) {
  return OT_PATIENTS.find((p) => p.uhid === uhid) ?? OT_PATIENTS[0];
}

export const PRE_OP_ASSESSMENTS: Record<string, PreOpAssessment[]> = {
  UHID12345685: [
    {
      id: "PO-1", procedure: "Coronary Angioplasty (PCI)",
      consentTaken: true, consentSignedBy: "Ravi Sharma (patient)", fastingFrom: "10:00 PM (previous night)",
      comorbidConditions: ["Hypertension", "Dyslipidemia", "Type 2 Diabetes"],
      baselineBp: "132/86", baselinePulse: "82", baselineSpo2: "97", baselineTemp: "98.6",
      riskScore: "ASA II – Moderate", notes: "Echo EF 45%. CAD with 3-vessel disease. Continue dual antiplatelet until procedure.",
      assessedBy: "Dr. Amit Verma", assessedAt: "27 Aug 2026, 10:15 AM",
    },
  ],
  UHID12398211: [
    {
      id: "PO-2", procedure: "Exploratory Laparotomy",
      consentTaken: true, consentSignedBy: "Rahul Roy (patient)", fastingFrom: "Nil by mouth since trauma",
      comorbidConditions: [], baselineBp: "96/64", baselinePulse: "112", baselineSpo2: "94", baselineTemp: "98.2",
      riskScore: "ASA IV – Severe systemic disease", notes: "Resuscitated with 2 units PRBC. Cross-match 4 more units for OT.",
      assessedBy: "Dr. Rakesh Gupta", assessedAt: "27 Aug 2026, 01:20 PM",
    },
  ],
};

export const SURGICAL_SAFETY: Record<string, SurgicalSafetyItem[]> = {
  UHID12345685: [
    { id: "SS-1", step: "Patient identity, site & procedure confirmed", completed: true, completedBy: "Dr. Amit Verma", completedAt: "27 Aug 2026, 12:15 PM" },
    { id: "SS-2", step: "Consent verified & signed", completed: true, completedBy: "Dr. Amit Verma", completedAt: "27 Aug 2026, 12:15 PM" },
    { id: "SS-3", step: "Allergy history checked", completed: true, completedBy: "Sr. Nurse Meena", completedAt: "27 Aug 2026, 12:16 PM" },
    { id: "SS-4", step: "Equipment & implants available", completed: false },
    { id: "SS-5", step: "Time out — team introductions & role", completed: false },
  ],
  UHID12398211: [
    { id: "SS-6", step: "Patient identity, site & procedure confirmed", completed: true, completedBy: "Dr. Rakesh Gupta", completedAt: "27 Aug 2026, 01:35 PM" },
    { id: "SS-7", step: "Consent verified & signed", completed: true, completedBy: "Dr. Rakesh Gupta", completedAt: "27 Aug 2026, 01:35 PM" },
    { id: "SS-8", step: "Cross-matched blood available", completed: false },
    { id: "SS-9", step: "Recovery / ICU bed confirmed", completed: false },
  ],
};

export const SURGICAL_COUNTS: Record<string, SurgicalCount[]> = {
  UHID12345685: [
    { id: "SC-1", item: "Sponges / Gauze", beforeSurgery: 10, duringSurgery: 10, finalCount: 10, status: "Correct", countedBy: "Sr. Nurse Meena" },
    { id: "SC-2", item: "Needles", beforeSurgery: 6, duringSurgery: 6, finalCount: 6, status: "Correct", countedBy: "Sr. Nurse Meena" },
    { id: "SC-3", item: "Instruments (retractors, forceps)", beforeSurgery: 12, duringSurgery: 12, finalCount: 12, status: "Correct", countedBy: "Sr. Nurse Meena" },
    { id: "SC-4", item: "Blades", beforeSurgery: 3, duringSurgery: 3, finalCount: 2, status: "Reconciliation Required", countedBy: "Sr. Nurse Meena" },
  ],
  UHID12398211: [
    { id: "SC-5", item: "Sponges / Gauze", beforeSurgery: 15, duringSurgery: 15, finalCount: 15, status: "Correct", countedBy: "Sr. Nurse Rajni" },
    { id: "SC-6", item: "Instruments", beforeSurgery: 18, duringSurgery: 18, finalCount: 18, status: "Correct", countedBy: "Sr. Nurse Rajni" },
  ],
};

export const PROCEDURES: Record<string, ProcedureRecord[]> = {
  UHID12345685: [
    {
      id: "PR-1", procedureName: "Coronary Angioplasty (PCI)",
      surgeons: ["Dr. Amit Verma", "Dr. Priya Nair"],
      findings: "LAD severe stenosis stented with DES 3.5x28mm. Good TIMI-3 flow achieved.",
      complications: "None", specimenRemoved: "None",
      notes: "Hemostasis achieved at puncture site. Patient to be electively ventilated in ICU.",
      documentedBy: "Dr. Amit Verma",
    },
  ],
  UHID12398211: [
    {
      id: "PR-2", procedureName: "Exploratory Laparotomy",
      surgeons: ["Dr. Rakesh Gupta"],
      findings: "Splenic rupture with 1.2L hemoperitoneum. Splenectomy performed.",
      complications: "Bleeding from short gastric vessels — controlled with ligation.",
      specimenRemoved: "Spleen", notes: "Hemostatic packing used initially. Reversed after stabilization.",
      documentedBy: "Dr. Rakesh Gupta",
    },
  ],
};

export const ANESTHESIA: Record<string, AnesthesiaRecord[]> = {
  UHID12345685: [
    {
      id: "AN-1", type: "Monitored Anesthesia Care (MAC) + Local",
      plan: "Femoral access with local lignocaine, conscious sedation with fentanyl + midazolam.",
      preInductionChecklist: ["Informed consent for anesthesia", "Airway assessment - Mallampati II", "Aspiration prophylaxis given", "Monitoring attached (ECG, SpO2, NIBP)"],
      airway: "Supplemental O2 via nasal prongs @ 4 L/min",
      inductionAgent: "Fentanyl 100 mcg + Midazolam 2 mg IV",
      vitalMonitoring: "ECG, SpO2, NIBP q5min, and invasive BP monitoring",
      fluidsGiven: "Normal Saline 500 ml",
      bloodProducts: "None required", intraOpEvents: "Brief hypotension on balloon inflation — self-corrected.",
      postOpPosition: "Trendelenburg position maintained; head of bed elevated 30° post-bypass.",
      recordedBy: "Dr. Sneha Rao", recordedAt: "27 Aug 2026, 12:45 PM",
    },
  ],
  UHID12398211: [
    {
      id: "AN-2", type: "General Anesthesia",
      plan: "Rapid sequence induction, intubation, volume resuscitation with cross-matched blood.",
      preInductionChecklist: ["Airway assessment - Mallampati I", "2 large-bore IV lines secured", "Rapid sequence setup verified", "Suction & backup airway ready"],
      airway: "ETT 8.0 mm cuffed, fixed at 22 cm",
      inductionAgent: "Propofol 120 mg + Succinylcholine 80 mg",
      vitalMonitoring: "ECG, SpO2, ETCO2, NIBP q5min, temperature",
      fluidsGiven: "RL 1.5 L + PRBC 2 units intra-op",
      bloodProducts: "PRBC 2 units transfused", intraOpEvents: "On table bradycardia — atropine 0.6 mg given.",
      postOpPosition: "Semi-recumbent; ventilated in ICU post-op.",
      recordedBy: "Dr. Sneha Rao", recordedAt: "27 Aug 2026, 02:30 PM",
    },
  ],
};

export const OT_MEDICATIONS: Record<string, OtMedicationDose[]> = {
  UHID12345685: [
    { id: "OM-1", medicine: "Inj. Heparin 5000 IU", dose: "5000 IU", route: "IV", time: "12:20 PM", givenBy: "Sr. Nurse Meena", purpose: "Anticoagulation during PCI" },
    { id: "OM-2", medicine: "Tab. Aspirin 75mg", dose: "75 mg", route: "Oral", time: "08:00 AM", givenBy: "Nurse Kavita", purpose: "Dual antiplatelet (with clopidogrel)" },
    { id: "OM-3", medicine: "Inj. Pantoprazole 40mg", dose: "40 mg", route: "IV", time: "12:25 PM", givenBy: "Sr. Nurse Meena", purpose: "Stress ulcer prophylaxis" },
  ],
  UHID12398211: [
    { id: "OM-4", medicine: "Inj. Cefuroxime 1.5g", dose: "1.5 g", route: "IV", time: "01:40 PM", givenBy: "Sr. Nurse Rajni", purpose: "Prophylactic antibiotic" },
    { id: "OM-5", medicine: "Inj. Ondansetron 4mg", dose: "4 mg", route: "IV", time: "01:45 PM", givenBy: "Sr. Nurse Rajni", purpose: "Antiemetic" },
    { id: "OM-6", medicine: "Inj. Paracetamol 1g", dose: "1 g", route: "IV", time: "02:10 PM", givenBy: "Sr. Nurse Rajni", purpose: "Analgesia" },
  ],
};

export const OT_CONSUMABLES: Record<string, OtConsumable[]> = {
  UHID12345685: [
    { id: "OC-1", item: "Surgical gloves (sterile)", quantity: 8, unit: "pairs", usedBy: "OT team" },
    { id: "OC-2", item: "Suture — 3-0 Prolene", quantity: 2, unit: "units", usedBy: "Dr. Amit Verma" },
    { id: "OC-3", item: "Cannula 18G", quantity: 3, unit: "units", usedBy: "Dr. Sneha Rao" },
  ],
  UHID12398211: [
    { id: "OC-4", item: "Abdominal packs", quantity: 10, unit: "units", usedBy: "Dr. Rakesh Gupta" },
    { id: "OC-5", item: "Suture — 1-0 Vicryl (loop)", quantity: 4, unit: "units", usedBy: "Dr. Rakesh Gupta" },
  ],
};

export const OT_IMPLANTS: Record<string, OtImplant[]> = {
  UHID12345685: [
    { id: "OI-1", implant: "Drug-Eluting Stent (DES)", size: "3.5 x 28 mm", batchNo: "B-88412", expiry: "12/2027", usedBy: "Dr. Amit Verma", notedAt: "27 Aug 2026, 12:40 PM" },
  ],
  UHID12398211: [],
};

export const OT_SPECIMENS: Record<string, OtSpecimen[]> = {
  UHID12345685: [],
  UHID12398211: [
    { id: "OS-1", specimen: "Spleen (ruptured)", container: "Formalin jar", category: "Histopathology", accessionedNo: "H-2026-8841", sentTo: "Pathology Lab", disposition: "Sent to Histopathology", sentAt: "27 Aug 2026, 03:10 PM" },
  ],
};

export const POST_OP_NOTES: Record<string, PostOpNote[]> = {
  UHID12345685: [
    {
      id: "PON-1", patientCondition: "Hemodynamically stable, conscious and oriented.",
      vitals: "BP 120/80, Pulse 78, SpO2 98% on RA", woundStatus: "Femoral access site dry, no hematoma",
      medications: "Dual antiplatelet, statin, beta-blocker, PPI", instructions: "Bed rest 6 hours, keep sandbag at puncture site, monitor toe & puncture site hourly.",
      documentedBy: "Dr. Amit Verma", documentedAt: "27 Aug 2026, 03:30 PM",
    },
  ],
  UHID12398211: [
    {
      id: "PON-2", patientCondition: "Stable, transferred ventilated to ICU.",
      vitals: "BP 104/66, Pulse 96, SpO2 96% on mechanical ventilation", woundStatus: "Midline laparotomy wound covered, drains in situ",
      medications: "IV antibiotics, analgesia, PPI, insulin sliding scale", instructions: "ICU monitoring, nil per oral, keep NG tube on low suction, document drain output hourly.",
      documentedBy: "Dr. Rakesh Gupta", documentedAt: "27 Aug 2026, 04:05 PM",
    },
  ],
};

export const RECOVERY_ASSESSMENTS: Record<string, RecoveryAssessment[]> = {
  UHID12345685: [
    { id: "RC-1", gcs: 15, painScore: 2, spo2: 98, bp: "118/78", pulse: 76, awareness: "Awake", airway: "Clear", dischargeCriteriaMet: true, toDestination: "ICU-A / Ravi Sharma", assessedBy: "Sr. Nurse Meena", assessedAt: "27 Aug 2026, 04:00 PM" },
  ],
  UHID12398211: [
    { id: "RC-2", gcs: 14, painScore: 5, spo2: 96, bp: "108/70", pulse: 98, awareness: "Drowsy", airway: "Clear", dischargeCriteriaMet: false, toDestination: "ICU-B / Rahul Roy", assessedBy: "Sr. Nurse Rajni", assessedAt: "27 Aug 2026, 04:40 PM" },
  ],
};

export const OT_HANDOVERS: Record<string, OtHandoverEntry[]> = {
  UHID12345685: [
    { id: "OH-1", toStaff: "ICU Nurse Kavita", toRole: "Intensive Care Nurse", handoverDateTime: "27 Aug 2026, 04:10 PM", notes: "Post-PCI, puncture site monitored, dual antiplatelet continued." },
  ],
  UHID12398211: [
    { id: "OH-2", toStaff: "ICU Nurse Anjali", toRole: "Intensive Care Nurse", handoverDateTime: "27 Aug 2026, 04:45 PM", notes: "Ventilated, drains in situ, bleeding risk — observe output hourly." },
  ],
};

export const OT_DOCUMENTS: Record<string, OtDocument[]> = {
  UHID12345685: [
    { id: "OD-1", title: "Informed Consent — PCI", category: "Consent", addedBy: "Dr. Amit Verma", addedAt: "27 Aug 2026, 10:20 AM", status: "Signed" },
    { id: "OD-2", title: "Pre-Anesthesia Checkup", category: "Anesthesia", addedBy: "Dr. Sneha Rao", addedAt: "27 Aug 2026, 10:40 AM", status: "Completed" },
    { id: "OD-3", title: "Angiogram Report & Films", category: "Imaging", addedBy: "Radiology", addedAt: "26 Aug 2026, 06:00 PM", status: "Attached" },
  ],
  UHID12398211: [
    { id: "OD-4", title: "Emergency Consent — Laparotomy", category: "Consent", addedBy: "Dr. Rakesh Gupta", addedAt: "27 Aug 2026, 01:30 PM", status: "Signed" },
    { id: "OD-5", title: "Cross-Match Report", category: "Blood Bank", addedBy: "Lab", addedAt: "27 Aug 2026, 01:15 PM", status: "Attached" },
  ],
};

export function getPreOp(uhid: string) { return PRE_OP_ASSESSMENTS[uhid] ?? []; }
export function getSafetyItems(uhid: string) { return SURGICAL_SAFETY[uhid] ?? []; }
export function getCounts(uhid: string) { return SURGICAL_COUNTS[uhid] ?? []; }
export function getProcedures(uhid: string) { return PROCEDURES[uhid] ?? []; }
export function getAnesthesia(uhid: string) { return ANESTHESIA[uhid] ?? []; }
export function getOtMedications(uhid: string) { return OT_MEDICATIONS[uhid] ?? []; }
export function getOtConsumables(uhid: string) { return OT_CONSUMABLES[uhid] ?? []; }
export function getOtImplants(uhid: string) { return OT_IMPLANTS[uhid] ?? []; }
export function getOtSpecimens(uhid: string) { return OT_SPECIMENS[uhid] ?? []; }
export function getPostOpNotes(uhid: string) { return POST_OP_NOTES[uhid] ?? []; }
export function getRecoveryAssessments(uhid: string) { return RECOVERY_ASSESSMENTS[uhid] ?? []; }
export function getOtHandovers(uhid: string) { return OT_HANDOVERS[uhid] ?? []; }
export function getOtDocuments(uhid: string) { return OT_DOCUMENTS[uhid] ?? []; }

export const OT_STATUS_OPTIONS: OtStatus[] = [
  "Scheduled",
  "Pre-Op Ready",
  "In Surgery",
  "In Recovery",
  "Post-Operative",
  "Ready for Transfer",
  "Completed",
  "Cancelled",
];
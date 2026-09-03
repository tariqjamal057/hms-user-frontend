// sample-data/beds.ts
// Sample bed availability records for Admission Desk, Nurse Admin, and ICU views.

export type SampleBedStatus =
  | "Available"
  | "Occupied"
  | "Cleaning"
  | "Reserved"
  | "Isolation"
  | "Maintenance";

export interface SampleBed {
  bedId: string;
  ward: string;
  wardCategory: string;
  room: string;
  bedNumber: string;
  status: SampleBedStatus;
  occupiedByUhid?: string;
  patientName?: string;
  isolationType?: string;
}

export const SAMPLE_BEDS: SampleBed[] = [
  { bedId: "B-001", ward: "General Ward", wardCategory: "General", room: "G-1", bedNumber: "G-14", status: "Occupied", occupiedByUhid: "UHID-2026-000982", patientName: "Ravi Sharma" },
  { bedId: "B-002", ward: "General Ward", wardCategory: "General", room: "G-1", bedNumber: "G-15", status: "Available" },
  { bedId: "B-003", ward: "General Ward", wardCategory: "General", room: "G-2", bedNumber: "G-21", status: "Cleaning" },
  { bedId: "B-004", ward: "ICU", wardCategory: "ICU", room: "ICU", bedNumber: "ICU-05", status: "Available" },
  { bedId: "B-005", ward: "ICU", wardCategory: "ICU", room: "ICU", bedNumber: "ICU-06", status: "Occupied", occupiedByUhid: "UHID-2026-001260", patientName: "Debasish Roy" },
  { bedId: "B-006", ward: "ICU", wardCategory: "ICU", room: "ICU", bedNumber: "ICU-07", status: "Isolation", isolationType: "Contact" },
  { bedId: "B-007", ward: "Private Ward", wardCategory: "Private", room: "P-1", bedNumber: "P-11", status: "Reserved" },
  { bedId: "B-008", ward: "General Ward", wardCategory: "General", room: "G-3", bedNumber: "G-31", status: "Available" },
];

export function getSampleBedById(bedId: string): SampleBed | undefined {
  return SAMPLE_BEDS.find((b) => b.bedId === bedId);
}

export function getAvailableBeds(): SampleBed[] {
  return SAMPLE_BEDS.filter((b) => b.status === "Available");
}

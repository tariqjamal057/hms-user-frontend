// components/patient-detail/patient-detail-types.ts
// Shared patient-profile types used by PatientDetailShell, PatientProfileCard
// and every module that adapts its patient record into a normalized profile.
import type { ComponentType } from "react";

export type PatientTab = {
  value: string;
  label: string;
  content: React.ReactNode;
  /** When true, the tab is reachable programmatically (via activeTab prop or
   *  imperative switch) but its trigger is not rendered in the tab bar. */
  hidden?: boolean;
};

// Normalized patient model — adapt concrete module types (OPD/IPD/Emergency/ICU/OT)
// into this shape before rendering.
export type PatientDetailData = {
  uhid: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  // Optional tinted acuity pill (e.g. "Critical", "Under Observation", "Stable")
  acuity?: string;
  // Module-specific id (IPD ID / ICU ID / Appointment No / Emergency No / OT ID)
  moduleId: string;
  moduleIdLabel: string;
  // Location segments joined with " / " (e.g. ["Ward A", "101", "2"] or ["Bed 3", "ICU"])
  locationParts?: string[];
  // Optional trailing text appended after the location
  metaLine?: string;
  // Cause of problem / active diagnosis / chief complaint shown as a compact pill
  // at the top of the profile card.
  causeOfProblem?: string;
  // Fallback info grid when the page does not pass `infoFields`
  fallbackInfoFields?: InfoField[];
  // Optional contact number shown in the profile header
  contact?: string;
  // Assigned nurse + current shift — appended to the info grid on all doctor/nurse detail pages
  assignedNurse?: string;
  currentShift?: string;
  // Optional quick vitals strip rendered below the info grid
  quickVitals?: QuickVital[];
};

export type PatientListItem = {
  uhid: string;
  name: string;
  subtitle: string;
};

export type QuickVital = {
  label: string;
  value: string;
  unit?: string;
  /** Optional icon rendered at the top of the card */
  icon?: ComponentType<{ className?: string }>;
  /** Optional timestamp caption shown under the label, e.g. "20 May 2024, 08:00 AM" */
  recordedOn?: string;
  /** Tailwind bg/border/text classes override for this card, e.g. "bg-blue-50 border-blue-200 text-blue-700" */
  color?: string;
};

export type InfoField = {
  label: string;
  value: string;
  highlight?: boolean;
};

export type StatusOption = {
  label: string;
  value: string;
  color: string;
  dot: string;
};
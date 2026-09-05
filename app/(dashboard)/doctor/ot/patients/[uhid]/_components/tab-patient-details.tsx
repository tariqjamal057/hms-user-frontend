// app/(dashboard)/doctor/ot/patients/[uhid]/_components/tab-patient-details.tsx
"use client";

import { Fingerprint, Heart, ShieldAlert, Stethoscope, UserRound } from "lucide-react";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { OtPatient } from "@/types/doctor/ot/ot-types";
import { OtSectionHeader } from "./ot-section-header";

export function TabPatientDetails({
  patient,
  onNext,
}: {
  patient: OtPatient;
  onNext?: () => void;
}) {
  return (
    <div className="space-y-5">
      <OtSectionHeader
        icon={<UserRound className="h-5 w-5" />}
        title="Patient Details"
        subtitle="Demographics and profile verified against the admission record"
        tone="from-indigo-500 to-sky-500"
        right={
          onNext && (
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Proceed to Pre-Op →
            </button>
          )
        }
      />

      {patient.allergies.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<ShieldAlert className="h-4 w-4" />}
          title="Allergy Alert"
          body={`${patient.patientName} is allergic to: ${patient.allergies.join(", ")}. Notify the anesthesia team and avoid these agents.`}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <InfoTileCard title="Patient Name" icon={<UserRound className="h-3.5 w-3.5" />} tone="blue" value={patient.patientName} />
        <InfoTileCard title="UHID" icon={<Fingerprint className="h-3.5 w-3.5" />} tone="slate" value={patient.uhid} />
        <InfoTileCard title="Age / Gender" icon={<UserRound className="h-3.5 w-3.5" />} tone="purple" value={`${patient.age} yrs · ${patient.gender}`} />
        <InfoTileCard title="Blood Group" icon={<Heart className="h-3.5 w-3.5" />} tone="rose" value={patient.bloodGroup} />
        <InfoTileCard title="Department" icon={<Stethoscope className="h-3.5 w-3.5" />} tone="cyan" value={patient.department} />
        <InfoTileCard title="OT Room" icon={<Fingerprint className="h-3.5 w-3.5" />} tone="amber" value={patient.otRoom} />
        <InfoTileCard title="Procedure" icon={<Stethoscope className="h-3.5 w-3.5" />} tone="emerald" value={patient.procedure} />
        <InfoTileCard title="Status" icon={<ShieldAlert className="h-3.5 w-3.5" />} tone="slate" value={patient.status} />
      </div>
    </div>
  );
}
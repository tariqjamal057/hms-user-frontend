// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-overview.tsx
"use client";
import { ArrowRight, CheckCircle2, Clock3, FileText, PackageX } from "lucide-react";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { PillButton } from "@/components/forms/pill-button";
import { InfoCard } from "@/components/patient-detail/info-card";
import { AllergyAlertCard } from "@/components/patient-detail/allergy-alert-card";
import type { EmarDose, NurseIpdPatient } from "@/types/nurse/ipd/nurse-ipd-types";
import { getEmarForPatient, getVitalsForPatient } from "@/lib/nurse/ipd/nurse-ipd-data";

export function TabOverview({
  patient,
  onNext,
  doses: dosesProp,
}: {
  patient: NurseIpdPatient;
  onNext: () => void;
  /** Optional pre-fetched doses. When omitted, falls back to nurse IPD dataset. */
  doses?: EmarDose[];
}) {
  const vitals = getVitalsForPatient(patient.uhid);
  const latestVitals = vitals[0];
  const doses = dosesProp ?? getEmarForPatient(patient.uhid);
  const given = doses.filter((d) => d.status === "Given");
  const notGiven = doses.filter((d) => d.status === "Not Given" || d.status === "Pending");
  const outOfStock = doses.filter((d) => d.status === "Out of Stock");
  const urgentPending = doses.filter((d) => d.urgency === "Urgent" && d.status !== "Given");

  return (
    <div className="space-y-5">
      {/* Current Diagnosis — unified `InfoTileCard` */}
      <InfoTileCard
        title="Current Diagnosis"
        icon={<FileText className="h-3.5 w-3.5" />}
        tone="purple"
        value={patient.currentDiagnosis}
        subtitle={`ICD-10: ${patient.diagnosisCode}`}
      />

      {/* Latest vitals — unified `CurrentVitals` (ICU tiles: RR + Pain) */}
      <CurrentVitals
        showIcuTiles
        showWeightHeight={false}
        vitals={
          latestVitals
            ? {
                bp: latestVitals.bp,
                pulse: String(latestVitals.pulse),
                temp: String(latestVitals.temp),
                spo2: String(latestVitals.spo2),
                respRate: String(latestVitals.respRate),
                pain: String(latestVitals.pain),
              }
            : {}
        }
        gridClassName="grid-cols-3 sm:grid-cols-6"
      />
      {latestVitals && (
        <p className="text-xs text-slate-400">Recorded {latestVitals.dateTime} by {latestVitals.recordedBy}</p>
      )}

      {/* Today's medicines — three unified `InfoCard`s (Given / Pending / Out of Stock) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InfoCard
          title="Given"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
          limit={3}
          items={given.map((dose) => ({
            key: dose.id,
            title: dose.medicineName,
            badges: [{ label: "Given", tone: "emerald" }, { label: dose.slot, tone: "slate" }],
            subtitle: `${dose.slot} • ${dose.givenAt ?? ""}`,
          }))}
          emptyText="No doses given yet."
        />

        <InfoCard
          title="Not Given / Pending"
          icon={<Clock3 className="h-4 w-4" />}
          tone="amber"
          limit={3}
          items={notGiven.map((dose) => ({
            key: dose.id,
            title: dose.medicineName,
            badges: [
              { label: dose.slot, tone: "slate" },
              { label: dose.urgency, tone: dose.urgency === "Urgent" ? "red" : "amber" },
            ],
            subtitle: `${dose.slot} • ${dose.scheduledTime}`,
          }))}
          emptyText="All scheduled doses are up to date."
        />

        <InfoCard
          title="Out of Stock"
          icon={<PackageX className="h-4 w-4" />}
          tone="red"
          limit={3}
          items={outOfStock.map((dose) => ({
            key: dose.id,
            title: dose.medicineName,
            badges: [{ label: "Out of Stock", tone: "red" }, { label: dose.slot, tone: "slate" }],
            subtitle: dose.remarks ?? "Awaiting pharmacy stock",
          }))}
          emptyText="No stock issues currently."
        />
      </div>

      {/* Urgent medicines — unified `AllergyAlertCard` */}
      {urgentPending.length > 0 && (
        <AllergyAlertCard
          title={`${urgentPending.length} Urgent Medicine(s) Require Attention`}
          items={urgentPending.map((d) => ({
            key: `${d.id}`,
            name: d.medicineName,
            badges: [{ label: d.slot, tone: "slate" }],
            severity: "severe",
            note: `${d.strength} • ${d.route} • scheduled ${d.scheduledTime}`,
          }))}
        />
      )}

      <div className="flex justify-end">
        <PillButton icon={ArrowRight} onClick={onNext}>
          Next: Vitals Monitoring
        </PillButton>
      </div>
    </div>
  );
}

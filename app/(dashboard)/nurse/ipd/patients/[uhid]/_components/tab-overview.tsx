// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-overview.tsx
"use client";
import { ArrowRight, CheckCircle2, Clock3, FileText, PackageX, Siren } from "lucide-react";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { PillButton } from "@/components/forms/pill-button";
import { UrgencyBadge } from "../../_components/nurse-ipd-badges";
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

      {/* Today's medicines — three unified `InfoTileCard`s with list children */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InfoTileCard
          title="Given"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="emerald"
          count={given.length}
        >
          <div className="space-y-2">
            {given.slice(0, 4).map((dose) => (
              <div key={dose.id} className="rounded-lg border border-emerald-100 bg-white p-2.5">
                <p className="text-sm font-medium text-slate-800">{dose.medicineName}</p>
                <p className="text-xs text-slate-500">{dose.slot} · {dose.givenAt}</p>
              </div>
            ))}
            {given.length === 0 && <p className="text-xs text-slate-400">No doses given yet.</p>}
          </div>
        </InfoTileCard>

        <InfoTileCard
          title="Not Given / Pending"
          icon={<Clock3 className="h-3.5 w-3.5" />}
          tone="amber"
          count={notGiven.length}
        >
          <div className="space-y-2">
            {notGiven.slice(0, 4).map((dose) => (
              <div key={dose.id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-white p-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{dose.medicineName}</p>
                  <p className="text-xs text-slate-500">{dose.slot} · {dose.scheduledTime}</p>
                </div>
                <UrgencyBadge urgency={dose.urgency} />
              </div>
            ))}
            {notGiven.length === 0 && <p className="text-xs text-slate-400">All scheduled doses are up to date.</p>}
          </div>
        </InfoTileCard>

        <InfoTileCard
          title="Out of Stock"
          icon={<PackageX className="h-3.5 w-3.5" />}
          tone="red"
          count={outOfStock.length}
        >
          <div className="space-y-2">
            {outOfStock.map((dose) => (
              <div key={dose.id} className="rounded-lg border border-red-100 bg-white p-2.5">
                <p className="text-sm font-medium text-slate-800">{dose.medicineName}</p>
                <p className="text-xs text-slate-500">{dose.remarks ?? "Awaiting pharmacy stock"}</p>
              </div>
            ))}
            {outOfStock.length === 0 && <p className="text-xs text-slate-400">No stock issues currently.</p>}
          </div>
        </InfoTileCard>
      </div>

      {/* Urgent alert — unified `InfoAlertCard` */}
      {urgentPending.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<Siren className="h-3.5 w-3.5" />}
          title={`${urgentPending.length} urgent medicine(s) require attention`}
          body={urgentPending.map((d) => `${d.medicineName} (${d.slot})`).join("\n")}
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

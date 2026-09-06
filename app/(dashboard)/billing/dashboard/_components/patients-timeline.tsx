// app/(dashboard)/billing/dashboard/_components/patients-timeline.tsx
"use client";
import type { BillingPatient } from "@/types/billing/ipd/billing-types";
import { buildBillingTimeline } from "@/lib/billing/ipd/billing-analytics";
import { BillingTimeline } from "@/app/(dashboard)/billing/ipd/all-billings/_components/billing-timeline";
import { ClaimsTab } from "./claims-tab";

interface Props {
  patients: BillingPatient[];
  selectedUhid: string;
  onOpenPatient: (uhid: string) => void;
}

export function TimetableOne({ patients, selectedUhid, onOpenPatient }: Props) {
  const patient = patients.find((p) => p.uhid === selectedUhid) ?? patients[0];
  if (!patient) return null;
  const events = buildBillingTimeline(patient);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {patients.map((p) => (
            <button
              key={p.uhid}
              type="button"
              onClick={() => onOpenPatient(p.uhid)}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                p.uhid === patient.uhid
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p.patientName}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Financial timeline · <span className="font-medium text-slate-700">{patient.patientName}</span>{" "}
          <span className="font-mono">{patient.ipdId}</span> ·{" "}
          <span className="font-mono">{patient.uhid}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Chronological Account Activity
          </p>
          <BillingTimeline events={events} />
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Payer &amp; Coverage
          </p>
          <ClaimsTab patient={patient} />
        </div>
      </div>
    </div>
  );
}
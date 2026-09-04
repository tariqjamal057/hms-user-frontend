// app/(dashboard)/billing/ipd/_components/drawer/section-bill-summary.tsx
"use client";
import {
  BedDouble,
  CheckCircle2,
  Hospital,
  Info,
  PhoneCall,
  Stethoscope,
  ToggleLeft,
  ToggleRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { PillButton } from "@/components/forms/pill-button";
import type { BillingPatient } from "@/types/billing/ipd/billing-types";
import { computeBilling, formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { BillingStatusBadge } from "../billing-badges";

export function SectionBillSummary({ patient }: { patient: BillingPatient }) {
  const computed = computeBilling(patient);

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white shadow-sm">
            {patient.patientName.charAt(0)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-slate-800">
                {patient.patientName}
              </h3>
              <BillingStatusBadge status={computed.status} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {patient.age} yrs · {patient.gender} ·{" "}
              <span className="font-mono text-slate-700">{patient.uhid}</span>
            </p>
          </div>
        </div>
        <PillButton icon={Hospital} disabled>
          {patient.ipdId}
        </PillButton>
      </div>

      {/* Patient info tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoTileCard
          title="Bed / Ward"
          icon={<BedDouble className="h-3.5 w-3.5" />}
          tone="purple"
          value={`${patient.bed} · ${patient.ward}`}
          subtitle={patient.room}
        />
        <InfoTileCard
          title="Attending Doctor"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          tone="blue"
          value={patient.admittingDoctor}
        />
        <InfoTileCard
          title="Contact"
          icon={<PhoneCall className="h-3.5 w-3.5" />}
          tone="cyan"
          value={patient.contactNumber}
        />
        <InfoTileCard
          title="Guardian"
          icon={<User className="h-3.5 w-3.5" />}
          tone="emerald"
          value={patient.guardianName ?? "—"}
        />
        <InfoTileCard
          title="IPD ID"
          icon={<Hospital className="h-3.5 w-3.5" />}
          tone="purple"
          value={patient.ipdId}
        />
        <InfoTileCard
          title="Admitted On"
          icon={<Info className="h-3.5 w-3.5" />}
          tone="slate"
          value={patient.admissionDateTime}
        />
      </div>

      {/* Universal payment alert */}
      <InfoAlertCard
        tone={patient.universalPaymentEnabled ? "emerald" : "amber"}
        icon={
          patient.universalPaymentEnabled ? (
            <ToggleRight className="h-3.5 w-3.5" />
          ) : (
            <ToggleLeft className="h-3.5 w-3.5" />
          )
        }
        title={`Universal Payment: ${patient.universalPaymentEnabled ? "Enabled" : "Disabled"}`}
        body={
          patient.universalPaymentEnabled
            ? "Pharmacy and diagnostic/lab charges are included in this IPD bill's total."
            : "Pharmacy and diagnostic/lab charges are excluded here — collected separately by those departments."
        }
      />

      {/* Billing summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200">
            <Info className="h-3.5 w-3.5" />
          </span>
          <p className="text-sm font-bold text-slate-800">Billing Summary</p>
        </div>
        <div className="space-y-2.5 text-sm">
          <Row label="Gross Charges Total" value={formatCurrency(computed.grossTotal)} />
          {computed.excludedPharmacyLab > 0 && (
            <Row
              label="Excluded Pharmacy/Lab (billed separately)"
              value={formatCurrency(computed.excludedPharmacyLab)}
              muted
            />
          )}
          <Row
            label="Total Discount"
            value={`- ${formatCurrency(computed.totalDiscount)}`}
            tone="text-rose-600"
          />
          <Row label="Net Payable" value={formatCurrency(computed.netPayable)} bold />
          {patient.coverage && patient.coverage.type !== "None" && (
            <Row
              label={`${patient.coverage.type} Coverage Received`}
              value={`- ${formatCurrency(computed.coverageReceived)}`}
              tone="text-blue-600"
            />
          )}
          <Row
            label="Patient Responsibility"
            value={formatCurrency(computed.patientResponsibility)}
            bold
          />
          <Row
            label="Total Collected"
            value={formatCurrency(computed.totalCollected)}
            tone="text-emerald-600"
          />
          <div className="my-1 border-t border-dashed border-slate-200" />
          <Row
            label="Balance Due"
            value={formatCurrency(computed.dueAmount)}
            bold
            big
            tone={computed.dueAmount > 0 ? "text-red-600" : "text-emerald-600"}
          />
        </div>
        {computed.status === "Fully Paid" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Bill fully settled. No further payment required.
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  big,
  tone,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  big?: boolean;
  tone?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`text-slate-500 ${muted ? "text-xs italic" : ""}`}
      >
        {label}
      </span>
      <span
        className={`${bold ? "font-bold" : "font-medium"} ${
          big ? "text-lg" : ""
        } ${tone ?? "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}

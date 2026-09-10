// app/(dashboard)/billing/emergency/all-billings/[uhid]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Banknote, CheckCircle2 } from "lucide-react";
import {
  PatientDetailShell,
  type PatientDetailData,
  type PatientTab,
  type PatientListItem,
} from "@/components/patient-detail/patient-detail-shell";
import { PillButton } from "@/components/forms/pill-button";
import type {
  BillingPatient,
  PaymentRecord,
} from "@/types/billing/ipd/billing-types";
import {
  BILLING_PATIENTS,
  getBillingPatientByUhid,
} from "@/lib/billing/emergency/billing-data";
import { computeBilling } from "@/lib/billing/ipd/billing-calculations";
import { SectionDiscounts } from "../../../ipd/all-billings/_components/drawer/section-discounts";
import { SectionPayments } from "../../../ipd/all-billings/_components/drawer/section-payments";
import { SectionCoverage } from "../../../ipd/all-billings/_components/drawer/section-coverage";
import { SectionTimeline } from "../../../ipd/all-billings/_components/drawer/section-timeline";
import { SectionAuditTrail } from "../../../ipd/all-billings/_components/drawer/section-audit-trail";
import { SectionRefunds } from "../../../ipd/all-billings/_components/drawer/section-refunds";
import { CollectPaymentModal } from "../../../ipd/all-billings/_components/drawer/collect-payment-modal";
import { buildBillingTimeline, computeDischargeSettlement } from "@/lib/billing/ipd/billing-analytics";
import { ClaimsTab } from "../../../dashboard/_components/claims-tab";
import { SettlementCard } from "../../../dashboard/_components/settlement-card";
import { SectionBillSummary } from "../../../ipd/all-billings/_components/drawer/section-bill-summary";
import { SectionCharges } from "../../../ipd/all-billings/_components/drawer/section-charges";

const patientsPath = "/billing/emergency";

export default function BillingPatientDetailPage() {
  const params = useParams();
  const uhid = params.uhid as string;
  const sourcePatient = getBillingPatientByUhid(uhid);
  const [patient, setPatient] = useState<BillingPatient | undefined>(sourcePatient);
  const [collecting, setCollecting] = useState(false);

  if (!patient) return notFound();

  const computed = computeBilling(patient);

  const patientList: PatientListItem[] = BILLING_PATIENTS.map((p) => ({
    uhid: p.uhid,
    name: p.patientName,
    subtitle: `${p.ipdId} · ${p.ward} · ${p.bed}`,
  }));

  const detail: PatientDetailData = {
    uhid: patient.uhid,
    name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: "",
    allergies: [],
    moduleId: patient.ipdId,
    moduleIdLabel: "ER ID",
    locationParts: [patient.ward, patient.bed],
    contact: patient.contactNumber,
    fallbackInfoFields: [
      { label: "Doctor", value: patient.admittingDoctor },
      { label: "Arrived On", value: patient.admissionDateTime },
      { label: "Guardian", value: patient.guardianName ?? "—" },
      { label: "Bill Status", value: computed.status },
    ],
  };

  function handleCollect(payment: PaymentRecord) {
    setPatient((prev) =>
      prev ? { ...prev, payments: [payment, ...prev.payments] } : prev,
    );
    setCollecting(false);
  }

  const headerActions =
    computed.dueAmount > 0 ? (
      <PillButton
        icon={Banknote}
        variant="gradient"
        onClick={() => setCollecting(true)}
      >
        Collect Payment
      </PillButton>
    ) : (
      <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Bill fully settled
      </div>
    );

  const tabs: PatientTab[] = [
    {
      value: "summary",
      label: "Bill Summary",
      content: <SectionBillSummary patient={patient} />,
    },
    {
      value: "charges",
      label: "Charges",
      content: (
        <SectionCharges
          charges={patient.charges}
          universalPaymentEnabled={patient.universalPaymentEnabled}
        />
      ),
    },
    {
      value: "discounts",
      label: "Discounts",
      content: <SectionDiscounts discounts={patient.discounts} />,
    },
    {
      value: "payments",
      label: "Payments",
      content: <SectionPayments payments={patient.payments} />,
    },
    {
      value: "coverage",
      label: "Ayushman / Insurance",
      content: (
        <SectionCoverage
          netPayable={computeBilling(patient).netPayable}
          coverage={patient.coverage}
        />
      ),
    },
    {
      value: "timeline",
      label: "Timeline",
      content: <SectionTimeline patient={patient} />,
    },
    {
      value: "audit",
      label: "Audit Trail",
      content: <SectionAuditTrail events={buildBillingTimeline(patient)} />,
    },
    {
      value: "refunds",
      label: "Refunds",
      content: <SectionRefunds refunds={patient.refunds} />,
    },
    {
      value: "claims",
      label: "Insurance / Claims",
      content: <ClaimsTab patient={patient} />,
    },
    {
      value: "settlement",
      label: "Discharge Settlement",
      content: (
        <SettlementCard
          settlement={computeDischargeSettlement(patient)}
          onCollect={() => setCollecting(true)}
        />
      ),
    },
  ];

  return (
    <>
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath={patientsPath}
        tabs={tabs}
        defaultTab="summary"
        headerActions={headerActions}
      />
      <CollectPaymentModal
        open={collecting}
        dueAmount={computed.dueAmount}
        onCancel={() => setCollecting(false)}
        onCollect={handleCollect}
      />
    </>
  );
}
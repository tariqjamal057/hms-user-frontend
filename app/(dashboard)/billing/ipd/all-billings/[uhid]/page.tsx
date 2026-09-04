// app/(dashboard)/billing/ipd/all-billings/[uhid]/page.tsx
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
} from "@/lib/billing/ipd/billing-data";
import { computeBilling } from "@/lib/billing/ipd/billing-calculations";
import { SectionBillSummary } from "../_components/drawer/section-bill-summary";
import { SectionCharges } from "../_components/drawer/section-charges";
import { SectionDiscounts } from "../_components/drawer/section-discounts";
import { SectionPayments } from "../_components/drawer/section-payments";
import { SectionCoverage } from "../_components/drawer/section-coverage";
import { CollectPaymentModal } from "../_components/drawer/collect-payment-modal";

const patientsPath = "/billing/ipd/all-billings";

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
    moduleIdLabel: "IPD ID",
    locationParts: [patient.ward, patient.room, patient.bed],
    contact: patient.contactNumber,
    fallbackInfoFields: [
      { label: "Doctor", value: patient.admittingDoctor },
      { label: "Admitted On", value: patient.admissionDateTime },
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

// app/(dashboard)/doctor/opd/appointments/_components/opd-tabs.tsx
"use client";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PrescriptionTemplate } from "@/components/prescription/prescription-template";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import { InfoCard } from "@/components/patient-detail/info-card";
import { AllergyAlertCard } from "@/components/patient-detail/allergy-alert-card";
import { SummaryCard } from "@/components/patient-detail/summary-card";
import { VitalsHistoryTable } from "@/components/patient-detail/vitals-history-table";
import { ConsultationHistory } from "@/components/patient-detail/consultation-history";
import type { PatientFullProfile } from "@/lib/doctor/opd/opd-mock-data";
import {
  Pill, TestTube, Printer, Download,
} from "lucide-react";

// ─── Overview (owns prescription print ref) ───
export function OpdOverview({ patient }: { patient: PatientFullProfile }) {
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: prescriptionRef,
    documentTitle: `Prescription-${patient?.appointmentNo || "OPD"}`,
  });

  const hasClinicalData = !!(patient.vitals || patient.medicineHistory?.length || patient.labHistory?.length);
  const canDownloadPrescription = hasClinicalData;

  const prescriptionData = {
    patientName: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    uhid: patient.uhid,
    visitId: patient.appointmentNo,
    consultant: patient.doctor,
    date: new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    vitals: patient.vitals,
    complaint: patient.reason,
    diagnoses: patient.consultationHistory?.[0] ? [{ name: patient.consultationHistory[0].diagnosis, icd10: "TBD", type: "active" }] : [],
    medicines: (patient.medicineHistory || []).map((m) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency, duration: m.duration, instructions: "As directed" })),
    labOrders: (patient.labHistory || []).map((l) => ({ test: l.test, priority: l.priority })),
    advice: "Continue current medications. Follow-up as advised.",
  };

  return (
    <>
      <div className="hidden">
        <PrescriptionTemplate ref={prescriptionRef} {...prescriptionData} />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {patient.vitals && (
          <CurrentVitals
            vitals={patient.vitals}
            gridClassName="grid-cols-4"
            showWeightHeight={false}
          />
        )}

        <AllergyAlertCard
          items={(patient.allergies || []).map((a) => ({ name: a, severity: a.toLowerCase().includes("rash") ? "severe" : a.toLowerCase().includes("gastritis") ? "moderate" : "mild" }))}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InfoCard
            title="Active Medicines"
            icon={<Pill className="h-4 w-4" />}
            tone="purple"
            limit={3}
            items={patient.medicineHistory.map((med) => ({
              key: med.name,
              title: med.name,
              badges: [{ label: "Active", tone: "blue" }],
              subtitle: `${med.dosage} • ${med.frequency} • Started ${med.startDate}`,
            }))}
            emptyText="No medicines recorded"
          />
          <InfoCard
            title="Recent Lab Reports"
            icon={<TestTube className="h-4 w-4" />}
            tone="amber"
            limit={3}
            items={patient.labHistory.map((lab) => ({
              key: lab.test,
              title: lab.test,
              badges: [{ label: lab.status, tone: lab.status === "Normal" ? "emerald" : "amber" }],
              subtitle: `${lab.result} • ${lab.date}`,
            }))}
            emptyText="No lab reports recorded"
          />
        </div>

        {patient.chronicConditions && patient.chronicConditions.length > 0 && (
          <SummaryCard
            variant="chips"
            title="Chronic Conditions"
            tone="blue"
            chips={patient.chronicConditions}
          />
        )}

        <SummaryCard
          variant="action"
          title="Download E-Prescription"
          description="Latest vitals, medicines, lab orders, and diagnosis"
          tone="blue"
          icon={<Printer className="h-5 w-5 sm:h-6 sm:w-6" />}
          buttonLabel="Download PDF"
          buttonIcon={Download}
          onAction={handlePrint}
          actionDisabled={!canDownloadPrescription}
          note={!canDownloadPrescription ? "Prescription download will be available once clinical data is recorded." : undefined}
        />
      </div>
    </>
  );
}

// ─── Vitals History ───
export function OpdVitalsTab({ patient }: { patient: PatientFullProfile }) {
  return (
    <VitalsHistoryTable rows={patient.vitalsHistory || []} />
  );
}

// ─── Consultations ───
export function OpdConsultationsTab({ patient }: { patient: PatientFullProfile }) {
  return (
    <ConsultationHistory
      consultations={patient.consultationHistory || []}
      defaultOpen
    />
  );
}

// ─── Medicines ───
export function OpdMedicinesTab({ patient }: { patient: PatientFullProfile }) {
  return (
    <InfoCard
      title="Current & Previous Medicines"
      icon={<Pill className="h-4 w-4 sm:h-5 sm:w-5" />}
      tone="purple"
      limit={50}
      items={patient.medicineHistory.map((med) => ({
        key: med.name,
        title: med.name,
        badges: [{ label: "Active", tone: "blue" }],
        subtitle: `${med.dosage} • ${med.frequency} • ${med.duration} • Started ${med.startDate}`,
      }))}
      emptyText="No medicine history recorded for this patient"
    />
  );
}

// ─── Lab Reports ───
export function OpdLabsTab({ patient }: { patient: PatientFullProfile }) {
  return (
    <InfoCard
      title="Lab Reports History"
      icon={<TestTube className="h-4 w-4 sm:h-5 sm:w-5" />}
      tone="amber"
      limit={50}
      items={patient.labHistory.map((lab) => ({
        key: lab.test,
        title: lab.test,
        badges: [{ label: lab.status, tone: lab.status === "Normal" ? "emerald" : "amber" }],
        subtitle: `${lab.result} • ${lab.date} • Priority: ${lab.priority}`,
      }))}
      emptyText="No lab reports recorded for this patient"
    />
  );
}

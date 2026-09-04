// app/doctor/ipd/diagnosis-update/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  FileText,
  StickyNote,
  Pill,
  PlusCircle,
  Activity,
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PillButton } from "@/components/forms/pill-button";
import { QuickActionsCard } from "@/components/patient-detail/quick-actions-card";

import {
  WARD_ROUND_PATIENTS,
  getPatientByUhid,
} from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getLabAlertsMini } from "@/lib/doctor/ipd/clinical-examination-data";
import { getDiagnosisData } from "@/lib/doctor/ipd/diagnosis-data";
import { DiagnosisDrawer, type DiagnosisDraft } from "@/components/consultation/diagnosis-drawer";
import { CurrentDiagnosesTable } from "./_components/current-diagnoses-table";
import { ResolvedDiagnosesTable } from "./_components/resolved-diagnoses-table";

import type {
  CurrentDiagnosis,
  DiagnosisStatus,
  ResolvedDiagnosis,
} from "@/types/doctor/ipd/diagnosis-types";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";

import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { QuickVitalsStrip } from "@/components/patient-detail/quick-vitals-strip";
import { LabAlertsCard } from "../clinical-examination/_components/lab-alerts-card";

export default function DiagnosisUpdatePage({
  uhid: propUhid,
  embedded = false,
}: { uhid?: string; embedded?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = propUhid ?? searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const vitals = useMemo(() => getVitalsForPatient(uhid)[0], [uhid]);
  const labAlerts = useMemo(() => getLabAlertsMini(uhid), [uhid]);
  const initialData = useMemo(() => getDiagnosisData(uhid), [uhid]);

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [addDiagnosisOpen, setAddDiagnosisOpen] = useState(false);
  const [assessmentDateTime, setAssessmentDateTime] =
    useState("2024-05-20T10:45");
  const [currentDiagnoses, setCurrentDiagnoses] = useState<CurrentDiagnosis[]>(
    initialData.currentDiagnoses,
  );
  const [resolvedDiagnoses, setResolvedDiagnoses] = useState<
    ResolvedDiagnosis[]
  >(initialData.resolvedDiagnoses);
  const [clinicalImpression, setClinicalImpression] = useState(
    initialData.clinicalImpression,
  );

  function handleAddDiagnosisDrafts(items: DiagnosisDraft[]) {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const mapped: CurrentDiagnosis[] = items.map((item) => ({
      id: `D-${Date.now()}-${item.id}`,
      diagnosis: item.name,
      isPrimary: false,
      type:
        item.type === "active"
          ? "Clinical"
          : item.type === "chronic"
            ? "Co-morbidity"
            : "Provisional",
      diagnosedOn: today,
      status: "Active",
      icd10: item.icd10 || undefined,
    }));
    setCurrentDiagnoses((prev) => [...prev, ...mapped]);
    toast.success(
      `${mapped.length} diagnosis${mapped.length > 1 ? "es" : ""} added to current diagnoses`,
    );
  }

  function handleRemoveDiagnosis(id: string) {
    console.log("Removing diagnosis:", id);
    setCurrentDiagnoses((prev) => prev.filter((d) => d.id !== id));
  }

  function handleDiagnosisStatusChange(id: string, status: DiagnosisStatus) {
    const diagnosis = currentDiagnoses.find((item) => item.id === id);

    if (!diagnosis) return;

    if (status === "Resolved") {
      const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const resolvedDiagnosis: ResolvedDiagnosis = {
        id: diagnosis.id,
        diagnosis: diagnosis.diagnosis,
        type: diagnosis.type,
        diagnosedOn: diagnosis.diagnosedOn,
        resolvedOn: today,
      };

      setCurrentDiagnoses((previous) =>
        previous.filter((item) => item.id !== id),
      );

      setResolvedDiagnoses((previous) => [resolvedDiagnosis, ...previous]);

      toast.success(`"${diagnosis.diagnosis}" marked as resolved`);
      return;
    }

    setCurrentDiagnoses((previous) =>
      previous.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    toast.success(`Diagnosis status updated to ${status}`);
  }

  function handleSelectPatient(newUhid: string) {
    console.log("Patient changed in Diagnosis Update to:", newUhid);
    router.push(`/doctor/ipd/diagnosis-update?uhid=${newUhid}`);
  }

  function handleBack() {
    console.log("Back to Clinical Examination for UHID:", uhid);
    router.push(`/doctor/ipd/review-vitals?uhid=${uhid}`);
  }

  function handleNextProgressNote() {
    console.log("Navigating to Progress Note for UHID:", uhid, {
      currentDiagnoses,
      clinicalImpression,
    });
    router.push(`/doctor/ipd/progress-note?uhid=${uhid}`);
  }

  function handleViewAllVitals() {
    router.push(`/doctor/ipd/review-vitals?uhid=${uhid}`);
  }

  function handleViewAllLabResults() {
    router.push(`/doctor/ipd/review-lab-results?uhid=${uhid}`);
  }

  function handleAddProgressNote() {
    router.push(`/doctor/ipd/progress-note?uhid=${uhid}`);
  }

  function handleViewLabResults() {
    router.push(`/doctor/ipd/review-lab-results?uhid=${uhid}`);
  }

  function handleMedicineOrders() {
    router.push(`/doctor/ipd/medicine-orders?uhid=${uhid}`);
  }

  function handleClinicalExamination() {
    router.push(`/doctor/ipd/clinical-examination?uhid=${uhid}`);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {/* Patient header */}
        {!embedded && (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                  {patient.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {patient.patientName}{" "}
                    <PatientStatusBadge status={patient.status} />
                  </p>
                  <p className="text-xs text-slate-400">
                    {patient.age} Y / {patient.gender} · UHID: {patient.uhid} ·
                    IPD: {patient.ipdId} · Bed:{" "}
                    {patient.wardRoomBed.split("/").pop()?.trim()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:items-center lg:gap-8">
                <InfoBlock
                  label="Ward / Room / Bed"
                  value={patient.wardRoomBed}
                />
                <InfoBlock label="Department" value={patient.department} />
                <InfoBlock
                  label="Attending Doctor"
                  value={patient.admittingDoctor}
                />
                <InfoBlock
                  label="Admission Date"
                  value={patient.admissionDateTime}
                />
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 lg:w-auto"
                onClick={() => setChangePatientOpen(true)}
              >
                Change Patient
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Page heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Diagnosis Update
            </h1>
            <p className="text-xs text-slate-400">
              Review and update patient diagnosis, active problems and
              clinical impressions.
            </p>
          </div>
        </div>

        {/* Main layout: 2-column grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
          {/* Left column */}
          <div className="min-w-0 space-y-5">
            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Current Diagnoses
                  </p>
                  <PillButton
                    size="sm"
                    variant="gradient"
                    icon={PlusCircle}
                    onClick={() => setAddDiagnosisOpen(true)}
                  >
                    Add Diagnosis
                  </PillButton>
                </div>
                <CurrentDiagnosesTable
                  diagnoses={currentDiagnoses}
                  onRemove={handleRemoveDiagnosis}
                  onStatusChange={handleDiagnosisStatusChange}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">
                  Clinical Impression (Summary) *
                </p>
                <Textarea
                  rows={5}
                  maxLength={1000}
                  value={clinicalImpression}
                  onChange={(e) => setClinicalImpression(e.target.value)}
                />
                <p className="text-right text-xs text-slate-400">
                  {clinicalImpression.length}/1000
                </p>
              </CardContent>
            </Card>

            {/* Resolved / Inactive diagnoses */}
            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  Resolved / Inactive Diagnoses{" "}
                  <Info className="h-3.5 w-3.5 text-slate-300" />
                </p>
                <ResolvedDiagnosesTable diagnoses={resolvedDiagnoses} />
              </CardContent>
            </Card>

            {/* Footer note */}
            {!embedded && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" /> Ensure diagnosis is
                  updated based on latest findings and clinical judgement.
                </p>
              </div>
            )}

            {/* Navigation */}
            {!embedded && (
              <div className="flex justify-between gap-2">
                <Button variant="outline" className="gap-2" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handleNextProgressNote}
                >
                  Next: Progress Note <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6">
            {vitals && (
              <Card className="border-slate-200 shadow-sm p-0">
                <CardContent className="py-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Vitals Trend
                  </p>
                  <QuickVitalsStrip
                    vitals={[
                      { label: "BP", value: vitals.bp, unit: "mmHg", icon: Activity, recordedOn: vitals.dateTime },
                      { label: "Pulse", value: String(vitals.pulse), unit: "/min", icon: HeartPulse, recordedOn: vitals.dateTime },
                      { label: "Temp", value: String(vitals.temp), unit: "°F", icon: Thermometer, recordedOn: vitals.dateTime },
                      { label: "RR", value: String(vitals.respRate), unit: "/min", icon: Wind, recordedOn: vitals.dateTime },
                      { label: "SpO₂", value: String(vitals.spo2), unit: "%", icon: Droplets, recordedOn: vitals.dateTime },
                      { label: "Pain", value: String(vitals.pain), unit: "/10", icon: Gauge, recordedOn: vitals.dateTime },
                    ]}
                    gridClassName="grid-cols-1 sm:grid-cols-2"
                  />
                </CardContent>
              </Card>
            )}
            <LabAlertsCard
              alerts={labAlerts}
              onViewAll={handleViewAllLabResults}
            />
            <QuickActionsCard
              actions={[
                {
                  label: "View Lab Results",
                  icon: FileText,
                  onClick: handleViewLabResults,
                },
                {
                  label: "Add Progress Note",
                  icon: StickyNote,
                  onClick: handleAddProgressNote,
                },
                {
                  label: "Medicine Orders",
                  icon: Pill,
                  onClick: handleMedicineOrders,
                },
              ]}
            />
          </div>
        </div>

      {!embedded && (
        <ChangePatientDialog
          patients={WARD_ROUND_PATIENTS}
          currentUhid={patient.uhid}
          open={changePatientOpen}
          onOpenChange={setChangePatientOpen}
          onSelectPatient={handleSelectPatient}
        />
      )}

      <DiagnosisDrawer
        open={addDiagnosisOpen}
        onOpenChange={setAddDiagnosisOpen}
        onSubmit={handleAddDiagnosisDrafts}
      />
    </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}


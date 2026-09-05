// app/ipd/doctor/treatment-plan/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Info, Plus, ClipboardCheck, FileText, StickyNote, Upload, Activity, HeartPulse, Thermometer, Wind, Droplets, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QuickActionsCard } from "@/components/patient-detail/quick-actions-card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormTextarea, DateField } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { PillButton } from "@/components/forms/pill-button";

import { WARD_ROUND_PATIENTS, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getLabAlertsMini } from "@/lib/doctor/ipd/clinical-examination-data";
import { getDiagnosisData } from "@/lib/doctor/ipd/diagnosis-data";
import { getTreatmentPlanData } from "@/lib/doctor/ipd/treatment-plan-data";
import { TreatmentPlanTable } from "./_components/treatment-plan-table";
import { TreatmentPlanDialog } from "./_components/treatment-plan-dialog";
import { Badge } from "@/components/ui/badge";
import type { TreatmentPlanItem } from "@/types/doctor/ipd/treatment-plan-types";
import { QuickVitalsStrip } from "@/components/patient-detail/quick-vitals-strip";
import { LabAlertsCard } from "../clinical-examination/_components/lab-alerts-card";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { PatientProfileCard } from "@/components/patient-detail/patient-profile-card";
import { wardRoundProfileDetail } from "@/lib/patient-detail/patient-profile-data";

export default function TreatmentPlanPage({
  uhid: propUhid,
  embedded = false,
}: { uhid?: string; embedded?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = propUhid ?? searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const profile = useMemo(() => wardRoundProfileDetail(patient), [patient]);
  const vitals = useMemo(() => getVitalsForPatient(uhid)[0], [uhid]);
  const labAlerts = useMemo(() => getLabAlertsMini(uhid), [uhid]);
  const diagnoses = useMemo(() => getDiagnosisData(uhid).currentDiagnoses, [uhid]);
  const initialPlan = useMemo(() => getTreatmentPlanData(uhid), [uhid]);

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TreatmentPlanItem | null>(null);

  const [planDateTime, setPlanDateTime] = useState("2024-05-20T11:00");
  const [goalsText, setGoalsText] = useState(initialPlan.goals.map((g) => `• ${g}`).join("\n"));
  const [items, setItems] = useState<TreatmentPlanItem[]>(initialPlan.items);
  const [additionalNotes, setAdditionalNotes] = useState(initialPlan.additionalNotes);
  const [reviewAfter, setReviewAfter] = useState(initialPlan.reviewAfter);
  const [nextReviewDate, setNextReviewDate] = useState(initialPlan.nextReviewDate);
  const [reviewFocus, setReviewFocus] = useState(initialPlan.reviewFocus);
  const [discussedWithPatient, setDiscussedWithPatient] = useState(initialPlan.discussedWithPatient);

  function handleSelectPatient(newUhid: string) {
    console.log("Patient changed in Treatment Plan to:", newUhid);
    router.push(`/doctor/ipd/treatment-plan?uhid=${newUhid}`);
  }

  function handleOpenAddPlan() {
    setEditingItem(null);
    setPlanDialogOpen(true);
  }

  function handleSavePlan(item: TreatmentPlanItem) {
    if (editingItem) {
      setItems((prev) => prev.map((row) => (row.id === item.id ? item : row)));
      toast.success("Treatment plan updated");
    } else {
      setItems((prev) => [...prev, item]);
      toast.success("Treatment plan added");
    }
  }

  function handleEdit(item: TreatmentPlanItem) {
    console.log("Edit treatment plan:", item);
    setEditingItem(item);
    setPlanDialogOpen(true);
  }

  function handleDelete(id: string) {
    console.log("Delete treatment plan:", id);
    setItems((prev) => prev.filter((row) => row.id !== id));
    toast.success("Treatment plan deleted");
  }

  function handleBack() {
    router.push(`/doctor/ipd/investigation-orders?uhid=${uhid}`);
  }

  function handleNextDischarge() {
    router.push(`/doctor/ipd/discharge-decision?uhid=${uhid}`);
  }

  function handleQuickAction(label: string) {
    console.log("Quick action:", label, "for", uhid);
    toast.info(label);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {!embedded && (
          <PatientProfileCard
            patient={profile}
            patientsPath="/doctor/ipd/patients"
            subtitle="IPD Patient"
            headerActions={
              <PillButton variant="outline" className="w-full gap-2 lg:w-auto" onClick={() => setChangePatientOpen(true)}>
                Change Patient
              </PillButton>
            }
          />
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Treatment Plan</h1>
                <p className="text-xs text-slate-400">Define and document the treatment plan for the patient.</p>
              </div>
      
            </div>

            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">1. Treatment Goals</p>
                <FormTextarea
                  label=""
                  rows={6}
                  maxLength={1000}
                  value={goalsText}
                  onChange={setGoalsText}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-800">2. Plan of Care</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Medical Management",
                      "Monitoring",
                      "Diet & Lifestyle",
                      "Therapy & Rehabilitation",
                      "Patient Education",
                    ].map((tab) => (
                      <Badge key={tab} variant="outline" className="border-slate-200 bg-white text-slate-500">
                        {tab}
                      </Badge>
                    ))}
                  </div>
                </div>

                <TreatmentPlanTable items={items} onEdit={handleEdit} onDelete={handleDelete} />

                <div className="mt-4">
                  <PillButton variant="outline" className="gap-2" onClick={handleOpenAddPlan}>
                    <Plus className="h-4 w-4" /> Add Plan
                  </PillButton>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="py-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">3. Additional Notes (Optional)</p>
                  <FormTextarea
                    label=""
                    rows={6}
                    maxLength={1000}
                    value={additionalNotes}
                    onChange={setAdditionalNotes}
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="space-y-4 py-4">
                  <p className="text-sm font-semibold text-slate-800">4. Follow Up Plan</p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SingleSelect
                      label="Review After"
                      value={reviewAfter}
                      onChange={setReviewAfter}
                      options={[
                        { value: "1 Day", label: "1 Day" },
                        { value: "2 Days", label: "2 Days" },
                        { value: "3 Days", label: "3 Days" },
                        { value: "1 Week", label: "1 Week" },
                      ]}
                    />

                    <DateField
                      label="Next Review Date"
                      value={nextReviewDate}
                      onChange={setNextReviewDate}
                    />
                  </div>

                  <SingleSelect
                    label="Review Focus"
                    value={reviewFocus}
                    onChange={setReviewFocus}
                    options={[
                      { value: "Symptom relief, BP & Sugar control", label: "Symptom relief, BP & Sugar control" },
                      { value: "Hemodynamic monitoring", label: "Hemodynamic monitoring" },
                      { value: "Medication response", label: "Medication response" },
                    ]}
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      checked={discussedWithPatient}
                      onCheckedChange={(checked) => setDiscussedWithPatient(Boolean(checked))}
                      id="discussedWithPatient"
                    />
                    <label htmlFor="discussedWithPatient" className="text-sm text-slate-600">
                      Plan discussed with patient / attendant
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!embedded && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" /> Treatment plan will be considered while placing orders in the next steps.
                </p>
              </div>
            )}

            {!embedded && (
              <div className="flex justify-between gap-2">
                <PillButton variant="outline" className="gap-2" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </PillButton>
                <PillButton className="gap-2" onClick={handleNextDischarge}>
                  Next: Discharge Decission <ArrowRight className="h-4 w-4" />
                </PillButton>
              </div>
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            {vitals && (
              <Card className="border-slate-200 shadow-sm py-0">
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

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Active Clinical Problems</p>
                  <button className="text-xs font-medium text-blue-600 hover:underline">Edit</button>
                </div>
                <div className="space-y-2.5">
                  {diagnoses.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700">{d.diagnosis}</span>
                      <Badge
                        variant="outline"
                        className={d.isPrimary ? "border-blue-200 bg-blue-50 text-blue-600" : "border-amber-200 bg-amber-50 text-amber-600"}
                      >
                        {d.isPrimary ? "Primary" : "Co-morbidity"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <LabAlertsCard alerts={labAlerts} />

            <QuickActionsCard
              actions={[
                {
                  label: "View Clinical Examination",
                  icon: ClipboardCheck,
                  onClick: () => handleQuickAction("View Clinical Examination"),
                },
                {
                  label: "View Lab Results",
                  icon: FileText,
                  onClick: () => handleQuickAction("View Lab Results"),
                },
                {
                  label: "Add Clinical Note",
                  icon: StickyNote,
                  onClick: () => handleQuickAction("Add Clinical Note"),
                },
                {
                  label: "Upload Document",
                  icon: Upload,
                  onClick: () => handleQuickAction("Upload Document"),
                },
              ]}
            />
          </div>
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

      <TreatmentPlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        editingItem={editingItem}
        onSave={handleSavePlan}
      />
    </div>
  );
}


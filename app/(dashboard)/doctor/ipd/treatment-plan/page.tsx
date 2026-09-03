// app/ipd/doctor/treatment-plan/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Info, Plus, ClipboardCheck, FileText, StickyNote, Upload, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { WARD_ROUND_PATIENTS, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getLabAlertsMini } from "@/lib/doctor/ipd/clinical-examination-data";
import { getDiagnosisData } from "@/lib/doctor/ipd/diagnosis-data";
import { getTreatmentPlanData } from "@/lib/doctor/ipd/treatment-plan-data";
import { TreatmentPlanTable } from "./_components/treatment-plan-table";
import { TreatmentPlanDialog } from "./_components/treatment-plan-dialog";
import { Badge } from "@/components/ui/badge";
import type { TreatmentPlanItem } from "@/types/doctor/ipd/treatment-plan-types";
import { LatestVitalsMini } from "../clinical-examination/_components/latest-vitals-mini";
import { LabAlertsMini } from "../clinical-examination/_components/lab-alerts-mini";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";

export default function TreatmentPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
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
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                {patient.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  {patient.patientName} <PatientStatusBadge status={patient.status} />
                </p>
                <p className="text-xs text-slate-400">
                  {patient.age} Y / {patient.gender} · UHID: {patient.uhid} · IPD: {patient.ipdId} · Bed: {patient.wardRoomBed.split("/").pop()?.trim()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:items-center lg:gap-8">
              <InfoBlock label="Ward / Room / Bed" value={patient.wardRoomBed} />
              <InfoBlock label="Department" value={patient.department} />
              <InfoBlock label="Attending Doctor" value={patient.admittingDoctor} />
              <InfoBlock label="Admission Date" value={patient.admissionDateTime} />
            </div>

            <Button variant="outline" className="w-full gap-2 lg:w-auto" onClick={() => setChangePatientOpen(true)}>
              Change Patient
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Treatment Plan</h1>
                <p className="text-xs text-slate-400">Define and document the treatment plan for the patient.</p>
              </div>
      
            </div>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">1. Treatment Goals</p>
                <Textarea
                  rows={6}
                  maxLength={1000}
                  value={goalsText}
                  onChange={(e) => setGoalsText(e.target.value)}
                  className="leading-7"
                />
                <p className="text-right text-xs text-slate-400">{goalsText.length}/1000</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
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
                  <Button variant="outline" className="gap-2" onClick={handleOpenAddPlan}>
                    <Plus className="h-4 w-4" /> Add Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">3. Additional Notes (Optional)</p>
                  <Textarea
                    rows={6}
                    maxLength={1000}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                  <p className="text-right text-xs text-slate-400">{additionalNotes.length}/1000</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="space-y-4 py-4">
                  <p className="text-sm font-semibold text-slate-800">4. Follow Up Plan</p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-500">Review After</label>
                      <Select value={reviewAfter} onValueChange={setReviewAfter}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 Day">1 Day</SelectItem>
                          <SelectItem value="2 Days">2 Days</SelectItem>
                          <SelectItem value="3 Days">3 Days</SelectItem>
                          <SelectItem value="1 Week">1 Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Next Review Date</label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={nextReviewDate}
                        onChange={(e) => setNextReviewDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">Review Focus</label>
                    <Select value={reviewFocus} onValueChange={setReviewFocus}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Symptom relief, BP & Sugar control">Symptom relief, BP & Sugar control</SelectItem>
                        <SelectItem value="Hemodynamic monitoring">Hemodynamic monitoring</SelectItem>
                        <SelectItem value="Medication response">Medication response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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

            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <p className="flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" /> Treatment plan will be considered while placing orders in the next steps.
              </p>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" className="gap-2" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleNextDischarge}>
                Next: Discharge Decission <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            <LatestVitalsMini vitals={vitals} />

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

            <LabAlertsMini alerts={labAlerts} />

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-1 py-3">
                <p className="mb-2 px-2 text-sm font-semibold text-slate-800">Quick Actions</p>
                <QuickAction icon={ClipboardCheck} label="View Clinical Examination" onClick={() => handleQuickAction("View Clinical Examination")} />
                <QuickAction icon={FileText} label="View Lab Results" onClick={() => handleQuickAction("View Lab Results")} />
                <QuickAction icon={StickyNote} label="Add Clinical Note" onClick={() => handleQuickAction("Add Clinical Note")} />
                <QuickAction icon={Upload} label="Upload Document" onClick={() => handleQuickAction("Upload Document")} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ChangePatientDialog
        patients={WARD_ROUND_PATIENTS}
        currentUhid={patient.uhid}
        open={changePatientOpen}
        onOpenChange={setChangePatientOpen}
        onSelectPatient={handleSelectPatient}
      />

      <TreatmentPlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        editingItem={editingItem}
        onSave={handleSavePlan}
      />
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="whitespace-nowrap text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
    >
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
    </button>
  );
}

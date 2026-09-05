"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { History, Plus, ShieldAlert, Signature } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ConsultationShell } from "@/components/consultation/consultation-shell";
import { SelectedItemsList } from "@/components/consultation/selected-items-list";
import { PillButton } from "@/components/forms/pill-button";
import {
  DateField,
  FormButton,
  FormTextarea,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import type {
  PatientDetailData,
  PatientListItem,
} from "@/components/patient-detail/patient-detail-shell";
import { PatientTimelineCard } from "./_components/patient-timeline-card";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import { AllergyAlertDialog } from "./_components/allergy-alert-dialog";
import { DiagnosisDrawer, type DiagnosisDraft } from "@/components/consultation/diagnosis-drawer";
import { MedicineDrawer, type MedicineDraft } from "@/components/consultation/medicine-drawer";
import { LabDrawer, type LabDraft } from "@/components/consultation/lab-drawer";
import { getPatientByUhid } from "@/lib/doctor/opd/opd-mock-data";

type Step = 1 | 2 | 3 | 4;

const DIAG_TYPE_BADGE: Record<"provisional" | "active" | "chronic", string> = {
  provisional: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  chronic: "bg-red-50 text-red-700 border-red-200",
};

const DEPT_BADGE: Record<"pathology" | "radiology", string> = {
  pathology: "bg-blue-50 text-blue-700 border-blue-200",
  radiology: "bg-violet-50 text-violet-700 border-violet-200",
};

const PRIORITY_BADGE: Record<"routine" | "priority", string> = {
  routine: "bg-slate-100 text-slate-600 border-slate-200",
  priority: "bg-orange-50 text-orange-700 border-orange-200",
};

interface Diagnosis {
  id: string;
  name: string;
  icd10: string;
  type: "provisional" | "active" | "chronic";
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface LabOrder {
  id: string;
  test: string;
  department: "pathology" | "radiology";
  priority: "routine" | "priority";
}

export default function DoctorConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const uhid = params.uhid as string;

  const patient = getPatientByUhid(uhid);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isAllergyOpen, setIsAllergyOpen] = useState(false);
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [isLabDialogOpen, setIsLabDialogOpen] = useState(false);
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = useState(false);

  const [vitals, setVitals] = useState({
    bp: patient?.vitals?.bp || "",
    pulse: patient?.vitals?.pulse || "",
    temp: patient?.vitals?.temp || "",
    spo2: patient?.vitals?.spo2 || "",
    weight: "",
    height: "",
    notes: "",
  });

  const [complaint, setComplaint] = useState(patient?.reason || "");
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [advice, setAdvice] = useState("");
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [disposition, setDisposition] = useState("");

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">Patient Not Found</p>
            <p className="text-sm text-slate-500 mt-2">No patient record found for UHID: {uhid}</p>
            <PillButton onClick={() => router.push("/doctor/opd/appointments")} className="mt-4">
              Back to Appointments
            </PillButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Vitals & Triage", desc: "Record clinical baseline" },
    { num: 2, label: "Consultation", desc: "Notes & diagnosis" },
    { num: 3, label: "E-Prescription", desc: "Medicines & advice" },
    { num: 4, label: "Orders & Close", desc: "Labs & follow-up" },
  ];

  const allergies = patient.allergies ?? [];
  const hasAllergies = allergies.length > 0;

  const detail: PatientDetailData = {
    uhid: patient.uhid,
    name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    allergies,
    moduleId: patient.appointmentNo,
    moduleIdLabel: "Appointment No",
    causeOfProblem: patient.reason,
    fallbackInfoFields: [
      { label: "Patient Type", value: patient.patientType },
      { label: "Visit Type", value: patient.visitType },
      { label: "Doctor", value: patient.doctor },
    ],
    quickVitals: [
      { label: "BP", value: patient.vitals?.bp || "—", unit: "mmHg" },
      { label: "SpO₂", value: patient.vitals?.spo2 || "—", unit: "%" },
      { label: "Temp", value: patient.vitals?.temp || "—", unit: "°F" },
      { label: "Pulse", value: patient.vitals?.pulse || "—", unit: "/min" },
    ],
  };

  const patientList: PatientListItem[] = [];

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <PillButton
        variant="outline"
        size="sm"
        icon={History}
        onClick={() => router.push(`/doctor/opd/appointments/${uhid}`)}
      >
        Patient History
      </PillButton>
      <PillButton
        variant={hasAllergies ? "danger" : "outline"}
        size="sm"
        icon={ShieldAlert}
        onClick={() => setIsAllergyOpen(true)}
      >
        {hasAllergies
          ? `${allergies.length} Allergy Alert${allergies.length > 1 ? "s" : ""}`
          : "No Allergies"}
      </PillButton>
    </div>
  );

  function handleAddMedicine(med: Medicine) {
    setMedicines((prev) => [...prev, med]);
  }

  function handleRemoveMedicine(id: string) {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }

  function handleAddLabOrder(order: LabOrder) {
    setLabOrders((prev) => [...prev, order]);
  }

  function handleRemoveLabOrder(id: string) {
    setLabOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function handleAddDiagnosis(diagnosis: Diagnosis) {
    setDiagnoses((prev) => [...prev, diagnosis]);
  }

  function handleRemoveDiagnosis(id: string) {
    setDiagnoses((prev) => prev.filter((d) => d.id !== id));
  }

  function handleCompleteConsultation() {
    if (!vitals.bp || !complaint || diagnoses.length === 0) {
      alert("Please complete vitals, chief complaint, and at least one diagnosis.");
      return;
    }
    alert("Consultation completed! Prescription and orders saved.");
    router.push("/doctor/opd/appointments");
  }

  return (
    <ConsultationShell
      patient={detail}
      patientList={patientList}
      patientsPath="/doctor/opd/appointments"
      steps={steps}
      currentStep={currentStep}
      onStepClick={(s) => setCurrentStep(s as Step)}
      headerActions={headerActions}
    >
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Workflow Panels */}
          <div className="xl:col-span-2 space-y-6">
            {/* Step 1: Vitals */}
            {currentStep === 1 && (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-800">Vitals & Triage Assessment</h2>
                    <p className="text-sm text-slate-500 mt-1">Verify nursing observations before beginning the consultation.</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <SuffixedInput label="Blood Pressure" value={vitals.bp} onChange={(v) => setVitals({ ...vitals, bp: v })} suffix="mmHg" />
                    <SuffixedInput label="Pulse Rate" value={vitals.pulse} onChange={(v) => setVitals({ ...vitals, pulse: v })} suffix="/min" />
                    <SuffixedInput label="Temperature" value={vitals.temp} onChange={(v) => setVitals({ ...vitals, temp: v })} suffix="F" />
                    <SuffixedInput label="SpO₂" value={vitals.spo2} onChange={(v) => setVitals({ ...vitals, spo2: v })} suffix="%" />
                    <SuffixedInput label="Weight" value={vitals.weight} onChange={(v) => setVitals({ ...vitals, weight: v })} suffix="kg" placeholder="e.g. 72" />
                    <SuffixedInput label="Height" value={vitals.height} onChange={(v) => setVitals({ ...vitals, height: v })} suffix="cm" />
                  </div>
                  <FormTextarea
                    label="Nurse/Doctor Notes"
                    value={vitals.notes}
                    onChange={(v) => setVitals({ ...vitals, notes: v })}
                    rows={3}
                    className="mt-6 space-y-2"
                    placeholder="Any pain score, concern, abnormal reading or observation..."
                  />
                  <div className="mt-6 flex justify-end">
                    <FormButton onClick={() => setCurrentStep(2)}>
                      Continue to Consultation
                    </FormButton>
                  </div>
                </CardContent>
                
              </Card>
            )}

            {/* Step 2: Consultation */}
            {currentStep === 2 && (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-800">Consultation Notes & Diagnosis</h2>
                    <p className="text-sm text-slate-500 mt-1">Document structured clinical reasoning.</p>
                  </div>
                  <FormTextarea
                    label="Chief Complaint & History"
                    value={complaint}
                    onChange={setComplaint}
                    rows={5}
                    placeholder="Symptoms, duration, and relevant history..."
                    className="space-y-2"
                  />
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-slate-700">Diagnosis</label>
                        <FormButton size="sm" onClick={() => setIsDiagnosisDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Diagnosis
                        </FormButton>
                    </div>
                    <SelectedItemsList
                      items={diagnoses.map((d) => ({
                        id: d.id,
                        title: d.name,
                        meta: `ICD-10: ${d.icd10}`,
                        gradient: d.type === "chronic" ? "amber" : d.type === "active" ? "emerald" : "blue",
                        badges: [{ label: d.type, className: `capitalize ${DIAG_TYPE_BADGE[d.type]}` }],
                      }))}
                      onRemove={handleRemoveDiagnosis}
                      emptyMessage="No diagnosis added yet. Click &quot;Add Diagnosis&quot; to begin."
                    />
                  </div>
                  <FormTextarea
                    label="Doctor Notes & Care Advice"
                    value={notes}
                    onChange={setNotes}
                    rows={4}
                    placeholder="Assessment, advice, warning signs, and lifestyle instructions..."
                    className="mt-6 space-y-2"
                  />
                  <div className="mt-6 flex justify-between">
                    <FormButton variant="outline" onClick={() => setCurrentStep(1)}>
                      Back to Vitals
                    </FormButton>
                    <FormButton onClick={() => setCurrentStep(3)}>
                      Continue to Prescription
                    </FormButton>
                  </div>
                </CardContent>
                
              </Card>
            )}

            {/* Step 3: E-Prescription */}
            {currentStep === 3 && (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">E-Prescription</h2>
                      <p className="text-sm text-slate-500 mt-1">Medication safety checks against allergies and interactions.</p>
                    </div>
                    <FormButton size="sm" onClick={() => setIsMedicineDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Medicine
                    </FormButton>
                  </div>

                  <SelectedItemsList
                    items={medicines.map((med) => ({
                      id: med.id,
                      title: med.name,
                      meta: `${med.dosage} · ${med.frequency} · ${med.duration}`,
                      gradient: "emerald",
                      badges: med.instructions
                        ? [{ label: med.instructions, className: "bg-teal-50 text-teal-700 border-teal-200" }]
                        : undefined,
                    }))}
                    onRemove={handleRemoveMedicine}
                    emptyMessage="No medicines added yet. Click &quot;Add Medicine&quot; to begin."
                  />

                  <FormTextarea
                    label="Non-Pharmacological Advice"
                    value={advice}
                    onChange={setAdvice}
                    rows={3}
                    placeholder="Hydration, rest, diet, lifestyle advice..."
                    className="mt-6 space-y-2"
                  />
                  <div className="mt-6 flex justify-between">
                    <FormButton variant="outline" onClick={() => setCurrentStep(2)}>
                      Back to Consultation
                    </FormButton>
                    <FormButton onClick={() => setCurrentStep(4)}>
                      Continue to Orders
                    </FormButton>
                  </div>
                </CardContent>
                
              </Card>
            )}

            {/* Step 4: Orders & Close */}
            {currentStep === 4 && (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Investigations & Clinical Plan</h2>
                      <p className="text-sm text-slate-500 mt-1">Place orders, define follow-up, and finalize.</p>
                    </div>
                    <FormButton size="sm" onClick={() => setIsLabDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Lab Order
                    </FormButton>
                  </div>

                  <SelectedItemsList
                    items={labOrders.map((order) => ({
                      id: order.id,
                      title: order.test,
                      gradient: order.department === "pathology" ? "blue" : "violet",
                      badges: [
                        { label: order.department, className: `${DEPT_BADGE[order.department]} capitalize` },
                        { label: order.priority, className: `${PRIORITY_BADGE[order.priority]} capitalize` },
                      ],
                      trailing: (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          Ordered
                        </span>
                      ),
                    }))}
                    onRemove={handleRemoveLabOrder}
                    className="mb-5"
                    emptyMessage="No lab orders added yet."
                  />

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="relative min-w-0">
                      <DateField
                        label="Follow-up Date"
                        value={followUpDate}
                        onChange={setFollowUpDate}
                      />
                    </div>
                    <div>
                      <SingleSelect
                        label="Disposition"
                        value={disposition}
                        onChange={setDisposition}
                        placeholder="Select disposition"
                        options={[
                          { value: "review-opd", label: "Review in OPD" },
                          { value: "admit", label: "Admit to Ward" },
                          { value: "emergency", label: "Refer to Emergency" },
                          { value: "tele", label: "Tele Follow-up" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <FormButton variant="outline" onClick={() => setCurrentStep(3)}>
                      Back to Prescription
                    </FormButton>
                    <FormButton onClick={handleCompleteConsultation}>
                      <Signature className="w-4 h-4 mr-2" />
                      Sign & Complete
                    </FormButton>
                  </div>
                </CardContent>
                
              </Card>
            )}
          </div>

          {/* Right: Sidebar - Timeline + Vitals */}
          <div className="space-y-6">
            <PatientTimelineCard
              patient={patient}
              onViewFullHistory={() => router.push(`/doctor/opd/appointments/${uhid}`)}
            />
            <CurrentVitals vitals={vitals} gridClassName="lg:grid-cols-2" />
          </div>
        </div>

      {/* Side drawers */}
      <MedicineDrawer
        open={isMedicineDialogOpen}
        onOpenChange={setIsMedicineDialogOpen}
        onSubmit={(items: MedicineDraft[]) => items.forEach(handleAddMedicine)}
      />
      <LabDrawer
        open={isLabDialogOpen}
        onOpenChange={setIsLabDialogOpen}
        onSubmit={(items: LabDraft[]) => items.forEach(handleAddLabOrder)}
      />
      <DiagnosisDrawer
        open={isDiagnosisDialogOpen}
        onOpenChange={setIsDiagnosisDialogOpen}
        onSubmit={(items: DiagnosisDraft[]) => items.forEach(handleAddDiagnosis)}
      />
      <AllergyAlertDialog
        open={isAllergyOpen}
        onOpenChange={setIsAllergyOpen}
        allergies={patient.allergies || []}
        patientName={patient.patientName}
      />
    </ConsultationShell>
  );
}

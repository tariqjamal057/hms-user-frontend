// app/doctor/ipd/discharge-decision/page.tsx
"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FileTextIcon,
  HeartPulse,
  Info,
  MapPin,
  Phone,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
  UserRound,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuickActionsCard } from "@/components/patient-detail/quick-actions-card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormTextarea, SuffixedInput, DateField, DateTimeField } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { RadioGroup } from "@/components/forms/radio-group";
import { PillButton } from "@/components/forms/pill-button";

import {
  WARD_ROUND_PATIENTS,
  getPatientByUhid,
} from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getDiagnosisData } from "@/lib/doctor/ipd/diagnosis-data";
import { getTreatmentPlanData } from "@/lib/doctor/ipd/treatment-plan-data";
import { getMedicineOrdersData } from "@/lib/doctor/ipd/medicine-orders-data";
import { getInvestigationOrdersData } from "@/lib/doctor/ipd/investigation-orders-data";
import { getDischargeDecisionData } from "@/lib/doctor/ipd/discharge-decision-data";
import type {
  DischargeDecisionType,
  DischargeMedication,
  DischargeMode,
} from "@/types/doctor/ipd/discharge-decision-types";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { MedicineDrawer, type MedicineDraft } from "@/components/consultation/medicine-drawer";
import { PatientProfileCard } from "@/components/patient-detail/patient-profile-card";
import { wardRoundProfileDetail } from "@/lib/patient-detail/patient-profile-data";

export default function DischargeDecisionPage({
  uhid: propUhid,
  embedded = false,
}: { uhid?: string; embedded?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = propUhid ?? searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const profile = useMemo(() => wardRoundProfileDetail(patient), [patient]);
  const vitals = useMemo(() => getVitalsForPatient(uhid)[0], [uhid]);
  const diagnosis = useMemo(
    () => getDiagnosisData(uhid).currentDiagnoses,
    [uhid],
  );
  const treatment = useMemo(() => getTreatmentPlanData(uhid), [uhid]);
  const medicines = useMemo(() => getMedicineOrdersData(uhid).items, [uhid]);
  const investigations = useMemo(
    () => getInvestigationOrdersData(uhid).items,
    [uhid],
  );
  const initialData = useMemo(() => getDischargeDecisionData(uhid), [uhid]);

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [patientSummaryOpen, setPatientSummaryOpen] = useState(false);

  const [assessmentDateTime, setAssessmentDateTime] =
    useState("2024-05-20T14:30");
  const [clinicalStable, setClinicalStable] = useState(
    initialData.clinicalStable,
  );
  const [vitalsNormal, setVitalsNormal] = useState(initialData.vitalsNormal);
  const [primaryDiagnosisControlled, setPrimaryDiagnosisControlled] = useState(
    initialData.primaryDiagnosisControlled,
  );
  const [labParametersAcceptable, setLabParametersAcceptable] = useState(
    initialData.labParametersAcceptable,
  );
  const [activityIndependent, setActivityIndependent] = useState(
    initialData.activityIndependent,
  );
  const [patientWilling, setPatientWilling] = useState(
    initialData.patientWilling,
  );

  const [dischargeDecision, setDischargeDecision] = useState(
    initialData.dischargeDecision,
  );
  const [dischargeDateTime, setDischargeDateTime] = useState(
    initialData.dischargeDateTime,
  );
  const [dischargeMode, setDischargeMode] = useState<DischargeMode>(
    initialData.dischargeMode,
  );
  const [accompaniedBy, setAccompaniedBy] = useState(initialData.accompaniedBy);
  const [instructionsGivenBy, setInstructionsGivenBy] = useState(
    initialData.instructionsGivenBy,
  );

  const [followUpDate, setFollowUpDate] = useState(initialData.followUpDate);
  const [followUpWith, setFollowUpWith] = useState(initialData.followUpWith);
  const [visitType, setVisitType] = useState(initialData.visitType);
  const [remarks, setRemarks] = useState(initialData.remarks);
  const [notes, setNotes] = useState(initialData.notes);
  const [medications, setMedications] = useState<DischargeMedication[]>(
    initialData.medications,
  );

  useEffect(() => {
    const data = getDischargeDecisionData(uhid);

    setClinicalStable(data.clinicalStable);
    setVitalsNormal(data.vitalsNormal);
    setPrimaryDiagnosisControlled(data.primaryDiagnosisControlled);
    setLabParametersAcceptable(data.labParametersAcceptable);
    setActivityIndependent(data.activityIndependent);
    setPatientWilling(data.patientWilling);

    setDischargeDecision(data.dischargeDecision);
    setDischargeDateTime(data.dischargeDateTime);
    setDischargeMode(data.dischargeMode);
    setAccompaniedBy(data.accompaniedBy);
    setInstructionsGivenBy(data.instructionsGivenBy);

    setFollowUpDate(data.followUpDate);
    setFollowUpWith(data.followUpWith);
    setVisitType(data.visitType);
    setRemarks(data.remarks);
    setNotes(data.notes);
    setMedications(data.medications);

    setAddMedicineOpen(false);
    setPatientSummaryOpen(false);
    setConfirmed(false);
  }, [uhid]);

  const overallReady =
    clinicalStable &&
    vitalsNormal &&
    primaryDiagnosisControlled &&
    labParametersAcceptable &&
    activityIndependent &&
    patientWilling;

  function handleSelectPatient(newUhid: string) {
    router.push(`/doctor/ipd/discharge-decision?uhid=${newUhid}`);
  }

  function handleAddMedicine() {
    setAddMedicineOpen(true);
  }

  function handleSaveDischargeMedicines(drafts: MedicineDraft[]) {
    if (drafts.length === 0) return;
    const dischargeMedicines: DischargeMedication[] = drafts.map((d) => ({
      id: `dis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      medicineName: d.name,
      dose: d.dosage,
      frequency: d.frequency,
      duration: d.duration,
    }));

    setMedications((previous) => [...previous, ...dischargeMedicines]);

    toast.success(
      `${dischargeMedicines.length} medicine${dischargeMedicines.length > 1 ? "s" : ""} added to discharge medications`,
    );
  }

  function handleDeleteDischargeMedicine(id: string) {
    setMedications((previous) =>
      previous.filter((medicine) => medicine.id !== id),
    );

    toast.success("Discharge medicine removed");
  }

  function handleConfirmDischarge() {
    if (!overallReady) {
      toast.error("Patient is not fully ready for discharge");
      return;
    }
    setConfirmed(true);
    toast.success("Discharge confirmed. Discharge certificate is ready.");
    router.push(`/doctor/ipd/patients`);
    console.log("Confirm discharge:", {
      uhid,
      assessmentDateTime,
      dischargeDecision,
      dischargeDateTime,
      dischargeMode,
      accompaniedBy,
      instructionsGivenBy,
      followUpDate,
      followUpWith,
      visitType,
      remarks,
      notes,
      medications,
    });
  }

  function handleBack() {
    router.push(`/doctor/ipd/treatment-plan?uhid=${uhid}`);
  }

  function handleSaveDraft() {
    toast.success("Discharge decision saved as draft");
  }

  function handleDiagnosis() {
    router.push(`/doctor/ipd/diagnosis-update?uhid=${uhid}`);
  }

  function handleViewLabOrders() {
    router.push(`/doctor/ipd/investigation-orders?uhid=${uhid}`);
  }

  function handleViewMedicineOrders() {
    router.push(`/doctor/ipd/medicine-orders?uhid=${uhid}`);
  }

  function handleTreatmentPlan() {
    router.push(`/doctor/ipd/treatment-plan?uhid=${uhid}`);
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {!embedded && (
          <PatientProfileCard
            patient={profile}
            patientsPath="/doctor/ipd/patients"
            subtitle="IPD Patient"
            headerActions={
              <PillButton
                variant="outline"
                className="w-full lg:w-auto"
                onClick={() => setChangePatientOpen(true)}
              >
                Change Patient
              </PillButton>
            }
          />
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  Discharge Decision
                </h1>
                <p className="text-xs text-slate-400">
                  Evaluate patient status and decide on discharge plan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="space-y-5 py-4">
                  <SectionTitle title="1. Discharge Readiness Assessment" />
                  <ChecklistRow
                    label="Is the patient clinically stable?"
                    checked={clinicalStable}
                    onChange={setClinicalStable}
                  />
                  <ChecklistRow
                    label="Are vital signs within acceptable range?"
                    checked={vitalsNormal}
                    onChange={setVitalsNormal}
                  />
                  <ChecklistRow
                    label="Is the primary diagnosis under control?"
                    checked={primaryDiagnosisControlled}
                    onChange={setPrimaryDiagnosisControlled}
                  />
                  <ChecklistRow
                    label="Are lab parameters acceptable?"
                    checked={labParametersAcceptable}
                    onChange={setLabParametersAcceptable}
                  />
                  <ChecklistRow
                    label="Is the patient able to perform activities of daily living?"
                    checked={activityIndependent}
                    onChange={setActivityIndependent}
                  />
                  <ChecklistRow
                    label="Is the patient willing for discharge and understands instructions?"
                    checked={patientWilling}
                    onChange={setPatientWilling}
                  />

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-700">
                      Overall Readiness Status
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      {overallReady ? "Fit for Discharge" : "Not Ready"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="space-y-4 py-4">
                  <SectionTitle title="2. Discharge Plan" />
                  <Field label="Discharge Decision *">
                    <div className="mt-1.5">
                      <SingleSelect
                        value={dischargeDecision}
                        onChange={(value) =>
                          setDischargeDecision(value as DischargeDecisionType)
                        }
                        options={[
                          { value: "Discharge to Home", label: "Discharge to Home" },
                          { value: "Discharge to Rehab", label: "Discharge to Rehab" },
                          { value: "Transfer to Another Facility", label: "Transfer to Another Facility" },
                        ]}
                      />
                    </div>
                  </Field>

                  <Field label="Discharge Date & Time *">
                    <div className="mt-1.5">
                      <DateTimeField
                        label=""
                        value={dischargeDateTime}
                        onChange={setDischargeDateTime}
                        placeholder="Select discharge date & time"
                      />
                    </div>
                  </Field>

                  <Field label="Mode of Discharge">
                    <div className="mt-1.5">
                      <RadioGroup
                        value={dischargeMode}
                        onChange={setDischargeMode}
                        options={[
                          { value: "Walk Out", label: "Walk Out" },
                          { value: "Wheel Chair", label: "Wheel Chair" },
                          { value: "Stretcher", label: "Stretcher" },
                        ]}
                      />
                    </div>
                  </Field>

                  <Field label="Accompanied By">
                    <div className="mt-1.5">
                      <SuffixedInput
                        label=""
                        value={accompaniedBy}
                        onChange={setAccompaniedBy}
                        placeholder="Enter name"
                      />
                    </div>
                  </Field>

                  <Field label="Discharge Instructions Given By">
                    <div className="mt-1.5">
                      <SingleSelect
                        value={instructionsGivenBy}
                        onChange={setInstructionsGivenBy}
                        options={[
                          { value: "Dr. Amit Verma", label: "Dr. Amit Verma" },
                          { value: "Dr. Ravi Sharma", label: "Dr. Ravi Sharma" },
                        ]}
                      />
                    </div>
                  </Field>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <SectionTitle title="3. Medications at Discharge" />
                    <PillButton
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleAddMedicine}
                    >
                      <Plus className="h-4 w-4" /> Add Medicine
                    </PillButton>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-sm">
                      <thead className="border-b border-slate-100 text-left text-slate-500">
                        <tr>
                          <th className="py-2 pr-3 font-medium">Medicine</th>
                          <th className="px-3 font-medium">Dose</th>
                          <th className="px-3 font-medium">Frequency</th>
                          <th className="px-3 font-medium">Duration</th>
                          <th className="py-2 pl-3 text-right font-medium">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {medications.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-sm text-slate-400"
                            >
                              No discharge medicines have been added.
                            </td>
                          </tr>
                        )}

                        {medications.map((medicine) => (
                          <tr
                            key={medicine.id}
                            className="border-b border-slate-50 last:border-b-0"
                          >
                            <td className="py-3 pr-3 font-medium text-slate-800">
                              {medicine.medicineName}
                            </td>

                            <td className="px-3 text-slate-600">
                              {medicine.dose}
                            </td>

                            <td className="px-3 text-slate-600">
                              {medicine.frequency}
                            </td>

                            <td className="px-3 text-slate-600">
                              {medicine.duration}
                            </td>

                            <td className="py-3 pl-3 text-right">
                              <PillButton
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleDeleteDischargeMedicine(medicine.id)
                                }
                                icon={Trash2}
                                aria-label="Remove medicine"
                              >
                                Remove
                              </PillButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="space-y-4 py-4">
                  <SectionTitle title="4. Follow-up Plan" />
                  <Field label="Follow-up Date *">
                    <div className="mt-1.5">
                      <DateField
                        label=""
                        value={followUpDate}
                        onChange={setFollowUpDate}
                      />
                    </div>
                  </Field>
                  <Field label="Follow-up With *">
                    <div className="mt-1.5">
                      <SingleSelect
                        value={followUpWith}
                        onChange={setFollowUpWith}
                        options={[
                          { value: "Dr. Amit Verma (Cardiology)", label: "Dr. Amit Verma (Cardiology)" },
                        ]}
                      />
                    </div>
                  </Field>
                  <Field label="Visit Type">
                    <div className="mt-1.5">
                      <SingleSelect
                        value={visitType}
                        onChange={setVisitType}
                        options={[
                          { value: "OPD Follow-up", label: "OPD Follow-up" },
                          { value: "Tele Follow-up", label: "Tele Follow-up" },
                        ]}
                      />
                    </div>
                  </Field>
                  <FormTextarea
                    label="Remarks (Optional)"
                    rows={4}
                    maxLength={250}
                    value={remarks}
                    onChange={setRemarks}
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="space-y-3 py-4">
                  <SectionTitle title="5. Advice & Instructions to Patient" />
                  <ul className="space-y-2 text-sm text-slate-700">
                    {[
                      "Take all medicines as prescribed.",
                      "Avoid heavy physical exertion for 1 week.",
                      "Follow a low-fat, low-salt diet.",
                      "Report to hospital immediately if you have chest pain, breathlessness, or palpitations.",
                      "Carry this discharge summary during follow-up visit.",
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <SectionTitle title="Additional Notes (Optional)" />
                <div className="mt-3">
                  <FormTextarea
                    label=""
                    rows={4}
                    maxLength={500}
                    value={notes}
                    onChange={setNotes}
                  />
                </div>
              </CardContent>
            </Card>

            {!embedded && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" /> Once confirmed, the
                  patient will be marked as discharged and bed will be made
                  available for new admission.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <PillButton
                variant="outline"
                className="gap-2 sm:w-auto"
                onClick={handleSaveDraft}
                icon={FileText}
              >
                Save as Draft
              </PillButton>

              <div className="flex flex-col gap-2 sm:flex-row">
                {!embedded && (
                  <PillButton
                    variant="outline"
                    className="gap-2"
                    onClick={handleBack}
                    icon={ArrowLeft}
                  >
                    Cancel
                  </PillButton>
                )}
                <PillButton
                  className="gap-2"
                  onClick={handleConfirmDischarge}
                  disabled={!overallReady}
                  icon={ShieldCheck}
                >
                  Confirm Discharge
                </PillButton>
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Patient Summary
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Admission and current clinical overview
                    </p>
                  </div>

                  <PillButton
                    variant="outline"
                    size="sm"
                    onClick={() => setPatientSummaryOpen(true)}
                  >
                    View Summary
                  </PillButton>
                </div>

                <SummaryRow
                  label="Primary Diagnosis"
                  value={patient.currentDiagnosis}
                />

                <SummaryRow
                  label="Diagnosis Code"
                  value={patient.diagnosisCode}
                />

                <SummaryRow
                  label="Duration of Stay"
                  value={`${patient.daysAdmitted ?? 0} Days`}
                />

                <SummaryRow
                  label="Admission Date"
                  value={patient.admissionDateTime}
                />

                <SummaryRow
                  label="Treating Doctor"
                  value={patient.admittingDoctor}
                />

                <SummaryRow label="Current Status" value={patient.status} />

                <SummaryRow
                  label="Last Vitals"
                  value={patient.vitals.recordedOn}
                />
              </CardContent>
            </Card>

            {/*<Card className="border-slate-200 shadow-sm">
              <CardContent className="py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">Documents & Checklist</p>
                <ChecklistLink label="Discharge Summary" />
                <ChecklistLink label="Medication Chart" />
                <ChecklistLink label="Investigation Reports" />
                <ChecklistLink label="Procedure Reports" />
                <ChecklistLink label="Consent Forms" />
              </CardContent>
            </Card> */}

            <QuickActionsCard
              actions={[
                {
                  label: "View Treatment Plan",
                  icon: ClipboardCheck,
                  onClick: handleTreatmentPlan,
                },
                {
                  label: "View Diagnosis",
                  icon: CircleAlert,
                  onClick: handleDiagnosis,
                },
                {
                  label: "View Lab Orders",
                  icon: FileTextIcon,
                  onClick: handleViewLabOrders,
                },
                {
                  label: "View Medicine Orders",
                  icon: FileText,
                  onClick: handleViewMedicineOrders,
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

      <MedicineDrawer
        open={addMedicineOpen}
        onOpenChange={setAddMedicineOpen}
        onSubmit={handleSaveDischargeMedicines}
      />

      <PatientSummaryDrawer
        open={patientSummaryOpen}
        onClose={() => setPatientSummaryOpen(false)}
        patient={patient}
      />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <p className="text-sm font-semibold text-slate-800">{title}</p>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function ChecklistRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <CheckCircle2
          className={`h-4 w-4 ${checked ? "text-emerald-500" : "text-slate-300"}`}
        />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1">
          <Checkbox checked={checked} onCheckedChange={() => onChange(true)} />{" "}
          Yes
        </label>
        <label className="flex items-center gap-1">
          <Checkbox
            checked={!checked}
            onCheckedChange={() => onChange(false)}
          />{" "}
          No
        </label>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function ChecklistLink({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
      <span className="text-sm text-slate-700">{label}</span>
      <button className="text-xs font-medium text-blue-600 hover:underline">
        View / Download
      </button>
    </div>
  );
}

function PatientSummaryDrawer({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient: ReturnType<typeof getPatientByUhid>;
}) {
  const hasAllergies = patient.allergies.length > 0;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-lg font-bold text-slate-800">
              Patient Clinical Summary
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Admission, current status, allergies, vitals and clinical data.
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-5">
          {/* Patient profile */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white shadow-md">
                {patient.patientName
                  .split(" ")
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    {patient.patientName}
                  </h2>

                  <PatientStatusBadge status={patient.status} />
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  {patient.age} years · {patient.gender} · Blood Group{" "}
                  <span className="font-semibold">{patient.bloodGroup}</span>
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  UHID: {patient.uhid} · IPD: {patient.ipdId}
                </p>
              </div>
            </div>
          </section>

          {/* Admission details */}
          <section>
            <DrawerSectionTitle
              icon={<MapPin className="h-4 w-4 text-blue-600" />}
              title="Admission Details"
            />

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DrawerInfo label="Ward / Room / Bed" value={patient.wardRoomBed} />
              <DrawerInfo label="Department" value={patient.department} />
              <DrawerInfo label="Admission Date & Time" value={patient.admissionDateTime} />
              <DrawerInfo
                label="Days Admitted"
                value={`${patient.daysAdmitted ?? 0} Days`}
              />
              <DrawerInfo label="Expected Discharge" value={patient.expectedDischarge ?? "Not decided"} />
              <DrawerInfo label="Attending Doctor" value={patient.admittingDoctor} />
            </div>
          </section>

          {/* Diagnosis */}
          <section>
            <DrawerSectionTitle
              icon={<ClipboardList className="h-4 w-4 text-violet-600" />}
              title="Current Diagnosis"
            />

            <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-base font-bold text-slate-800">
                {patient.currentDiagnosis}
              </p>
              <p className="mt-1 text-sm text-violet-700">
                ICD-10: {patient.diagnosisCode}
              </p>
            </div>
          </section>

          {/* Current vitals */}
          <section>
            <DrawerSectionTitle
              icon={<HeartPulse className="h-4 w-4 text-red-500" />}
              title="Latest Vitals"
            />

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <VitalSummaryTile label="BP" value={patient.vitals.bp} unit="mmHg" />
              <VitalSummaryTile label="Pulse" value={patient.vitals.pulse} unit="/min" />
              <VitalSummaryTile label="Temperature" value={patient.vitals.temp} unit="°F" />
              <VitalSummaryTile label="Respiratory Rate" value={patient.vitals.rr} unit="/min" />
              <VitalSummaryTile label="SpO₂" value={patient.vitals.spo2} unit="%" />
              <VitalSummaryTile label="Pain Score" value={patient.vitals.pain} unit="/10" />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Last recorded: {patient.vitals.recordedOn}
            </p>
          </section>

          {/* Allergies */}
          <section>
            <DrawerSectionTitle
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
              title="Allergies"
            />

            {hasAllergies ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {patient.allergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    className="border border-red-200 bg-red-50 text-red-700"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                No known drug allergies recorded.
              </div>
            )}
          </section>

          {/* Contact */}
          <section>
            <DrawerSectionTitle
              icon={<UserRound className="h-4 w-4 text-cyan-600" />}
              title="Patient Contact & Guardian"
            />

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DrawerInfo
                label="Guardian / Attendant"
                value={patient.guardianName ?? "Not recorded"}
              />

              <DrawerInfo
                label="Contact Number"
                value={patient.contactNumber ?? "Not recorded"}
              />
            </div>
          </section>

          {/* Lab highlights */}
          <section>
            <DrawerSectionTitle
              icon={<FileText className="h-4 w-4 text-amber-600" />}
              title="Recent Lab Highlights"
            />

            <div className="mt-3 space-y-2">
              {patient.labHighlights.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
                  No recent laboratory results available.
                </p>
              ) : (
                patient.labHighlights.map((lab) => (
                  <div
                    key={`${lab.name}-${lab.date}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {lab.name}
                      </p>
                      <p className="text-xs text-slate-400">{lab.date}</p>
                    </div>

                    <p className="text-sm font-bold text-slate-700">
                      {lab.value}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Current medicines */}
          <section>
            <DrawerSectionTitle
              icon={<Pill className="h-4 w-4 text-blue-600" />}
              title="Current Medicine Status"
            />

            <div className="mt-3 space-y-2">
              {(patient.medicines ?? []).length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
                  No active medicines recorded.
                </p>
              ) : (
                patient.medicines?.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {medicine.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {medicine.dosage} · {medicine.route} ·{" "}
                          {medicine.frequency}
                        </p>
                      </div>

                      <Badge
                        className={
                          medicine.status === "Given"
                            ? "bg-emerald-50 text-emerald-700"
                            : medicine.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }
                      >
                        {medicine.status}
                      </Badge>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Scheduled: {medicine.scheduledTime}
                      {medicine.givenBy
                        ? ` · Given by ${medicine.givenBy} at ${medicine.givenAt}`
                        : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function DrawerSectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    </div>
  );
}

function DrawerInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function VitalSummaryTile({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}{" "}
        <span className="text-[10px] font-medium text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
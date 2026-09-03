"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle, Signature, Trash2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsultationHeader } from "./_components/consultation-header";
import { PatientTimelineCard } from "./_components/patient-timeline-card";
import { VitalsSidebarCard } from "./_components/vitals-sidebar-card";
import { MedicineSelectorDialog } from "./_components/medicine-selector-dialog";
import { LabOrderSelectorDialog } from "./_components/lab-order-selector-dialog";
import { DiagnosisSelectorDialog } from "./_components/diagnosis-selector-dialog";
import { AllergyAlertDialog } from "./_components/allergy-alert-dialog";
import { PatientDetailsDialog } from "../../appointments/_components/patient-details-dialog";
import { getPatientByUhid } from "@/lib/doctor/opd/opd-mock-data";

type Step = 1 | 2 | 3 | 4;

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
  priority: "routine" | "priority";
}

export default function DoctorConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const uhid = params.uhid as string;

  const patient = getPatientByUhid(uhid);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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
            <Button onClick={() => router.push("/doctor/opd/appointments")} className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600">
              Back to Appointments
            </Button>
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
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.back()} className="border-slate-200">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-800">OPD Consultation</h1>
                <p className="text-xs text-slate-500">UHID: {uhid}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] py-6">
        {/* Patient Banner */}
        <ConsultationHeader
          patient={patient}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenAllergyAlert={() => setIsAllergyOpen(true)}
        />

        {/* Workflow Stepper */}
        <Card className="mt-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between overflow-x-auto">
              {steps.map((step, idx) => (
                <div key={step.num} className="flex items-center min-w-[145px]">
                  <button
                    onClick={() => setCurrentStep(step.num as Step)}
                    className={`flex flex-col items-start transition-colors ${
                      currentStep >= step.num ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                        currentStep > step.num
                          ? "bg-green-500 border-green-500 text-white"
                          : currentStep === step.num
                          ? "border-blue-600 text-blue-600 bg-white"
                          : "border-slate-300 text-slate-400 bg-white"
                      }`}
                    >
                      {currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
                    </div>
                    <span className="mt-2 text-xs font-semibold">{step.label}</span>
                    <span className="text-[10px] text-slate-400">{step.desc}</span>
                  </button>
                  {idx < steps.length - 1 && <div className="h-px flex-1 bg-slate-200 mx-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
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
                    <VitalField label="Blood Pressure" value={vitals.bp} onChange={(v) => setVitals({ ...vitals, bp: v })} unit="mmHg" />
                    <VitalField label="Pulse Rate" value={vitals.pulse} onChange={(v) => setVitals({ ...vitals, pulse: v })} unit="/min" />
                    <VitalField label="Temperature" value={vitals.temp} onChange={(v) => setVitals({ ...vitals, temp: v })} unit="F" />
                    <VitalField label="SpO₂" value={vitals.spo2} onChange={(v) => setVitals({ ...vitals, spo2: v })} unit="%" />
                    <VitalField label="Weight" value={vitals.weight} onChange={(v) => setVitals({ ...vitals, weight: v })} unit="kg" />
                    <VitalField label="Height" value={vitals.height} onChange={(v) => setVitals({ ...vitals, height: v })} unit="cm" />
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-700">Nurse/Doctor Notes</label>
                    <Textarea
                      value={vitals.notes}
                      onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                      className="mt-2 border-slate-200"
                      rows={3}
                      placeholder="Any pain score, concern, abnormal reading or observation..."
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setCurrentStep(2)} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      Continue to Consultation
                    </Button>
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
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Chief Complaint & History</label>
                    <Textarea
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      className="mt-2 border-slate-200"
                      rows={5}
                      placeholder="Symptoms, duration, and relevant history..."
                    />
                  </div>
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-slate-700">Diagnosis</label>
                      <Button variant="outline" size="sm" onClick={() => setIsDiagnosisDialogOpen(true)} className="border-slate-200">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Diagnosis
                      </Button>
                    </div>
                    {diagnoses.length > 0 ? (
                      <div className="space-y-2">
                        {diagnoses.map((d) => (
                          <div key={d.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                ICD-10: {d.icd10} • <span className="capitalize">{d.type}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveDiagnosis(d.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-sm text-slate-400">No diagnosis added yet. Click "Add Diagnosis" to begin.</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-5">
                    <label className="text-sm font-semibold text-slate-700">Doctor Notes & Care Advice</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2 border-slate-200"
                      rows={4}
                      placeholder="Assessment, advice, warning signs, and lifestyle instructions..."
                    />
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="border-slate-200">
                      Back to Vitals
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      Continue to Prescription
                    </Button>
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
                    <Button variant="outline" size="sm" onClick={() => setIsMedicineDialogOpen(true)} className="border-slate-200">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Medicine
                    </Button>
                  </div>

                  {medicines.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Medicine</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Dosage</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Frequency</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Duration</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Instructions</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {medicines.map((med) => (
                            <tr key={med.id}>
                              <td className="px-4 py-3 font-semibold text-slate-800">{med.name}</td>
                              <td className="px-4 py-3 text-slate-600">{med.dosage}</td>
                              <td className="px-4 py-3 text-slate-600">{med.frequency}</td>
                              <td className="px-4 py-3 text-slate-600">{med.duration}</td>
                              <td className="px-4 py-3 text-slate-600">{med.instructions}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleRemoveMedicine(med.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-slate-500">No medicines added yet. Click "Add Medicine" to begin.</p>
                    </div>
                  )}

                  <div className="mt-5">
                    <label className="text-sm font-semibold text-slate-700">Non-Pharmacological Advice</label>
                    <Textarea
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      className="mt-2 border-slate-200"
                      rows={3}
                      placeholder="Hydration, rest, diet, lifestyle advice..."
                    />
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="border-slate-200">
                      Back to Consultation
                    </Button>
                    <Button onClick={() => setCurrentStep(4)} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      Continue to Orders
                    </Button>
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
                    <Button variant="outline" size="sm" onClick={() => setIsLabDialogOpen(true)} className="border-slate-200">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Lab Order
                    </Button>
                  </div>

                  {labOrders.length > 0 ? (
                    <div className="space-y-2 mb-5">
                      {labOrders.map((order) => (
                        <div key={order.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{order.test}</p>
                            <p className="text-xs text-slate-500 capitalize">{order.priority}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">Ordered</Badge>
                            <button
                              onClick={() => handleRemoveLabOrder(order.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50 mb-5">
                      <p className="text-slate-500">No lab orders added yet.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Follow-up Date</label>
                      <Input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="mt-2 border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Disposition</label>
                      <Select value={disposition} onValueChange={setDisposition}>
                        <SelectTrigger className="mt-2 border-slate-200">
                          <SelectValue placeholder="Select disposition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="review-opd">Review in OPD</SelectItem>
                          <SelectItem value="admit">Admit to Ward</SelectItem>
                          <SelectItem value="emergency">Refer to Emergency</SelectItem>
                          <SelectItem value="tele">Tele Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)} className="border-slate-200">
                      Back to Prescription
                    </Button>
                    <Button onClick={handleCompleteConsultation} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      <Signature className="w-4 h-4 mr-2" />
                      Sign & Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Sidebar - Timeline + Vitals */}
          <div className="space-y-6">
            <PatientTimelineCard patient={patient} onViewFullHistory={() => setIsHistoryOpen(true)} />
            <VitalsSidebarCard vitals={vitals} />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <MedicineSelectorDialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen} onAdd={handleAddMedicine} />
      <LabOrderSelectorDialog open={isLabDialogOpen} onOpenChange={setIsLabDialogOpen} onAdd={handleAddLabOrder} />
      <DiagnosisSelectorDialog open={isDiagnosisDialogOpen} onOpenChange={setIsDiagnosisDialogOpen} onAdd={handleAddDiagnosis} />
      <AllergyAlertDialog
        open={isAllergyOpen}
        onOpenChange={setIsAllergyOpen}
        allergies={patient.allergies || []}
        patientName={patient.patientName}
      />
      <PatientDetailsDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        patient={patient}
        onStartConsultation={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

function VitalField({ label, value, onChange, unit }: { label: string; value: string; onChange: (v: string) => void; unit: string }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="mt-1 flex items-center border border-slate-200 rounded-lg overflow-hidden">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 focus-visible:ring-0"
          placeholder={`e.g. ${label === "Blood Pressure" ? "120/80" : "72"}`}
        />
        <span className="px-3 text-xs text-slate-500 border-l border-slate-200 bg-slate-50">{unit}</span>
      </div>
    </div>
  );
}
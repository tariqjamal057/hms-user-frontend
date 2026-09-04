"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import { InfoCard } from "@/components/patient-detail/info-card";
import { AllergyAlertCard } from "@/components/patient-detail/allergy-alert-card";
import { SummaryCard } from "@/components/patient-detail/summary-card";
import { VitalsHistoryTable } from "@/components/patient-detail/vitals-history-table";
import { ConsultationHistory } from "@/components/patient-detail/consultation-history";
import {
  Pill, TestTube,
  Calendar, User, Stethoscope, Clock, AlertTriangle,
  Printer, Download,
} from "lucide-react";
import { PrescriptionTemplate } from "@/components/prescription/prescription-template";
import type { PatientFullProfile } from "@/lib/doctor/opd/opd-mock-data";

interface PatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientFullProfile | null;
  onStartConsultation: () => void;
}

export function PatientDetailsDialog({ open, onOpenChange, patient, onStartConsultation }: PatientDetailsDialogProps) {
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: prescriptionRef,
    documentTitle: `Prescription-${patient?.appointmentNo || "OPD"}`,
  });

  if (!patient) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:!w-[96vw] !max-w-[1200px] max-h-[92vh] overflow-y-auto rounded-2xl p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                {patient.patientName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-xl font-bold text-slate-800 truncate">
                    {patient.patientName}
                  </DialogTitle>
                  {patient.allergies && patient.allergies.length > 0 && (
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] sm:text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {patient.allergies.length} Allergy Alert{patient.allergies.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                  {patient.age} yrs • {patient.gender} • {patient.bloodGroup} •{" "}
                  <span className="font-medium text-slate-700">{patient.uhid}</span>
                </p>
              </div>
            </div>
            <PillButton
              variant="gradient"
              onClick={onStartConsultation}
              disabled={patient.status === "completed"}
              icon={Stethoscope}
              // className="px-3 text-xs shadow-lg sm:px-4 sm:text-sm"
            >
              Start Consultation
            </PillButton>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <QuickInfoCard icon={<User className="w-4 h-4" />} label="Patient Type" value={patient.patientType} />
            <QuickInfoCard icon={<Calendar className="w-4 h-4" />} label="Appointment" value={patient.appointmentNo} />
            <QuickInfoCard icon={<Clock className="w-4 h-4" />} label="Time" value={patient.time} />
            <QuickInfoCard icon={<Stethoscope className="w-4 h-4" />} label="Doctor" value={patient.doctor} />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent h-auto p-0 gap-1 overflow-x-auto flex-nowrap">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                Overview
              </TabsTrigger>
              <TabsTrigger value="vitals" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                Vitals History
              </TabsTrigger>
              <TabsTrigger value="consultations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                Consultations
              </TabsTrigger>
              <TabsTrigger value="medicines" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                Medicines
              </TabsTrigger>
              <TabsTrigger value="labs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                Lab Reports
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InfoCard
                  title="Active Medicines"
                  icon={<Pill className="w-4 h-4" />}
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
                  icon={<TestTube className="w-4 h-4" />}
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

              <SummaryCard
                variant="action"
                title="Download E-Prescription"
                description="Latest vitals, medicines, lab orders, and diagnosis"
                tone="blue"
                icon={<Printer className="w-5 h-5 sm:w-6 sm:h-6" />}
                buttonLabel="Download PDF"
                buttonIcon={Download}
                onAction={handlePrint}
                actionDisabled={!canDownloadPrescription}
                note={!canDownloadPrescription ? "Prescription download will be available once clinical data is recorded." : undefined}
              />
            </TabsContent>

            {/* Vitals History */}
            <TabsContent value="vitals" className="mt-4 sm:mt-6">
              <VitalsHistoryTable rows={patient.vitalsHistory || []} />
            </TabsContent>

            {/* Consultations */}
            <TabsContent value="consultations" className="mt-4 sm:mt-6">
              <ConsultationHistory consultations={patient.consultationHistory || []} />
            </TabsContent>

            {/* Medicines */}
            <TabsContent value="medicines" className="mt-4 sm:mt-6">
              <InfoCard
                title="Current & Previous Medicines"
                icon={<Pill className="w-4 h-4 sm:w-5 sm:h-5" />}
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
            </TabsContent>

            {/* Lab Reports */}
            <TabsContent value="labs" className="mt-4 sm:mt-6">
              <InfoCard
                title="Lab Reports History"
                icon={<TestTube className="w-4 h-4 sm:w-5 sm:h-5" />}
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
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden">
          <PrescriptionTemplate ref={prescriptionRef} {...prescriptionData} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickInfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        {icon}
        <span className="text-[10px] sm:text-xs font-medium">{label}</span>
      </div>
      <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{value}</p>
    </div>
  );
}
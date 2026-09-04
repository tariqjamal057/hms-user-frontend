"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import {
  Pill, TestTube,
  Calendar, User, Stethoscope, Clock, AlertTriangle, FileText,
  TrendingUp, Printer, Download,
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
            <Button
              onClick={onStartConsultation}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2"
              disabled={patient.status === "completed"}
            >
              Start Consultation
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <InfoCard icon={<User className="w-4 h-4" />} label="Patient Type" value={patient.patientType} />
            <InfoCard icon={<Calendar className="w-4 h-4" />} label="Appointment" value={patient.appointmentNo} />
            <InfoCard icon={<Clock className="w-4 h-4" />} label="Time" value={patient.time} />
            <InfoCard icon={<Stethoscope className="w-4 h-4" />} label="Doctor" value={patient.doctor} />
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

              {patient.allergies && patient.allergies.length > 0 ? (
                <Card className="border-red-200 bg-red-50/60">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      <h3 className="font-bold text-red-800 text-sm sm:text-base">Allergies & Alerts</h3>
                    </div>
                    <div className="space-y-2">
                      {patient.allergies.map((allergy, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white border border-red-200">
                          <p className="text-sm font-semibold text-red-800">{allergy}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-green-200 bg-green-50/60">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-800">No known allergies recorded</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">Active Medicines</h3>
                    </div>
                    {patient.medicineHistory && patient.medicineHistory.length > 0 ? (
                      patient.medicineHistory.slice(0, 3).map((med, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-2 last:mb-0">
                          <p className="text-sm font-semibold text-slate-800">{med.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{med.dosage} • {med.frequency} • Started {med.startDate}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">No medicines recorded</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <TestTube className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">Recent Lab Reports</h3>
                    </div>
                    {patient.labHistory && patient.labHistory.length > 0 ? (
                      patient.labHistory.slice(0, 3).map((lab, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-2 last:mb-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">{lab.test}</p>
                            <Badge variant="secondary" className={lab.status === "Normal" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                              {lab.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{lab.result} • {lab.date}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">No lab reports recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-blue-200 bg-blue-50/60">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">Download E-Prescription</p>
                        <p className="text-xs sm:text-sm text-slate-500">Latest vitals, medicines, lab orders, and diagnosis</p>
                      </div>
                    </div>
                    <Button
                      onClick={handlePrint}
                      disabled={!canDownloadPrescription}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-white text-xs sm:text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                  {!canDownloadPrescription && (
                    <p className="text-xs text-slate-500 mt-3">
                      Prescription download will be available once clinical data is recorded.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vitals History */}
            <TabsContent value="vitals" className="mt-4 sm:mt-6">
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Vitals Trend History</h3>
                  </div>
                  {patient.vitalsHistory && patient.vitalsHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-slate-600">Date</th>
                            <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-slate-600">BP</th>
                            <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-slate-600">Pulse</th>
                            <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-slate-600">Temp</th>
                            <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-slate-600">SpO₂</th>
                            <th className="text-left px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-slate-600">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patient.vitalsHistory.map((vital, idx) => (
                            <tr key={idx} className="border-b border-slate-100 last:border-0">
                              <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-slate-700 text-xs sm:text-sm">{vital.date}</td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm">{vital.bp} mmHg</td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm">{vital.pulse} /min</td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm">{vital.temp} F</td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm">{vital.spo2}%</td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm">{vital.weight} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-8">No vitals history recorded for this patient</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Consultations */}
            <TabsContent value="consultations" className="mt-4 sm:mt-6">
              {patient.consultationHistory && patient.consultationHistory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {patient.consultationHistory.map((consult, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm sm:text-base">{consult.date}</p>
                              <p className="text-xs text-slate-500">{consult.doctor}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] sm:text-xs">Completed</Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Diagnosis</p>
                            <p className="text-sm font-semibold text-slate-800">{consult.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Clinical Notes</p>
                            <p className="text-sm text-slate-700">{consult.notes}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Medicines Prescribed</p>
                              <div className="space-y-1">
                                {consult.medicines.map((med, i) => (
                                  <p key={i} className="text-sm text-slate-700">• {med}</p>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Lab Orders</p>
                              <div className="space-y-1">
                                {consult.labs.map((lab, i) => (
                                  <p key={i} className="text-sm text-slate-700">• {lab}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Follow-up</p>
                            <p className="text-sm font-semibold text-blue-700">{consult.followUp}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <p className="text-sm text-slate-400">No previous consultations recorded for this patient</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Medicines */}
            <TabsContent value="medicines" className="mt-4 sm:mt-6">
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Current & Previous Medicines</h3>
                  </div>
                  {patient.medicineHistory && patient.medicineHistory.length > 0 ? (
                    <div className="space-y-3">
                      {patient.medicineHistory.map((med, idx) => (
                        <div key={idx} className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-800 text-sm sm:text-base">{med.name}</p>
                              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs">Active</Badge>
                          </div>
                          <p className="text-xs text-slate-500">Started on {med.startDate}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6 sm:py-8">No medicine history recorded for this patient</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lab Reports */}
            <TabsContent value="labs" className="mt-4 sm:mt-6">
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <TestTube className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Lab Reports History</h3>
                  </div>
                  {patient.labHistory && patient.labHistory.length > 0 ? (
                    <div className="space-y-3">
                      {patient.labHistory.map((lab, idx) => (
                        <div key={idx} className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-800 text-sm sm:text-base">{lab.test}</p>
                              <p className="text-xs sm:text-sm text-slate-600 mt-1">{lab.result}</p>
                            </div>
                            <Badge variant="secondary" className={lab.status === "Normal" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                              {lab.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {lab.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Priority: {lab.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6 sm:py-8">No lab reports recorded for this patient</p>
                  )}
                </CardContent>
              </Card>
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

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
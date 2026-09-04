// app/(dashboard)/doctor/opd/appointments/_components/opd-tabs.tsx
"use client";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PrescriptionTemplate } from "@/components/prescription/prescription-template";
import { CurrentVitals } from "@/components/patient-detail/current-vitals";
import type { PatientFullProfile } from "@/lib/doctor/opd/opd-mock-data";
import {
  Pill, TestTube, Calendar, AlertTriangle, FileText, TrendingUp, Printer, Download,
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

        {patient.allergies && patient.allergies.length > 0 ? (
          <Card className="border-red-200 bg-red-50/60">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <AlertTriangle className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
                <h3 className="text-sm font-bold text-red-800 sm:text-base">Allergies & Alerts</h3>
              </div>
              <div className="space-y-2">
                {patient.allergies.map((allergy, idx) => (
                  <div key={idx} className="rounded-lg border border-red-200 bg-white p-3">
                    <p className="text-sm font-semibold text-red-800">{allergy}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50/60">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">No known allergies recorded</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <Pill className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
                <h3 className="text-sm font-bold text-slate-800 sm:text-base">Active Medicines</h3>
              </div>
              {patient.medicineHistory && patient.medicineHistory.length > 0 ? (
                patient.medicineHistory.slice(0, 3).map((med, idx) => (
                  <div key={idx} className="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-3 last:mb-0">
                    <p className="text-sm font-semibold text-slate-800">{med.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{med.dosage} • {med.frequency} • Started {med.startDate}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">No medicines recorded</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <TestTube className="h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
                <h3 className="text-sm font-bold text-slate-800 sm:text-base">Recent Lab Reports</h3>
              </div>
              {patient.labHistory && patient.labHistory.length > 0 ? (
                patient.labHistory.slice(0, 3).map((lab, idx) => (
                  <div key={idx} className="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-3 last:mb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{lab.test}</p>
                      <Badge variant="secondary" className={lab.status === "Normal" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {lab.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{lab.result} • {lab.date}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">No lab reports recorded</p>
              )}
            </CardContent>
          </Card>
        </div>

        {patient.chronicConditions && patient.chronicConditions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/60">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800 sm:text-base">Chronic Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.map((c, idx) => (
                  <Badge key={idx} className="border-blue-200 bg-blue-100 text-blue-700">{c}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 bg-blue-50/60">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 sm:h-12 sm:w-12">
                  <Printer className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 sm:text-base">Download E-Prescription</p>
                  <p className="text-xs text-slate-500 sm:text-sm">Latest vitals, medicines, lab orders, and diagnosis</p>
                </div>
              </div>
              <Button
                onClick={handlePrint}
                disabled={!canDownloadPrescription}
                className="border-blue-300 bg-white text-xs text-blue-700 hover:bg-blue-100 sm:text-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
            {!canDownloadPrescription && (
              <p className="mt-3 text-xs text-slate-500">
                Prescription download will be available once clinical data is recorded.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ─── Vitals History ───
export function OpdVitalsTab({ patient }: { patient: PatientFullProfile }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <TrendingUp className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
          <h3 className="text-sm font-bold text-slate-800 sm:text-base">Vitals Trend History</h3>
        </div>
        {patient.vitalsHistory && patient.vitalsHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 sm:px-4 sm:py-3 sm:text-xs">Date</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 sm:px-4 sm:py-3 sm:text-xs">BP</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 sm:px-4 sm:py-3 sm:text-xs">Pulse</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 sm:px-4 sm:py-3 sm:text-xs">Temp</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 sm:px-4 sm:py-3 sm:text-xs">SpO₂</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-600 sm:px-4 sm:py-3 sm:text-xs">Weight</th>
                </tr>
              </thead>
              <tbody>
                {patient.vitalsHistory.map((vital, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:py-3 sm:text-sm">{vital.date}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{vital.bp} mmHg</td>
                    <td className="px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{vital.pulse} /min</td>
                    <td className="px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{vital.temp} F</td>
                    <td className="px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{vital.spo2}%</td>
                    <td className="px-3 py-2 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{vital.weight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">No vitals history recorded for this patient</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Consultations ───
export function OpdConsultationsTab({ patient }: { patient: PatientFullProfile }) {
  if (!patient.consultationHistory || patient.consultationHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center sm:p-8">
          <p className="text-sm text-slate-400">No previous consultations recorded for this patient</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3 sm:space-y-4">
      {patient.consultationHistory.map((consult, idx) => (
        <Card key={idx}>
          <CardContent className="p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 sm:h-10 sm:w-10">
                  <FileText className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 sm:text-base">{consult.date}</p>
                  <p className="text-xs text-slate-500">{consult.doctor}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 sm:text-xs">Completed</Badge>
            </div>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs text-slate-500">Diagnosis</p>
                <p className="text-sm font-semibold text-slate-800">{consult.diagnosis}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-slate-500">Clinical Notes</p>
                <p className="text-sm text-slate-700">{consult.notes}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <p className="mb-1 text-xs text-slate-500">Medicines Prescribed</p>
                  <div className="space-y-1">
                    {consult.medicines.map((med, i) => (
                      <p key={i} className="text-sm text-slate-700">• {med}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs text-slate-500">Lab Orders</p>
                  <div className="space-y-1">
                    {consult.labs.map((lab, i) => (
                      <p key={i} className="text-sm text-slate-700">• {lab}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-1 text-xs text-slate-500">Follow-up</p>
                <p className="text-sm font-semibold text-blue-700">{consult.followUp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Medicines ───
export function OpdMedicinesTab({ patient }: { patient: PatientFullProfile }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <Pill className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
          <h3 className="text-sm font-bold text-slate-800 sm:text-base">Current & Previous Medicines</h3>
        </div>
        {patient.medicineHistory && patient.medicineHistory.length > 0 ? (
          <div className="space-y-3">
            {patient.medicineHistory.map((med, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 sm:text-base">{med.name}</p>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">{med.dosage} • {med.frequency} • {med.duration}</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 sm:text-xs">Active</Badge>
                </div>
                <p className="text-xs text-slate-500">Started on {med.startDate}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400 sm:py-8">No medicine history recorded for this patient</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Lab Reports ───
export function OpdLabsTab({ patient }: { patient: PatientFullProfile }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <TestTube className="h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
          <h3 className="text-sm font-bold text-slate-800 sm:text-base">Lab Reports History</h3>
        </div>
        {patient.labHistory && patient.labHistory.length > 0 ? (
          <div className="space-y-3">
            {patient.labHistory.map((lab, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 sm:text-base">{lab.test}</p>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">{lab.result}</p>
                  </div>
                  <Badge variant="secondary" className={lab.status === "Normal" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                    {lab.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 sm:gap-4 sm:text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lab.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Priority: {lab.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400 sm:py-8">No lab reports recorded for this patient</p>
        )}
      </CardContent>
    </Card>
  );
}

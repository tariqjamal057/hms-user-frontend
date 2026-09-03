// app/doctor/ipd/clinical-overview/[uhid]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Activity, Pill, TestTube, ClipboardList, AlertTriangle,
  MapPin, Calendar, Phone, User, Stethoscope, Droplet, Clock,
  CheckCircle2, XCircle, PauseCircle, Ban, FileText, HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";

export default function ClinicalOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const uhid = params.uhid as string;

  const patient = getPatientByUhid(uhid);

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">Patient Not Found</p>
            <p className="text-sm text-slate-500 mt-2">No patient record found for UHID: {uhid}</p>
            <Button onClick={() => router.push("/doctor/ipd/patients")} className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600">
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, string> = {
      Stable: "bg-green-50 text-green-700 border-green-200",
      "Under Observation": "bg-amber-50 text-amber-700 border-amber-200",
      Critical: "bg-red-50 text-red-700 border-red-200",
    };
    return variants[status] || variants.Stable;
  }

  function getMedicineStatusBadge(status: string) {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      Given: { color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      Pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="w-3 h-3 mr-1" /> },
      Held: { color: "bg-orange-50 text-orange-700 border-orange-200", icon: <PauseCircle className="w-3 h-3 mr-1" /> },
      Discontinued: { color: "bg-red-50 text-red-700 border-red-200", icon: <Ban className="w-3 h-3 mr-1" /> },
    };
    return variants[status] || variants.Pending;
  }

  function getLabStatusBadge(status: string) {
    const variants: Record<string, string> = {
      Ordered: "bg-slate-100 text-slate-700 border-slate-200",
      "Sample Collected": "bg-blue-50 text-blue-700 border-blue-200",
      "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
      "Result Ready": "bg-purple-50 text-purple-700 border-purple-200",
      Reviewed: "bg-green-50 text-green-700 border-green-200",
    };
    return variants[status] || variants.Ordered;
  }

  function getLogIcon(type: string) {
    const icons: Record<string, React.ReactNode> = {
      Vitals: <HeartPulse className="w-4 h-4 text-red-500" />,
      Medicine: <Pill className="w-4 h-4 text-purple-500" />,
      Lab: <TestTube className="w-4 h-4 text-amber-500" />,
      Note: <FileText className="w-4 h-4 text-blue-500" />,
      Diagnosis: <ClipboardList className="w-4 h-4 text-cyan-500" />,
      Nursing: <User className="w-4 h-4 text-teal-500" />,
      "Doctor Round": <Stethoscope className="w-4 h-4 text-indigo-500" />,
    };
    return icons[type] || <FileText className="w-4 h-4 text-slate-400" />;
  }

  const medicinesGiven = patient.medicines?.filter((m) => m.status === "Given") || [];
  const medicinesPending = patient.medicines?.filter((m) => m.status === "Pending") || [];
  const medicinesOther = patient.medicines?.filter((m) => m.status === "Held" || m.status === "Discontinued") || [];

  function handleReviewVitals() {
    router.push(`/doctor/ipd/review-vitals?uhid=${uhid}`);
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
                <h1 className="text-lg font-bold text-slate-800">Clinical Overview</h1>
                <p className="text-xs text-slate-500">UHID: {patient.uhid}</p>
              </div>
            </div>
            <Button onClick={handleReviewVitals} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
              <Activity className="w-4 h-4 mr-2" />
              Review Vitals
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 space-y-6">
        {/* Patient Banner */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  {patient.patientName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-800">{patient.patientName}</h1>
                    <Badge className={getStatusBadge(patient.status)}>{patient.status}</Badge>
                    {patient.allergies.length > 0 && (
                      <Badge className="bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {patient.allergies.length} Allergy Alert{patient.allergies.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500">
                    {patient.age} yrs • {patient.gender} • Blood Group: <span className="font-semibold text-slate-700">{patient.bloodGroup}</span>
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-slate-400" />
                      UHID: <span className="font-medium text-slate-700">{patient.uhid}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      IPD ID: <span className="font-medium text-slate-700">{patient.ipdId}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {patient.wardRoomBed}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      {patient.department} — {patient.admittingDoctor}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Admitted: {patient.admissionDateTime} ({patient.daysAdmitted} days)
                    </span>
                    {patient.contactNumber && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {patient.contactNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 min-w-[220px]">
                <p className="text-xs text-slate-500 mb-1">Current Diagnosis</p>
                <p className="text-sm font-bold text-slate-800">{patient.currentDiagnosis}</p>
                <p className="text-xs text-slate-400 mb-3">{patient.diagnosisCode}</p>
                {patient.allergies.length > 0 && (
                  <>
                    <p className="text-xs text-slate-500 mb-1">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((a, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-red-50 text-red-700 text-[10px]">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Vitals Strip */}
            <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-3 border-t border-slate-200 pt-4">
              <VitalMini label="BP" value={patient.vitals.bp} unit="mmHg" />
              <VitalMini label="Pulse" value={patient.vitals.pulse} unit="/min" />
              <VitalMini label="Temp" value={patient.vitals.temp} unit="°F" />
              <VitalMini label="RR" value={patient.vitals.rr} unit="/min" />
              <VitalMini label="SpO₂" value={patient.vitals.spo2} unit="%" />
              <VitalMini label="Pain" value={patient.vitals.pain} unit="/10" />
            </div>
            <p className="text-xs text-slate-400 mt-2">Last recorded: {patient.vitals.recordedOn}</p>
          </CardContent>
        </Card>

        {/* Tabs for detailed sections */}
        <Tabs defaultValue="medicines" className="w-full">
          <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent h-auto p-0 gap-1 overflow-x-auto flex-nowrap">
            <TabsTrigger value="medicines" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-4 py-2.5 whitespace-nowrap">
              Medicines
            </TabsTrigger>
            <TabsTrigger value="labs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-4 py-2.5 whitespace-nowrap">
              Lab Reports
            </TabsTrigger>
            <TabsTrigger value="vitals" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-4 py-2.5 whitespace-nowrap">
              Vitals History
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-4 py-2.5 whitespace-nowrap">
              Clinical Logs
            </TabsTrigger>
          </TabsList>

          {/* Medicines Tab */}
          <TabsContent value="medicines" className="mt-6 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Given */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold text-slate-800">Given by Nurse</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 ml-auto">{medicinesGiven.length}</Badge>
                  </div>
                  {medicinesGiven.length > 0 ? (
                    <div className="space-y-2">
                      {medicinesGiven.map((med) => (
                        <div key={med.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-slate-800">{med.name}</p>
                            <Badge className={getMedicineStatusBadge(med.status).color}>
                              {getMedicineStatusBadge(med.status).icon}
                              {med.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{med.dosage} • {med.route} • {med.frequency}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Given by {med.givenBy} at {med.givenAt} • Ordered by {med.orderedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">No medicines given yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Pending */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-800">Pending / Not Given</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 ml-auto">{medicinesPending.length}</Badge>
                  </div>
                  {medicinesPending.length > 0 ? (
                    <div className="space-y-2">
                      {medicinesPending.map((med) => (
                        <div key={med.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-slate-800">{med.name}</p>
                            <Badge className={getMedicineStatusBadge(med.status).color}>
                              {getMedicineStatusBadge(med.status).icon}
                              {med.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{med.dosage} • {med.route} • {med.frequency}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Scheduled: {med.scheduledTime} • Ordered by {med.orderedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">No pending medicines</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Held / Discontinued */}
            {medicinesOther.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Ban className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-800">Held / Discontinued</h3>
                  </div>
                  <div className="space-y-2">
                    {medicinesOther.map((med) => (
                      <div key={med.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-700">{med.name}</p>
                          <Badge className={getMedicineStatusBadge(med.status).color}>
                            {getMedicineStatusBadge(med.status).icon}
                            {med.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{med.dosage} • {med.route} • {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Lab Reports Tab */}
          <TabsContent value="labs" className="mt-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TestTube className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-800">Lab & Investigation Reports</h3>
                </div>
                {patient.labReports && patient.labReports.length > 0 ? (
                  <div className="space-y-3">
                    {patient.labReports.map((lab) => (
                      <div
                        key={lab.id}
                        className={`p-4 rounded-xl border ${lab.isAbnormal ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-slate-50"}`}
                      >
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div>
                            <p className="font-semibold text-slate-800">{lab.testName}</p>
                            <p className="text-xs text-slate-500">{lab.category}</p>
                          </div>
                          <Badge className={getLabStatusBadge(lab.status)}>{lab.status}</Badge>
                        </div>
                        {lab.result && (
                          <p className={`text-sm font-medium mt-2 ${lab.isAbnormal ? "text-red-700" : "text-slate-700"}`}>
                            Result: {lab.result}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>Ordered: {lab.orderedOn}</span>
                          {lab.resultOn && <span>• Result: {lab.resultOn}</span>}
                          <span>• By {lab.orderedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">No lab reports recorded for this patient</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals History Tab */}
          <TabsContent value="vitals" className="mt-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-slate-800">Vitals Trend History</h3>
                </div>
                {patient.vitalsHistory && patient.vitalsHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Recorded On</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">BP</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Pulse</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Temp</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">RR</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">SpO₂</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Pain</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patient.vitalsHistory.map((v, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0">
                            <td className="px-4 py-3 font-semibold text-slate-700">{v.recordedOn}</td>
                            <td className="px-4 py-3 text-slate-600">{v.bp} mmHg</td>
                            <td className="px-4 py-3 text-slate-600">{v.pulse} /min</td>
                            <td className="px-4 py-3 text-slate-600">{v.temp} °F</td>
                            <td className="px-4 py-3 text-slate-600">{v.rr} /min</td>
                            <td className="px-4 py-3 text-slate-600">{v.spo2}%</td>
                            <td className="px-4 py-3 text-slate-600">{v.pain}/10</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">No vitals history recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-bold text-slate-800">Clinical Activity Log</h3>
                </div>
                {patient.clinicalLogs && patient.clinicalLogs.length > 0 ? (
                  <div className="space-y-3">
                    {patient.clinicalLogs.map((log) => (
                      <div key={log.id} className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                          {getLogIcon(log.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="text-sm font-semibold text-slate-800">{log.title}</p>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">{log.type}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{log.description}</p>
                          <p className="text-xs text-slate-400 mt-1.5">{log.timestamp} • {log.recordedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-8">No clinical logs recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Review Vitals CTA */}
        <Card className="border-blue-200 bg-blue-50/60">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">Ready to review latest vitals?</p>
                <p className="text-sm text-slate-500">Go to the Review Vitals page for {patient.patientName}</p>
              </div>
            </div>
            <Button onClick={handleReviewVitals} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
              <Activity className="w-4 h-4 mr-2" />
              Review Vitals
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function VitalMini({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="text-base font-bold text-slate-800 mt-0.5">
        {value} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
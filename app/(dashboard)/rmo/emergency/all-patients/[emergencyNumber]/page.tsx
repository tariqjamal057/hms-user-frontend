// app/(dashboard)/rmo/emergency/all-patients/[emergencyNumber]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Activity, AlertTriangle, HeartCrack, History } from "lucide-react";
import { PatientDetailShell, type PatientDetailData, type PatientTab, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import { EMERGENCY_PATIENTS } from "@/lib/emergency/emergency-data";
import { EmergencyStatusBadge } from "@/app/(dashboard)/admission/emergency/all-patients/_components/emergency-badges";
import { SectionRegistration } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-registration";
import { SectionVitals } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-vitals";
import { SectionDiagnosis } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-diagnosis";
import { SectionMedicines } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-medicines";
import { SectionLabReports } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-lab-reports";
import { SectionProgressNotes } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-progress-notes";
import { SectionTreatmentPlan } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-treatment-plan";
import { SectionAssignedNurses } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-assigned-nurses";
import { SectionHandoverPolice } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-handover-police";

const patientsPath = "/rmo/emergency/all-patients";

export default function RmoEmergencyPatientDetailPage() {
  const params = useParams();
  const emergencyNumber = params.emergencyNumber as string;
  const source = EMERGENCY_PATIENTS.find(
    (p) => p.emergencyNumber === emergencyNumber,
  );

  if (!source) return notFound();

  const patient: RmoEmergencyPatient = { ...source, criticalNotifications: [] };
  const displayName = patient.patientName || "Unidentified Patient";

  const patientList: PatientListItem[] = EMERGENCY_PATIENTS.map((p) => ({
    uhid: p.emergencyNumber,
    name: p.patientName || "Unidentified",
    subtitle: `${p.emergencyNumber} · ${p.incidentType} · ${p.bedOrBay}`,
  }));

  const detail: PatientDetailData = {
    uhid: patient.uhid,
    name: displayName,
    age: patient.age ?? 0,
    gender: patient.gender,
    bloodGroup: "",
    allergies: patient.allergies,
    acuity: patient.status,
    moduleId: patient.emergencyNumber,
    moduleIdLabel: "Emergency No",
    locationParts: [patient.bedOrBay],
    contact: patient.mobileNumber || undefined,
    fallbackInfoFields: [
      { label: "Attending Doctor", value: patient.attendingDoctor },
      { label: "Assigned RMO", value: patient.assignedRmo },
      { label: "Assigned Nurse", value: patient.assignedNurse },
      { label: "Incident", value: patient.incidentType },
      { label: "Arrival Mode", value: patient.arrivalMode },
      { label: "Registered By", value: `${patient.registeredBy} · ${patient.registeredAt}` },
    ],
  };

  const tabs: PatientTab[] = [
    { value: "registration", label: "Registration", content: <SectionRegistration patient={patient} /> },
    { value: "vitals", label: "Vitals", content: <SectionVitals vitals={patient.vitals} recordPath={`/rmo/emergency/all-patients/${patient.emergencyNumber}/record-vitals`} /> },
    { value: "diagnosis", label: "Diagnosis", content: <SectionDiagnosis diagnoses={patient.diagnoses} /> },
    { value: "medicines", label: "Medicines", content: <SectionMedicines doses={patient.doses} /> },
    { value: "labs", label: "Labs", content: <SectionLabReports reports={patient.labReports} /> },
    { value: "notes", label: "Progress Notes", content: <SectionProgressNotes notes={patient.progressNotes} /> },
    { value: "treatment", label: "Treatment", content: <SectionTreatmentPlan plans={patient.treatmentPlans} /> },
    { value: "nurses", label: "Nurses", content: <SectionAssignedNurses assignments={patient.assignedNurses} /> },
    { value: "handover", label: "Handover", content: <SectionHandoverPolice handovers={patient.handovers} police={patient.police} onInformPolice={() => {}} /> },
    { value: "status", label: "Status Log", content: <StatusLogSection patient={patient} status={patient.status} /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath={patientsPath}
      tabs={tabs}
      defaultTab="registration"
    />
  );
}

function StatusLogSection({ patient, status }: { patient: RmoEmergencyPatient; status: RmoEmergencyPatient["status"] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><Activity className="h-4 w-4 text-violet-600" />Current Status</p>
        <div className="mt-3 flex items-center gap-2">
          <EmergencyStatusBadge status={status} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Status changes are disabled for this profile. Current status is managed by the attending clinical team.
        </p>
      </div>

      {patient.criticalNotifications.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-red-800"><AlertTriangle className="h-4 w-4" />Critical Notifications</p>
          {patient.criticalNotifications.map((n) => (
            <p key={n.id} className="mt-2 text-xs text-slate-600">{n.notifiedAt} · {n.notifiedTo} · {n.note}</p>
          ))}
        </div>
      )}

      {patient.deathRecord && (
        <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><HeartCrack className="h-4 w-4" />Death Documentation Saved</p>
          <p className="mt-2 text-xs text-slate-600">
            Declared by {patient.deathRecord.declaredBy} · Cause: {patient.deathRecord.causeOfDeath} · Manner: {patient.deathRecord.manner}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><History className="h-4 w-4 text-slate-500" />Status Change Log</p>
        <div className="mt-3 space-y-3">
          {patient.statusLog.map((log) => (
            <div key={log.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-violet-500" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <EmergencyStatusBadge status={log.status} />
                  <span className="text-xs text-slate-400">{log.changedAt}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Changed by <span className="font-semibold text-slate-700">{log.changedBy}</span>
                  {log.reason ? ` · ${log.reason}` : ""}
                </p>
              </div>
            </div>
          ))}
          {patient.statusLog.length === 0 && <p className="text-xs text-slate-400">No status changes recorded.</p>}
        </div>
      </div>
    </div>
  );
}
// app/(dashboard)/doctor/opd/appointments/[uhid]/page.tsx
"use client";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientDetailShell, type PatientTab, type PatientDetailData, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import {
  getAllAppointments,
  getPatientByUhid,
  type PatientFullProfile,
} from "@/lib/doctor/opd/opd-mock-data";
import { OpdOverview, OpdVitalsTab, OpdConsultationsTab, OpdMedicinesTab, OpdLabsTab } from "../_components/opd-tabs";

function toDetailData(p: PatientFullProfile): PatientDetailData {
  return {
    uhid: p.uhid,
    name: p.patientName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies ?? [],
    moduleId: p.appointmentNo,
    moduleIdLabel: "OPD ID",
    locationParts: [p.visitType === "video" ? "Video Visit" : "In-Person Visit"],
    metaLine: p.reason,
    fallbackInfoFields: [
      { label: "Patient Type", value: p.patientType },
      { label: "Appointment", value: p.appointmentNo },
      { label: "Time", value: p.time },
      { label: "Doctor", value: p.doctor },
    ],
  };
}

export default function DoctorOpdPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uhid = params.uhid as string;

  const all = useMemo(() => getAllAppointments(), []);
  const patient = getPatientByUhid(uhid);

  const detail: PatientDetailData | undefined = patient ? toDetailData(patient) : undefined;

  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.uhid} · ${p.appointmentNo} · ${p.time}`,
      })),
    [all],
  );

  if (!patient || !detail) {
    return (
      <div className="p-10 text-center text-sm text-slate-400">
        Patient not found for UHID {uhid}
      </div>
    );
  }

  const tabs: PatientTab[] = [
    { value: "overview", label: "Overview", content: <OpdOverview patient={patient} /> },
    { value: "vitals", label: "Vitals History", content: <OpdVitalsTab patient={patient} /> },
    { value: "consultations", label: "Consultations", content: <OpdConsultationsTab patient={patient} /> },
    { value: "medicines", label: "Medicines", content: <OpdMedicinesTab patient={patient} /> },
    { value: "labs", label: "Lab Reports", content: <OpdLabsTab patient={patient} /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath="/doctor/opd/appointments"
      tabs={tabs}
      subtitle="OPD Consultation"
      headerActions={
        <Button
          size="sm"
          className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => router.push(`/doctor/opd/consultation/${uhid}`)}
        >
          <Stethoscope className="h-4 w-4" />
          Start Consultation
        </Button>
      }
    />
  );
}

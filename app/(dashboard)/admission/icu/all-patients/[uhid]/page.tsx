"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { CalendarDays, Heart, MapPin, Phone, Shield, User, Users } from "lucide-react";
import type { IcuPatient, IcuStatus } from "@/types/admission-desk/icu/icu-types";
import { ICU_PATIENTS, ICU_STATUS_OPTIONS } from "@/lib/admission-desk/icu/icu-data";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS: { label: string; value: string; color: string; dot: string }[] = ICU_STATUS_OPTIONS.map((s) =>
  s === "Stable"
    ? { label: s, value: s, color: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" }
    : s === "Critical"
      ? { label: s, value: s, color: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" }
      : s === "Under Observation"
        ? { label: s, value: s, color: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" }
        : s === "Released"
          ? { label: s, value: s, color: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" }
          : s === "Follow-up OPD"
            ? { label: s, value: s, color: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" }
            : { label: s, value: s, color: "border-violet-200 bg-violet-50 text-violet-700", dot: "bg-violet-500" },
);

export default function IcuPatientDetailPage() {
  const params = useParams<{ uhid: string }>();
  const [patients] = useState<IcuPatient[]>(ICU_PATIENTS);
  const patient = useMemo(
    () => patients.find((p) => p.uhid === params.uhid) ?? null,
    [patients, params.uhid],
  );
  const [status, setStatus] = useState<IcuStatus>(patient?.status ?? "Under Observation");

  const patientList: PatientListItem[] = useMemo(
    () =>
      patients.map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.icuId} · ${p.ward} ${p.bed}`,
      })),
    [patients],
  );

  if (!patient) return notFound();
  const active = { ...patient, status };

  const patientData: PatientDetailData = {
    uhid: active.uhid,
    name: active.patientName,
    age: active.age,
    gender: active.gender,
    bloodGroup: "Unspecified",
    allergies: active.allergies,
    acuity: ["Critical", "Under Observation", "Stable"].includes(active.status)
      ? (active.status as "Critical" | "Under Observation" | "Stable")
      : undefined,
    moduleId: active.icuId,
    moduleIdLabel: "ICU ID",
    locationParts: [active.floor, active.ward, active.room, active.bed],
    metaLine: active.admissionType,
    fallbackInfoFields: [
      { label: "Assigned Doctor", value: active.assignedDoctor },
      { label: "Assigned RMO", value: active.assignedRmo },
      { label: "Admission Date", value: new Date(active.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
      { label: "Admission Time", value: active.admissionTime },
    ],
  };

  const tabs: PatientTab[] = [
    { value: "overview", label: "Overview", content: <OverviewTab patient={active} /> },
    { value: "contact", label: "Contact", content: <ContactTab patient={active} /> },
    { value: "insurance", label: "Insurance", content: <InsuranceTab patient={active} /> },
    { value: "medical", label: "Medical", content: <MedicalTab patient={active} /> },
    { value: "nurses", label: "Nurses", content: <NursesTab patient={active} /> },
  ];

  return (
    <PatientDetailShell
      patient={patientData}
      patientList={patientList}
      patientsPath="/admission/icu/all-patients"
      status={active.status}
      statusOptions={STATUS_OPTIONS}
      onStatusChange={(s) => setStatus(s as IcuStatus)}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}

function OverviewTab({ patient }: { patient: IcuPatient }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard icon={<User className="h-4 w-4" />} label="Age / Gender" value={`${patient.age} / ${patient.gender}`} />
        <InfoCard icon={<CalendarDays className="h-4 w-4" />} label="Date of Birth" value={patient.dateOfBirth ?? "Not available"} />
        <InfoCard icon={<MapPin className="h-4 w-4" />} label="Floor / Ward" value={`${patient.floor} / ${patient.ward}`} />
        <InfoCard icon={<Heart className="h-4 w-4" />} label="Room / Bed" value={`${patient.room} / ${patient.bed}`} />
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
        <p className="text-sm font-bold text-blue-900">Current Condition</p>
        <p className="mt-2 text-sm text-blue-800">{patient.currentCondition}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Diagnosis</p>
        <p className="mt-2 text-sm text-slate-600">{patient.diagnosis}</p>
        {patient.allergies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {patient.allergies.map((allergy, i) => (
              <span key={i} className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                ⚠ {allergy}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Admission Details</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <DetailRow label="Admission Date" value={new Date(patient.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
          <DetailRow label="Admission Time" value={patient.admissionTime} />
          <DetailRow label="Admitted By" value={patient.admittedBy} />
          <DetailRow label="Referred From" value={patient.referredFrom ?? "Direct"} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Medical Team</p>
        <div className="mt-3 space-y-3">
          <TeamRow role="Assigned Doctor" name={patient.assignedDoctor} />
          <TeamRow role="Assigned RMO" name={patient.assignedRmo} />
        </div>
      </div>
    </div>
  );
}

function ContactTab({ patient }: { patient: IcuPatient }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Patient Contact Information</p>
        <div className="mt-4 space-y-4">
          <DetailRow label="Mobile Number" value={patient.mobileNumber || "Not provided"} icon={<Phone className="h-4 w-4" />} />
          <DetailRow label="Alternative Mobile" value={patient.alternativeMobile || "Not provided"} icon={<Phone className="h-4 w-4" />} />
          <DetailRow label="Address" value={`${patient.address}, ${patient.city}, ${patient.state} - ${patient.pinCode}`} icon={<MapPin className="h-4 w-4" />} />
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
        <p className="text-sm font-bold text-emerald-900">Emergency Contact</p>
        <div className="mt-4 space-y-4">
          <DetailRow label="Emergency Contact Name" value={patient.emergencyContactName || "Not provided"} icon={<User className="h-4 w-4" />} />
          <DetailRow label="Relationship" value={patient.emergencyContactRelationship || "Not provided"} icon={<Users className="h-4 w-4" />} />
          <DetailRow label="Emergency Contact Number" value={patient.emergencyContactNumber || "Not provided"} icon={<Phone className="h-4 w-4 text-red-600" />} />
        </div>
      </div>
    </div>
  );
}

function InsuranceTab({ patient }: { patient: IcuPatient }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Government Identification</p>
        <div className="mt-4 space-y-4">
          <DetailRow label="Aadhar Number" value={patient.aadharNumber || "Not provided"} icon={<Shield className="h-4 w-4" />} />
          <DetailRow label="Ayushman Bharat Card" value={patient.ayushmanCardNumber || "Not enrolled"} icon={<Shield className="h-4 w-4 text-emerald-600" />} />
        </div>
      </div>

      {patient.tpaName || patient.healthInsuranceName ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
          <p className="text-sm font-bold text-blue-900">Private Insurance / TPA</p>
          <div className="mt-4 space-y-4">
            {patient.tpaName && <DetailRow label="TPA Name" value={patient.tpaName} icon={<Shield className="h-4 w-4" />} />}
            {patient.healthInsuranceName && <DetailRow label="Health Insurance" value={patient.healthInsuranceName} icon={<Shield className="h-4 w-4" />} />}
            {patient.insurancePolicyNumber && <DetailRow label="Policy Number" value={patient.insurancePolicyNumber} icon={<Shield className="h-4 w-4" />} />}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">No private insurance or TPA information provided.</p>
        </div>
      )}
    </div>
  );
}

function MedicalTab({ patient }: { patient: IcuPatient }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
        <p className="text-sm font-bold text-red-900">Allergies</p>
        {patient.allergies.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {patient.allergies.map((allergy, i) => (
              <span key={i} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700">
                ⚠ {allergy}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-red-800">No known allergies</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Primary Diagnosis</p>
        <p className="mt-2 text-sm text-slate-600">{patient.diagnosis}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-800">Current Condition</p>
        <p className="mt-2 text-sm text-slate-600">{patient.currentCondition}</p>
      </div>

      {patient.notes && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <p className="text-sm font-bold text-amber-900">Clinical Notes</p>
          <p className="mt-2 text-sm text-amber-800">{patient.notes}</p>
        </div>
      )}
    </div>
  );
}

function NursesTab({ patient }: { patient: IcuPatient }) {
  const [shiftFilter, setShiftFilter] = useState("All");
  const filteredNurses = patient.assignedNurses.filter(
    (a) => shiftFilter === "All" || a.shift === shiftFilter,
  );

  const groupedByDate = useMemo(() => {
    const map = new Map<string, typeof patient.assignedNurses>();
    filteredNurses.forEach((assignment) => {
      const existing = map.get(assignment.date) ?? [];
      existing.push(assignment);
      map.set(assignment.date, existing);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredNurses]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-bold text-slate-800">Nursing Staff Assignments</p>
        <Select value={shiftFilter} onValueChange={setShiftFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Shifts</SelectItem>
            <SelectItem value="Morning">Morning</SelectItem>
            <SelectItem value="Evening">Evening</SelectItem>
            <SelectItem value="Night">Night</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {groupedByDate.map(([date, assignments]) => {
          const morning = assignments.find((a) => a.shift === "Morning");
          const evening = assignments.find((a) => a.shift === "Evening");
          const night = assignments.find((a) => a.shift === "Night");

          return (
            <div key={date} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-xs text-slate-500">Nursing Duty Roster</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-400">
                      <th className="py-3 pr-4">Morning Shift</th>
                      <th className="py-3 pr-4">Evening Shift</th>
                      <th className="py-3 pr-4">Night Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pr-4">
                        {morning ? (
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                              {morning.nurseName.split(" ").pop()?.charAt(0)}
                            </span>
                            <span className="font-semibold text-slate-700">{morning.nurseName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        {evening ? (
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                              {evening.nurseName.split(" ").pop()?.charAt(0)}
                            </span>
                            <span className="font-semibold text-slate-700">{evening.nurseName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        {night ? (
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                              {night.nurseName.split(" ").pop()?.charAt(0)}
                            </span>
                            <span className="font-semibold text-slate-700">{night.nurseName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {groupedByDate.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-600">No nursing assignments found</p>
            <p className="mt-1 text-xs text-slate-400">No nursing duty roster available for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-slate-400">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function TeamRow({ role, name }: { role: string; name: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3">
      <span className="text-sm font-medium text-slate-600">{role}</span>
      <span className="text-sm font-bold text-slate-800">{name}</span>
    </div>
  );
}
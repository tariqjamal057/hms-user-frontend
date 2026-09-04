// app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-registration.tsx
import {
  BedDouble,
  Hash,
  PhoneCall,
  ShieldAlert,
  Siren,
  Stethoscope,
  User,
  UserCog,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InfoTile } from "@/components/patient-detail/info-tile";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { EmergencyPatient } from "@/types/emergency/emergency-types";
import { EmergencyStatusBadge } from "../emergency-badges";

export function SectionRegistration({ patient }: { patient: EmergencyPatient }) {
  const initials = (patient.patientName || "U").charAt(0).toUpperCase();
  const isMlc = patient.police.caseType !== "None";

  return (
    <div className="space-y-4">
      {/* Patient identity card */}
      <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-lg font-bold text-white shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    {patient.patientName || "Unidentified Patient"}
                  </h3>
                  <EmergencyStatusBadge status={patient.status} />
                  {patient.allergies.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700"
                    >
                      Allergy: {patient.allergies.join(", ")}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {patient.age ? `${patient.age} yrs` : "Age unknown"} ·{" "}
                  {patient.gender} · UHID {patient.uhid}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current condition */}
      <InfoAlertCard
        tone="amber"
        icon={<Siren className="h-4 w-4" />}
        title="Current Condition"
        body={patient.currentCondition}
      />

      {/* Identity & care team */}
      <Card className="border-slate-200 p-0 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200">
              <UserRound className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-bold text-slate-800 sm:text-base">
              Identity &amp; Care Team
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoTile tone="blue" accent icon={Hash} label="Emergency No." value={patient.emergencyNumber} />
            <InfoTile tone="purple" accent icon={BedDouble} label="Bed / Bay" value={patient.bedOrBay} />
            <InfoTile tone="emerald" accent icon={Stethoscope} label="Attending Doctor" value={patient.attendingDoctor || "Unassigned"} />
            <InfoTile tone="amber" accent icon={UserCog} label="Assigned RMO" value={patient.assignedRmo || "—"} hint={patient.assignedRmo ? "On duty" : "Awaiting assignment"} />
            <InfoTile tone="emerald" accent icon={UserRound} label="Assigned Nurse" value={patient.assignedNurse || "—"} />
            <InfoTile tone="slate" accent icon={PhoneCall} label="Contact" value={patient.mobileNumber || "—"} />
            <InfoTile tone="slate" accent icon={User} label="Attendant" value={patient.attendantName || "—"} />
            <InfoTile tone="slate" accent icon={User} label="Registered By" value={patient.registeredBy} hint={patient.registeredAt} />
          </div>
        </CardContent>
      </Card>

      {/* Emergency intake details */}
      <Card className="border-slate-200 p-0 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm shadow-red-200">
              <Siren className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-bold text-slate-800 sm:text-base">
              Emergency Intake Details
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoTile tone="red" accent icon={Siren} label="Arrival Mode" value={patient.arrivalMode} />
            <InfoTile tone="amber" accent icon={ShieldAlert} label="Incident / Reason" value={patient.incidentType} multiline />
            <InfoTile tone="slate" accent icon={User} label="Brought By" value={patient.broughtBy || "—"} />
            <InfoTile tone="slate" accent icon={User} label="Referred From" value={patient.referredFrom || "—"} />
          </div>
        </CardContent>
      </Card>

      {/* MLC banner */}
      {isMlc && (
        <InfoAlertCard
          tone="red"
          icon={<ShieldAlert className="h-4 w-4" />}
          title={`Medico-Legal Case · ${patient.police.caseType}`}
          body="Police notification required. See the Shift Handover & Police section for full notification details."
        />
      )}
    </div>
  );
}

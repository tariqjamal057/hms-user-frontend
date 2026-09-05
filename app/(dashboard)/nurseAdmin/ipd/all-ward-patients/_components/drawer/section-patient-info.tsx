// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-patient-info.tsx
"use client";
import { useState } from "react";
import { AlertTriangle, BedDouble, CheckCircle2, Clock3, Eye, FileText, PhoneCall, ShieldAlert, User, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { PillButton } from "@/components/forms/pill-button";
import type { PatientStatus, StatusChangeLog, WardPatientFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { PatientStatusBadge } from "../status-badges";
import { SectionHeader } from "./section-header";

const STATUS_OPTIONS: { status: PatientStatus; icon: React.ElementType; tone: string }[] = [
  { status: "Stable", icon: CheckCircle2, tone: "border-emerald-300 text-emerald-700 hover:bg-emerald-50" },
  { status: "Under Observation", icon: Eye, tone: "border-amber-300 text-amber-700 hover:bg-amber-50" },
  { status: "Critical", icon: AlertTriangle, tone: "border-red-300 text-red-700 hover:bg-red-50" },
];

export function SectionPatientInfo({ patient, onChangeStatus }: { patient: WardPatientFull; onChangeStatus: (status: PatientStatus, reason?: string) => void }) {
  const [pendingStatus, setPendingStatus] = useState<PatientStatus | null>(null);
  const [reason, setReason] = useState("");
  const isDischarged = patient.status === "Discharged";

  function confirmStatus() {
    if (!pendingStatus) return;
    onChangeStatus(pendingStatus, reason.trim() || undefined);
    setPendingStatus(null);
    setReason("");
  }

  const statusLogColumns: DataColumn<StatusChangeLog>[] = [
    {
      key: "changedAt",
      label: "Date / Time",
      render: (log) => <span className="font-medium text-slate-700">{log.changedAt}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (log) => <PatientStatusBadge status={log.status} />,
    },
    { key: "changedBy", label: "Changed By" },
    { key: "reason", label: "Reason", render: (log) => <span className="text-slate-500">{log.reason ?? "—"}</span>, hideOnMobile: true },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<User className="h-5 w-5" />}
        title="Patient Information"
        subtitle={`Admitted ${patient.admittedFrom ?? "to"} ${patient.ward} · ${patient.room} / ${patient.bed}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <PatientStatusBadge status={patient.status} />
        {patient.allergies.length > 0 && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700"><ShieldAlert className="mr-1 h-3 w-3" />{patient.allergies.join(", ")}</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoTileCard title="Bed / Ward" icon={<BedDouble className="h-3.5 w-3.5" />} value={`${patient.bed} · ${patient.ward}`} />
        <InfoTileCard title="Attending Doctor" icon={<User className="h-3.5 w-3.5" />} value={patient.admittingDoctor} />
        <InfoTileCard title="Admitted On" icon={<Clock3 className="h-3.5 w-3.5" />} value={patient.admissionDateTime} />
        <InfoTileCard title="Contact" icon={<PhoneCall className="h-3.5 w-3.5" />} value={patient.contactNumber} />
        <InfoTileCard title="Guardian" icon={<User className="h-3.5 w-3.5" />} value={patient.guardianName ?? "—"} />
        <InfoTileCard title="Room" icon={<BedDouble className="h-3.5 w-3.5" />} value={patient.room} />
      </div>

      <InfoTileCard title="Current Diagnosis" icon={<FileText className="h-3.5 w-3.5" />} tone="purple" multiline value={patient.currentDiagnosis} subtitle={`ICD-10: ${patient.diagnosisCode}`} />

      {!isDischarged && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-800">Update Patient Status</p>
          <p className="mt-1 text-xs text-slate-500">Discharge status can only be set from the Discharge section by the doctor.</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {STATUS_OPTIONS.map(({ status, icon: Icon, tone }) => (
              <PillButton key={status} variant="outline" disabled={patient.status === status} className={`gap-2 ${tone}`} onClick={() => setPendingStatus(status)}>
                <Icon className="h-4 w-4" />{status}
              </PillButton>
            ))}
          </div>

          {pendingStatus && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <p className="text-sm font-semibold text-blue-800">
                {pendingStatus === "Critical" ? "Mark patient as Critical and notify doctor immediately?" : `Change status to "${pendingStatus}"?`}
              </p>
              {pendingStatus === "Critical" && <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertTriangle className="h-3.5 w-3.5" />The attending doctor will be notified instantly.</p>}
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason / notes (optional)" rows={2} className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-sm" />
              <div className="mt-2 flex gap-2">
                <PillButton size="sm" variant="outline" onClick={() => { setPendingStatus(null); setReason(""); }}>Cancel</PillButton>
                <PillButton size="sm" className={pendingStatus === "Critical" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} onClick={confirmStatus}>
                  Confirm {pendingStatus === "Critical" && "& Notify Doctor"}
                </PillButton>
              </div>
            </div>
          )}
        </div>
      )}

      <DataTable
        card
        title="Status Change History"
        titleIcon={<UserCog className="h-4 w-4" />}
        rows={patient.statusLog}
        columns={statusLogColumns}
        rowKey={(log) => log.id}
        countLabel="changes"
        emptyText="No status changes recorded."
      />
    </div>
  );
}
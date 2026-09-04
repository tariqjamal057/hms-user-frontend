// app/(dashboard)/rmo/emergency/all-patients/_components/emergency-status-workflow.tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  History,
  HeartCrack,
} from "lucide-react";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { SingleSelect } from "@/components/forms/select";
import { PillButton } from "@/components/forms/pill-button";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type {
  EmergencyStatus,
  StatusChangeLog,
} from "@/types/emergency/emergency-types";
import type {
  BedOption,
  DeathRecord,
  RmoEmergencyPatient,
} from "@/types/emergency/rmo-emergency-types";
import { RMO_BEDS } from "@/lib/emergency/rmo-emergency-data";
import {
  BedAllocationDrawer,
  CriticalNotificationDrawer,
  DeathDocumentationDrawer,
} from "./status-workflow-drawers";
import { EmergencyStatusBadge } from "@/app/(dashboard)/admission/emergency/all-patients/_components/emergency-badges";

const statuses: EmergencyStatus[] = [
  "Under Observation",
  "Stable",
  "Critical",
  "Shifted to IPD",
  "Shifted to OT",
  "Shifted to ICU",
  "Well & Released",
  "Follow-up OPD",
  "Patient Death",
];
export function EmergencyStatusWorkflow({
  patient,
  onUpdate,
}: {
  patient: RmoEmergencyPatient;
  onUpdate: (patient: RmoEmergencyPatient) => void;
}) {
  const [selected, setSelected] = useState<EmergencyStatus>(patient.status);
  const [bedTarget, setBedTarget] = useState<
    "Shifted to IPD" | "Shifted to ICU" | null
  >(null);
  const [critical, setCritical] = useState(false);
  const [death, setDeath] = useState(false);
  function choose(value: EmergencyStatus) {
    setSelected(value);
    if (value === "Shifted to IPD" || value === "Shifted to ICU")
      setBedTarget(value);
    else if (value === "Critical") setCritical(true);
    else if (value === "Patient Death") setDeath(true);
    else saveStatus(value);
  }
  function saveStatus(status: EmergencyStatus, reason?: string) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    onUpdate({
      ...patient,
      status,
      statusLog: [
        {
          id: `S-${Date.now()}`,
          status,
          changedBy: "Doctor",
          changedAt: stamp,
          reason,
        },
        ...patient.statusLog,
      ],
    });
    toast.success(`Status changed to ${status}.`);
  }
  function bookBed(bed: BedOption) {
    saveStatus(
      bedTarget as EmergencyStatus,
      `Bed booked: ${bed.ward}, Room ${bed.room}, Bed ${bed.bed}`,
    );
    setBedTarget(null);
  }
  function notify(doctor: string, note: string) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    onUpdate({
      ...patient,
      status: "Critical",
      criticalNotifications: [
        {
          id: `CN-${Date.now()}`,
          patientEmergencyNumber: patient.emergencyNumber,
          notifiedTo: doctor,
          note,
          notifiedBy: "Doctor",
          notifiedAt: stamp,
        },
        ...patient.criticalNotifications,
      ],
      statusLog: [
        {
          id: `S-${Date.now()}`,
          status: "Critical",
          changedBy: "Doctor",
          changedAt: stamp,
          reason: note,
        },
        ...patient.statusLog,
      ],
    });
    setCritical(false);
    toast.success("Doctor notified and patient marked Critical.");
  }
  function recordDeath(record: DeathRecord) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    onUpdate({
      ...patient,
      status: "Patient Death",
      deathRecord: record,
      statusLog: [
        {
          id: `S-${Date.now()}`,
          status: "Patient Death",
          changedBy: record.declaredBy || "Doctor",
          changedAt: stamp,
          reason: record.causeOfDeath,
        },
        ...patient.statusLog,
      ],
    });
    setDeath(false);
    toast.success("Death documentation saved and status updated.");
  }

  const logColumns: DataColumn<StatusChangeLog>[] = [
    {
      key: "status",
      label: "Status",
      render: (l) => <EmergencyStatusBadge status={l.status} />,
    },
    {
      key: "changedBy",
      label: "Changed By",
      render: (l) => (
        <span className="font-semibold text-slate-800">{l.changedBy}</span>
      ),
    },
    {
      key: "changedAt",
      label: "Time",
      render: (l) => <span className="text-xs text-slate-500">{l.changedAt}</span>,
    },
    {
      key: "reason",
      label: "Reason",
      render: (l) =>
        l.reason ? (
          <span className="text-slate-600">{l.reason}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-bold text-slate-800">Change Patient Status</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Special workflows open automatically for Critical, IPD, ICU, and
          Patient Death.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SingleSelect
              label=""
              value={selected}
              onChange={(v) => choose(v as EmergencyStatus)}
              options={statuses.map((s) => ({ value: s, label: s }))}
              placeholder="Select status"
            />
          </div>
          <PillButton onClick={() => saveStatus(selected)} className="shrink-0">
            Save Status
          </PillButton>
        </div>
      </div>

      {patient.criticalNotifications.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Critical Notifications"
          body={patient.criticalNotifications
            .map((n) => `${n.notifiedAt} · ${n.notifiedTo} · ${n.note}`)
            .join("\n")}
        />
      )}
      {patient.deathRecord && (
        <InfoAlertCard
          tone="slate"
          icon={<HeartCrack className="h-4 w-4" />}
          title="Death Documentation Saved"
          body={`Declared by ${patient.deathRecord.declaredBy} · Cause: ${patient.deathRecord.causeOfDeath} · Manner: ${patient.deathRecord.manner}`}
        />
      )}

      <DataTable
        card
        title="Status Change Log"
        titleIcon={<History className="h-4 w-4" />}
        rows={patient.statusLog}
        columns={logColumns}
        rowKey={(l) => l.id}
        countLabel="entries"
        emptyText="No status changes recorded yet."
      />

      <BedAllocationDrawer
        patient={bedTarget ? patient : null}
        target={bedTarget || "Shifted to IPD"}
        beds={RMO_BEDS}
        onClose={() => setBedTarget(null)}
        onBook={bookBed}
      />
      <CriticalNotificationDrawer
        patient={critical ? patient : null}
        onClose={() => setCritical(false)}
        onSend={notify}
      />
      <DeathDocumentationDrawer
        patient={death ? patient : null}
        onClose={() => setDeath(false)}
        onConfirm={recordDeath}
      />
    </div>
  );
}


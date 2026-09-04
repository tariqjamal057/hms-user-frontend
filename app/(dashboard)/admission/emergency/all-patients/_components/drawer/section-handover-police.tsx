// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-handover-police.tsx
"use client";
import { useState } from "react";
import {
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  Phone,
  ShieldAlert,
} from "lucide-react";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { SuffixedInput, FormTextarea } from "@/components/forms/form-controls";
import { PillButton } from "@/components/forms/pill-button";
import type {
  PoliceNotification,
  ShiftHandoverEntry,
  ShiftName,
} from "@/types/emergency/emergency-types";

const shiftBadge: Record<ShiftName, string> = {
  Morning: "border-amber-200 bg-amber-50 text-amber-700",
  Evening: "border-orange-200 bg-orange-50 text-orange-700",
  Night: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export function SectionHandoverPolice({
  handovers,
  police,
  onInformPolice,
}: {
  handovers: ShiftHandoverEntry[];
  police: PoliceNotification;
  onInformPolice: (firNumber: string, remarks: string) => void;
}) {
  const [firNumber, setFirNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const columns: DataColumn<ShiftHandoverEntry>[] = [
    {
      key: "fromNurse",
      label: "From",
      render: (h) => (
        <div>
          <p className="font-semibold text-slate-800">{h.fromNurse}</p>
          <span
            className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${shiftBadge[h.fromShift]}`}
          >
            {h.fromShift}
          </span>
        </div>
      ),
    },
    {
      key: "toNurse",
      label: "To",
      render: (h) => (
        <div>
          <p className="font-semibold text-slate-800">{h.toNurse}</p>
          <span
            className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${shiftBadge[h.toShift]}`}
          >
            {h.toShift}
          </span>
        </div>
      ),
    },
    {
      key: "handoverDateTime",
      label: "Handover Time",
      render: (h) => (
        <span className="text-xs text-slate-500">{h.handoverDateTime}</span>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (h) =>
        h.notes ? (
          <span className="text-sm italic text-slate-600">&quot;{h.notes}&quot;</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {police.caseType !== "None" &&
        (police.informed ? (
          <InfoAlertCard
            tone="emerald"
            icon={<CheckCircle2 className="h-4 w-4" />}
            title={`Medico-Legal Case: ${police.caseType} — Police Informed`}
            body={`Nearest Police Station: ${police.nearestPoliceStation}\nInformed on ${police.informedAt} by ${police.informedBy}${police.firNumber ? `\nFIR Number: ${police.firNumber}` : ""}${police.remarks ? `\nRemarks: ${police.remarks}` : ""}`}
          />
        ) : (
          <InfoAlertCard
            tone="red"
            icon={<ShieldAlert className="h-4 w-4" />}
            title={`Medico-Legal Case: ${police.caseType}`}
            body={`Nearest Police Station: ${police.nearestPoliceStation}\nPolice notification pending.`}
          />
        ))}

      {police.caseType === "None" && (
        <InfoAlertCard
          tone="slate"
          icon={<AlertOctagon className="h-4 w-4" />}
          title="Not a Medico-Legal Case"
          body="This is not a medico-legal case. No police notification required."
        />
      )}

      {police.caseType !== "None" && !police.informed && (
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-red-800">
            <Phone className="h-4 w-4" />
            Inform {police.nearestPoliceStation}
          </p>
          <div className="mt-3 space-y-3">
            <SuffixedInput
              label="FIR Number (Optional)"
              value={firNumber}
              onChange={setFirNumber}
              placeholder="Enter FIR number"
            />
            <FormTextarea
              label="Remarks (Optional)"
              rows={3}
              maxLength={500}
              value={remarks}
              onChange={setRemarks}
              placeholder="Add any remarks..."
            />
            <PillButton
              variant="gradient"
              icon={Phone}
              onClick={() => onInformPolice(firNumber, remarks)}
            >
              Inform Police
            </PillButton>
          </div>
        </div>
      )}

      <DataTable
        card
        title="Shift Handover Logs"
        titleIcon={<ArrowRightLeft className="h-4 w-4" />}
        rows={handovers}
        columns={columns}
        rowKey={(h) => h.id}
        countLabel="handovers"
        emptyText="No shift handovers recorded yet for this patient."
      />
    </div>
  );
}

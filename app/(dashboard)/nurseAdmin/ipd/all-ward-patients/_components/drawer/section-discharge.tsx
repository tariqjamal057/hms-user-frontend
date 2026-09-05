// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-discharge.tsx
"use client";
import { useState } from "react";
import { BadgeCheck, CheckCircle2, ClipboardList, LogOut, Pill, Salad, Send, Stethoscope, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import { SectionHeader } from "./section-header";
import type { DischargeDetailsFull } from "@/types/nurse-admin/ipd/ward-detail-types";

interface Props {
  patientName: string;
  bed: string;
  ward: string;
  discharge?: DischargeDetailsFull;
  alreadySent: boolean;
  onSendToBilling: () => void;
}

export function SectionDischarge({ patientName, bed, ward, discharge, alreadySent, onSendToBilling }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!discharge) {
    return (
      <div className="space-y-5">
        <SectionHeader
          icon={<Stethoscope className="h-5 w-5" />}
          title="Discharge Process"
          subtitle="Doctor-approved discharge details, nurse approval and finalization to billing & admission desk."
        />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
          <LogOut className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-500">No discharge has been initiated by the doctor yet.</p>
          <p className="mt-1 text-xs text-slate-400">Once the doctor completes the discharge decision, full details will appear here for nurse review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<Stethoscope className="h-5 w-5" />}
        title="Discharge Process"
        subtitle="Doctor-approved discharge details, nurse approval and finalization to billing & admission desk."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><Stethoscope className="h-4 w-4 text-blue-600" />Doctor&apos;s Discharge Details</p>
        <div className="mt-3 space-y-3">
          <Detail label="Final Diagnosis" value={discharge.finalDiagnosis} />
          <Detail label="Discharge Summary" value={discharge.dischargeSummary} />
          <Detail label="Follow-up Date" value={discharge.followUpDate} />
          <Detail label="Follow-up Instructions" value={discharge.followUpInstructions} />
        </div>
        <p className="mt-3 text-xs text-slate-400">Approved by {discharge.dischargedByDoctor} on {discharge.doctorApprovedAt}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><Pill className="h-4 w-4 text-violet-600" />Discharge Medicines</p>
        <div className="mt-3 space-y-2">
          {discharge.dischargeMedicines.map((med, index) => (
            <div key={index} className="flex flex-wrap items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-sm font-semibold text-slate-800">{med.name}</p>
              <p className="text-xs text-slate-500">{med.dosage} · {med.duration}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><Salad className="h-4 w-4 text-emerald-600" />Diet Instructions</p>
        <p className="mt-2 text-sm text-slate-600">{discharge.dietInstructions}</p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><UserCheck className="h-4 w-4" />Nurse Approval</p>
        {discharge.nurseApprovedBy ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Approved by {discharge.nurseApprovedBy} on {discharge.nurseApprovedAt}</p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Pending nurse review before sending to billing.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><ClipboardList className="h-4 w-4 text-blue-600" />Finalize Discharge</p>
        <p className="mt-1 text-xs text-slate-500">Sending will free bed <span className="font-semibold text-slate-700">{bed}</span> in <span className="font-semibold text-slate-700">{ward}</span> for new booking and notify billing & admission desk.</p>

        {alreadySent ? (
          <Badge variant="outline" className="mt-3 gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Discharge details already sent to billing & admission desk{discharge.sentToBillingAt ? ` on ${discharge.sentToBillingAt}` : ""}</Badge>
        ) : confirming ? (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
            <p className="text-sm font-semibold text-blue-800">Confirm sending {patientName}&apos;s discharge to billing & admission desk?</p>
            <p className="mt-1 text-xs text-slate-500">This will mark the patient as Discharged and free the bed immediately.</p>
            <div className="mt-3 flex gap-2">
              <PillButton size="sm" variant="outline" onClick={() => setConfirming(false)}>Cancel</PillButton>
              <PillButton size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => { onSendToBilling(); setConfirming(false); }}><Send className="h-4 w-4" />Confirm & Send</PillButton>
            </div>
          </div>
        ) : (
          <PillButton className="mt-3 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setConfirming(true)}><Send className="h-4 w-4" />Send Discharge Details to Billing & Admission Desk</PillButton>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-700">{value}</p>
    </div>
  );
}
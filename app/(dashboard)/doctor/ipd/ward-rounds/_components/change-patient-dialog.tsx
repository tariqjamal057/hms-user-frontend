
"use client";

import { useMemo, useState, useEffect } from "react";
import { Users } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SuffixedInput } from "@/components/forms/form-controls";
import { PillButton } from "@/components/forms/pill-button";
import { PatientStatusBadge } from "./patient-status-badge";
import { cn } from "@/lib/utils";
import { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";

interface ChangePatientDialogProps {
  patients: WardRoundPatient[];
  currentUhid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPatient: (uhid: string) => void;
}

export function ChangePatientDialog({ patients, currentUhid, open, onOpenChange, onSelectPatient }: ChangePatientDialogProps) {
  const [search, setSearch] = useState("");
  const [highlightedUhid, setHighlightedUhid] = useState(patients[0]?.uhid ?? "");

  const filtered = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) => p.patientName.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || p.ipdId.toLowerCase().includes(q)
    );
  }, [patients, search]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlightedUhid(patients[0]?.uhid ?? "");
    }
  }, [open, patients]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((p) => p.uhid === highlightedUhid)) {
      setHighlightedUhid(filtered[0].uhid);
    }
  }, [filtered, highlightedUhid]);

  function handleConfirm(uhid: string) {
    console.log("Patient selected in Change Patient modal:", uhid);
    onSelectPatient(uhid);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[92vw] !max-w-[520px] max-h-[85vh] flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-slate-100 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Users className="h-5 w-5 text-blue-600" /> Select Patient
          </DialogTitle>
        </DialogHeader>

        <div className="shrink-0 px-5 pt-4">
          <SuffixedInput
            label="Search"
            placeholder="Search by Name / UHID / IPD No. / Bed"
            className="pl-9"
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No patients found.</p>
          )}
          {filtered.map((p) => {
            const isHighlighted = p.uhid === highlightedUhid;
            const isCurrent = p.uhid === currentUhid;
            const initials = p.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <button
                key={p.uhid}
                type="button"
                onClick={() => setHighlightedUhid(p.uhid)}
                onDoubleClick={() => handleConfirm(p.uhid)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isHighlighted ? "border-blue-300 bg-blue-50" : "border-transparent hover:bg-slate-50"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {p.patientName}
                    {isCurrent && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Current</span>}
                  </p>
                  <p className="text-xs text-slate-400">{p.age} Y / {p.gender} · UHID: {p.uhid}</p>
                  <p className="text-xs text-slate-400">{p.ipdId} · Bed: {p.wardRoomBed.split("/").pop()?.trim()}</p>
                </div>
                <PatientStatusBadge status={p.status} />
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <PillButton variant="outline" onClick={() => onOpenChange(false)}>Cancel</PillButton>
          <PillButton variant="gradient" onClick={() => handleConfirm(highlightedUhid)}>
            Select Patient
          </PillButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
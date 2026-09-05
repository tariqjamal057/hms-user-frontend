// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-progress-notes.tsx
"use client";
import { useMemo, useState } from "react";
import { ClipboardList, FileText, Stethoscope, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { ProgressNoteFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { DateFilterBar } from "./date-filter-bar";
import { SectionHeader } from "./section-header";

const ROLE_TONE: Record<ProgressNoteFull["role"], string> = {
  Doctor: "border-blue-200 bg-blue-50 text-blue-700",
  Nurse: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function SectionProgressNotes({ notes }: { notes: ProgressNoteFull[] }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(() => date ? notes.filter((n) => n.date === date) : notes, [notes, date]);
  const doctorCount = notes.filter((n) => n.role === "Doctor").length;
  const nurseCount = notes.filter((n) => n.role === "Nurse").length;
  const latestNote = notes[0];

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<ClipboardList className="h-5 w-5" />}
        title="Progress Notes"
        subtitle={`${notes.length} total entries · all signed notes are immutable`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard title="Total Notes" icon={<FileText className="h-3.5 w-3.5" />} tone="blue" value={String(notes.length)} subtitle={`${filtered.length} matching`} />
        <InfoTileCard title="Doctor Notes" icon={<Stethoscope className="h-3.5 w-3.5" />} tone="purple" value={String(doctorCount)} subtitle="Attending team" />
        <InfoTileCard title="Nurse Notes" icon={<UserRound className="h-3.5 w-3.5" />} tone="emerald" value={String(nurseCount)} subtitle="Bedside team" />
        <InfoTileCard title="Last Entry" icon={<FileText className="h-3.5 w-3.5" />} tone="slate" value={latestNote ? latestNote.createdAt.split(",")[0]?.trim() || latestNote.createdAt : "—"} subtitle={latestNote ? latestNote.author : "No notes yet"} />
      </div>

      <DateFilterBar value={date} onChange={setDate} label="Filter notes by date" />

      <div className="space-y-3">
        {filtered.map((note) => (
          <div key={note.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={ROLE_TONE[note.role]}>
                {note.role === "Doctor" ? <Stethoscope className="mr-1 h-3 w-3" /> : <UserRound className="mr-1 h-3 w-3" />}
                {note.role.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">{note.category}</Badge>
            </div>
            <h4 className="mt-2 text-base font-bold text-slate-800">{note.title}</h4>
            <p className="mt-1 text-xs text-slate-500">{note.createdAt} · {note.author}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{note.noteText}</p>
          </div>
        ))}
        {filtered.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No progress notes found for this date.</div>}
      </div>
    </div>
  );
}
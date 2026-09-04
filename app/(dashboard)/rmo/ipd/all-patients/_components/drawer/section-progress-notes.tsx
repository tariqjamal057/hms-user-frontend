// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-progress-notes.tsx
"use client";
import { ClipboardList } from "lucide-react";
import type { ProgressNote } from "@/types/rmo/ipd/rmo-types";
import { CURRENT_RMO } from "@/lib/rmo/ipd/rmo-data";
import { ProgressNotesSection } from "@/components/patient-detail/progress-notes-section";

export function SectionProgressNotes({ notes, onAddNote }: { notes: ProgressNote[]; onAddNote: (note: ProgressNote) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-blue-50 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">Progress Notes</p>
          <p className="text-xs text-slate-500">
            Author-filtered note feed with unified sign-off drawer.
          </p>
        </div>
      </div>
      <ProgressNotesSection
        notes={notes}
        onAddNote={onAddNote}
        authorName={CURRENT_RMO.name}
        authorRole="RMO"
        roleOptions={["All", "Doctor", "RMO", "Nurse"]}
        categories={["RMO Review", "Doctor Round", "Nursing Update", "General"]}
        allowDateFilter
        accent="violet"
      />
    </div>
  );
}
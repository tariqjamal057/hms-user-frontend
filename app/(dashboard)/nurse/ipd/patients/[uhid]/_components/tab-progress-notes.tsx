// app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-progress-notes.tsx
"use client";
import { useMemo, useState } from "react";
import {
  Check,
  ClipboardList,
  FileText,
  Filter,
  LockKeyhole,
  Plus,
  Search,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import { FormButton, FormTextarea, SuffixedInput } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { PillButton } from "@/components/forms/pill-button";
import type { NoteRole, ProgressNote } from "@/types/nurse/ipd/nurse-ipd-types";
import { CURRENT_NURSE } from "@/lib/nurse/ipd/nurse-ipd-data";

type AuthorFilter = "All" | NoteRole;

const CATEGORY_OPTIONS = [
  "Nursing Update",
  "Vitals",
  "Medication",
  "Handover",
  "General",
];

const ROLE_TONE: Record<NoteRole, string> = {
  Doctor: "border-blue-200 bg-blue-50 text-blue-700",
  Nurse: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const PRIORITY_TONE: Record<string, string> = {
  Urgent: "border-red-200 bg-red-50 text-red-700",
  Routine: "border-slate-200 bg-slate-50 text-slate-600",
};

export function TabProgressNotes({
  notes,
  onAddNote,
}: {
  notes: ProgressNote[];
  onAddNote: (note: ProgressNote) => void;
}) {
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      notes.filter((note) => {
        const query = search.trim().toLowerCase();
        const matchesAuthor =
          authorFilter === "All" || note.role === authorFilter;
        const matchesSearch =
          !query ||
          [note.title, note.author, note.noteText]
            .join(" ")
            .toLowerCase()
            .includes(query);
        return matchesAuthor && matchesSearch;
      }),
    [notes, authorFilter, search],
  );

  const doctorCount = notes.filter((n) => n.role === "Doctor").length;
  const nurseCount = notes.filter((n) => n.role === "Nurse").length;
  const latestNote = notes[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-sm">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Progress Notes
            </p>
            <p className="text-xs text-slate-500">
              {notes.length} total entries · all signed notes are immutable
            </p>
          </div>
        </div>
        <PillButton
          icon={Plus}
          onClick={() => setOpen(true)}
          className="self-start sm:self-auto"
        >
          New Note
        </PillButton>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Total Notes"
          icon={<FileText className="h-3.5 w-3.5" />}
          tone="blue"
          value={String(notes.length)}
          subtitle={`${filtered.length} matching`}
        />
        <InfoTileCard
          title="Doctor Notes"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          tone="purple"
          value={String(doctorCount)}
          subtitle="Attending team"
        />
        <InfoTileCard
          title="Nurse Notes"
          icon={<User className="h-3.5 w-3.5" />}
          tone="emerald"
          value={String(nurseCount)}
          subtitle="Bedside team"
        />
        <InfoTileCard
          title="Last Entry"
          icon={<LockKeyhole className="h-3.5 w-3.5" />}
          tone="slate"
          value={latestNote ? latestNote.createdAt.split("·")[0]?.trim() || latestNote.createdAt : "—"}
          subtitle={latestNote ? latestNote.author : "No notes yet"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by title, author or content…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Author:</span>
        </div>
        <div className="flex gap-1.5">
          {(["All", "Doctor", "Nurse"] as AuthorFilter[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAuthorFilter(a)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                authorFilter === a
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {filtered.map((note) => (
          <div
            key={note.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={ROLE_TONE[note.role]}>
                {note.role === "Doctor" ? (
                  <Stethoscope className="mr-1 h-3 w-3" />
                ) : (
                  <User className="mr-1 h-3 w-3" />
                )}
                {note.role.toUpperCase()}
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-600"
              >
                {note.category}
              </Badge>
              <Badge
                variant="outline"
                className={PRIORITY_TONE[note.priority] ?? PRIORITY_TONE.Routine}
              >
                {note.priority}
              </Badge>
            </div>
            <h3 className="mt-2 text-base font-bold text-slate-800">
              {note.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {note.createdAt} · {note.author}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {note.noteText}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <LockKeyhole className="h-3.5 w-3.5" />
                {note.status}
              </span>
              <span className="text-slate-400">Immutable</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            No progress notes found.
          </div>
        )}
      </div>

      <NewNoteDrawer
        open={open}
        onOpenChange={setOpen}
        onSave={(note) => {
          onAddNote(note);
          setOpen(false);
        }}
      />
    </div>
  );
}

function NewNoteDrawer({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSave: (note: ProgressNote) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Nursing Update");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setTitle("");
      setCategory("Nursing Update");
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
    }
    onOpenChange(next);
  }

  const valid =
    title.trim() && subjective.trim() && assessment.trim() && plan.trim();

  function handleSave() {
    onSave({
      id: `PN-${Date.now()}`,
      uhid: "",
      title: title.trim(),
      author: CURRENT_NURSE.name,
      role: "Nurse",
      category,
      priority: "Routine",
      createdAt: `Just now · ${new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      status: "Signed & Locked",
      subjective,
      objective,
      assessment,
      plan,
      noteText: `${subjective} ${objective} ${assessment} Plan: ${plan}`,
    });
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<ClipboardList className="h-5 w-5" />}
      title="New Nursing Progress Note"
      description={`Signing as ${CURRENT_NURSE.name} · SOAP format`}
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton
            className="flex-1"
            onClick={handleSave}
            disabled={!valid}
          >
            <Check className="mr-1 h-4 w-4" />
            Save &amp; Sign Note
          </FormButton>
        </div>
      }
    >
      {/* Header fields */}
      <DrawerSection
        title="Note Header"
        caption="Title and category of this note"
        icon={<FileText className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <SuffixedInput
            label="Title *"
            value={title}
            onChange={setTitle}
            placeholder="e.g. Afternoon Nursing Assessment"
          />
          <SingleSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </DrawerSection>

      {/* Subjective */}
      <DrawerSection
        title="Subjective (S)"
        caption="Patient's reported symptoms, complaints and history"
        icon={<User className="h-4 w-4" />}
      >
        <FormTextarea
          label="Subjective *"
          value={subjective}
          onChange={setSubjective}
          rows={3}
          maxLength={1000}
          placeholder="What the patient reports…"
        />
      </DrawerSection>

      {/* Objective */}
      <DrawerSection
        title="Objective (O)"
        caption="Measurable observations: vitals, exam findings, lab results"
        icon={<FileText className="h-4 w-4" />}
      >
        <FormTextarea
          label="Objective (Optional)"
          value={objective}
          onChange={setObjective}
          rows={3}
          maxLength={1000}
          placeholder="What you observed…"
        />
      </DrawerSection>

      {/* Assessment */}
      <DrawerSection
        title="Assessment (A)"
        caption="Clinical interpretation and diagnosis"
        icon={<Stethoscope className="h-4 w-4" />}
      >
        <FormTextarea
          label="Assessment *"
          value={assessment}
          onChange={setAssessment}
          rows={3}
          maxLength={1000}
          placeholder="Your clinical assessment…"
        />
      </DrawerSection>

      {/* Plan */}
      <DrawerSection
        title="Plan (P)"
        caption="Next steps, interventions and follow-up"
        icon={<Check className="h-4 w-4" />}
      >
        <FormTextarea
          label="Plan *"
          value={plan}
          onChange={setPlan}
          rows={3}
          maxLength={1000}
          placeholder="Plan of care…"
        />
      </DrawerSection>
    </ConsultationDrawer>
  );
}

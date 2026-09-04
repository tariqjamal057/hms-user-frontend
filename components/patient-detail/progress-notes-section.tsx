// components/patient-detail/progress-notes-section.tsx
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
import {
  FormButton,
  FormTextarea,
  SuffixedInput,
  DateField,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { PillButton } from "@/components/forms/pill-button";

export type SigningRole = "Doctor" | "RMO" | "Nurse";

// Superset shape accepted by both the RMO (`types/rmo/ipd/rmo-types.ts`) and
// the ICU/nurse (`types/nurse/ipd/nurse-ipd-types.ts`) ProgressNote models.
export type ProgressNoteBase = {
  id: string;
  title: string;
  author: string;
  role: string;
  category: string;
  createdAt: string;
  noteText: string;
  date?: string;
  priority?: string;
  status?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
};

export type ProgressNotesSectionProps<T extends ProgressNoteBase> = {
  notes: T[];
  onAddNote: (note: T) => void;
  authorName: string;
  authorRole: SigningRole;
  roleOptions?: Array<SigningRole | "All">;
  categories?: string[];
  /** When true the note composer uses SOAP fields instead of a single note body. */
  soap?: boolean;
  /** When true a unified DateField date filter is shown (filters by `note.date`). */
  allowDateFilter?: boolean;
  accent?: "blue" | "violet" | "emerald";
  title?: string;
  description?: string;
};

const DEFAULT_CATEGORIES = [
  "RMO Review",
  "Doctor Round",
  "Nursing Update",
  "General",
];

const ACCENTS: Record<string, { gradient: string; icon: string }> = {
  blue: { gradient: "from-blue-500 to-cyan-500", icon: "bg-gradient-to-br from-blue-500 to-cyan-500" },
  violet: { gradient: "from-violet-500 to-purple-500", icon: "bg-gradient-to-br from-violet-500 to-purple-500" },
  emerald: { gradient: "from-emerald-500 to-teal-500", icon: "bg-gradient-to-br from-emerald-500 to-teal-500" },
};

const ROLE_TONE: Record<string, string> = {
  Doctor: "border-blue-200 bg-blue-50 text-blue-700",
  RMO: "border-violet-200 bg-violet-50 text-violet-700",
  Nurse: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  Doctor: <Stethoscope className="mr-1 h-3 w-3" />,
  RMO: <FileText className="mr-1 h-3 w-3" />,
  Nurse: <User className="mr-1 h-3 w-3" />,
};

const PRIORITY_TONE: Record<string, string> = {
  Urgent: "border-red-200 bg-red-50 text-red-700",
  Routine: "border-slate-200 bg-slate-50 text-slate-600",
};

export function ProgressNotesSection<T extends ProgressNoteBase>({
  notes,
  onAddNote,
  authorName,
  authorRole,
  roleOptions = ["All", "Doctor", "RMO", "Nurse"],
  categories = DEFAULT_CATEGORIES,
  soap = false,
  allowDateFilter = false,
  accent = "blue",
  title = "Progress Notes",
  description = `${notes.length} total entries · all signed notes are immutable`,
}: ProgressNotesSectionProps<T>) {
  const [authorFilter, setAuthorFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
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
        const matchesDate = !allowDateFilter || !date || note.date === date;
        return matchesAuthor && matchesSearch && matchesDate;
      }),
    [notes, authorFilter, search, date, allowDateFilter],
  );

  const roleCount = notes.filter((n) => n.role === authorRole).length;
  const doctorCount = notes.filter((n) => n.role === "Doctor").length;
  const latestNote = notes[0];
  const acc = ACCENTS[accent] ?? ACCENTS.blue;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${acc.icon}`}
          >
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              {title}
            </p>
            <p className="text-xs text-slate-500">
              {notes.length} total entries · all signed notes are immutable
              {description ? ` · ${description}` : ""}
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
          title={`${authorRole} Notes`}
          icon={ROLE_ICON[authorRole] ?? <FileText className="h-3.5 w-3.5" />}
          tone="purple"
          value={String(roleCount)}
          subtitle="Signed by this team"
        />
        <InfoTileCard
          title="Doctor Notes"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          tone="purple"
          value={String(doctorCount)}
          subtitle="Attending team"
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
        {allowDateFilter && (
          <div className="w-full sm:w-52">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Date:</span>
            </div>
            <DateField
              label=""
              value={date}
              onChange={setDate}
              placeholder="Filter by date"
            />
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Author:</span>
        </div>
        <div className="w-full sm:w-44">
          <SingleSelect
            label=""
            value={authorFilter}
            onChange={setAuthorFilter}
            placeholder="All Authors"
            options={roleOptions.map((r) => ({
              value: r,
              label: r === "All" ? "All Authors" : r,
            }))}
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} soap={soap} />
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
          onAddNote(note as unknown as T);
          setOpen(false);
        }}
        authorName={authorName}
        authorRole={authorRole}
        categories={categories}
        soap={soap}
        accent={accent}
      />
    </div>
  );
}

function NoteCard({ note, soap }: { note: ProgressNoteBase; soap: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={ROLE_TONE[note.role] ?? ROLE_TONE.Nurse}>
          {ROLE_ICON[note.role] ?? <User className="mr-1 h-3 w-3" />}
          {String(note.role).toUpperCase()}
        </Badge>
        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-50 text-slate-600"
        >
          {note.category}
        </Badge>
        {note.priority && (
          <Badge
            variant="outline"
            className={PRIORITY_TONE[note.priority] ?? PRIORITY_TONE.Routine}
          >
            {note.priority}
          </Badge>
        )}
      </div>
      <h3 className="mt-2 text-base font-bold text-slate-800">{note.title}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {note.createdAt} · {note.author}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {note.noteText}
      </p>

      {soap && (note.subjective || note.objective || note.assessment || note.plan) && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {note.subjective && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">Subjective (S)</p>
              <p className="mt-1 text-sm text-slate-600">{note.subjective}</p>
            </div>
          )}
          {note.objective && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">Objective (O)</p>
              <p className="mt-1 text-sm text-slate-600">{note.objective}</p>
            </div>
          )}
          {note.assessment && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">Assessment (A)</p>
              <p className="mt-1 text-sm text-slate-600">{note.assessment}</p>
            </div>
          )}
          {note.plan && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">Plan (P)</p>
              <p className="mt-1 text-sm text-slate-600">{note.plan}</p>
            </div>
          )}
        </div>
      )}

      {note.status && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <LockKeyhole className="h-3.5 w-3.5" />
            {note.status}
          </span>
          <span className="text-slate-400">Immutable</span>
        </div>
      )}
    </div>
  );
}

function NewNoteDrawer({
  open,
  onOpenChange,
  onSave,
  authorName,
  authorRole,
  categories,
  soap,
  accent,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSave: (note: ProgressNoteBase) => void;
  authorName: string;
  authorRole: SigningRole;
  categories: string[];
  soap: boolean;
  accent: string;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "General");
  const [noteText, setNoteText] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setTitle("");
      setCategory(categories[0] ?? "General");
      setNoteText("");
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
    }
    onOpenChange(next);
  }

  const valid = soap
    ? Boolean(title.trim() && subjective.trim() && assessment.trim() && plan.trim())
    : Boolean(title.trim() && noteText.trim());

  function handleSave() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    onSave({
      id: `PN-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      title: title.trim(),
      author: authorName,
      role: authorRole,
      category,
      priority: "Routine",
      status: "Signed & Locked",
      createdAt: `Just now · ${time}`,
      noteText: soap
        ? `${subjective} ${objective} ${assessment} Plan: ${plan}`
        : noteText.trim(),
      ...(soap
        ? { subjective, objective, assessment, plan }
        : {}),
    });
  }

  const ISoapAccent = accent === "violet" ? ("violet" as const) : ("blue" as const);

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      accent={ISoapAccent}
      icon={<ClipboardList className="h-5 w-5" />}
      title={`New ${authorRole} Progress Note`}
      description={`Signing as ${authorName} · ${soap ? "SOAP format" : `${category} entry`}`}
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
          <FormButton className="flex-1" onClick={handleSave} disabled={!valid}>
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
            placeholder="e.g. RMO Evening Review"
          />
          <SingleSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </DrawerSection>

      {soap ? (
        <>
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
        </>
      ) : (
        <DrawerSection
          title="Clinical Note"
          caption="Free-form progress note content"
          icon={<FileText className="h-4 w-4" />}
        >
          <FormTextarea
            label="Note *"
            value={noteText}
            onChange={setNoteText}
            rows={5}
            maxLength={1000}
            placeholder="Write the progress note…"
          />
        </DrawerSection>
      )}
    </ConsultationDrawer>
  );
}
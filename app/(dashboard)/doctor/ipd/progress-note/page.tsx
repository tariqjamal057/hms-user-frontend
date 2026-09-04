// app/doctor/ipd/progress-note/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Filter,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  HeartPulse,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import {
  FormTextarea,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import {
  getPatientByUhid,
  WARD_ROUND_PATIENTS,
} from "@/lib/doctor/ipd/ward-round-data";
import {
  DOCUMENTATION_RULES,
  getProgressNotes,
} from "@/lib/doctor/ipd/progress-note-data";
import type {
  ProgressNote,
  ProgressNoteAuthorRole,
  ProgressNoteCategory,
  ProgressNotePriority,
} from "@/types/doctor/ipd/progress-note-types";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { PillButton } from "@/components/forms/pill-button";

type AuthorFilter = "All" | ProgressNoteAuthorRole;

export default function ProgressNotesPage({
  uhid: propUhid,
  embedded = false,
}: { uhid?: string; embedded?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = propUhid ?? searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;
  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);

  const [notes, setNotes] = useState<ProgressNote[]>(() =>
    getProgressNotes(uhid),
  );
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>("All");
  const [search, setSearch] = useState("");
  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProgressNote | null>(null);

  useEffect(() => {
    setNotes(getProgressNotes(uhid));
    setAuthorFilter("All");
    setSearch("");
    setSelectedNote(null);
    setNoteDrawerOpen(false);
  }, [uhid]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesAuthor =
        authorFilter === "All" || note.role === authorFilter;
      const matchesSearch =
        !query ||
        [
          note.title,
          note.author,
          note.category,
          note.noteText,
          note.createdAt,
        ].some((value) => value.toLowerCase().includes(query));
      return matchesAuthor && matchesSearch;
    });
  }, [notes, authorFilter, search]);

  function handleSelectPatient(newUhid: string) {
    router.push(`/doctor/ipd/progress-note?uhid=${newUhid}`);
  }

  function handleSaveNote(note: ProgressNote) {
    setNotes((previous) => [note, ...previous]);
    setNoteDrawerOpen(false);
    toast.success("Progress note saved and signed");
  }

  function handleNextMedicineOrders() {
    router.push(`/doctor/ipd/medicine-orders?uhid=${patient.uhid}`);
  }

  return (
    <div className="min-h-screen text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            {!embedded ? (
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.back()}
                  className="shrink-0 border-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-400">
                    {patient.patientName} ·{" "}
                    {patient.wardRoomBed.split("/").pop()?.trim()}
                  </p>
                  <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                    Progress Notes
                  </h1>
                  <p className="hidden text-xs text-slate-500 sm:block">
                    Structured notes, nursing handover, and signed clinical
                    documentation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-400">
                  Progress Notes
                </p>
              </div>
            )}
            <PillButton
              size="default"
              icon={Plus}
              onClick={() => setNoteDrawerOpen(true)}
            >
              <span className="hidden sm:inline">New Progress Note</span>
              <span className="sm:hidden">New Note</span>
            </PillButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-5 py-5">
        {!embedded && (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                  {patient.patientName
                    .split(" ")
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
                    {patient.patientName}
                    <PatientStatusBadge status={patient.status} />
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {patient.age} Y / {patient.gender} · UHID: {patient.uhid} ·
                    IPD: {patient.ipdId} · Bed:{" "}
                    {patient.wardRoomBed.split("/").pop()?.trim()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center lg:gap-7">
                <InfoBlock
                  label="Ward / Room / Bed"
                  value={patient.wardRoomBed}
                />
                <InfoBlock label="Department" value={patient.department} />
                <InfoBlock
                  label="Attending Doctor"
                  value={patient.admittingDoctor}
                />
                <InfoBlock
                  label="Admission Date"
                  value={patient.admissionDateTime}
                />
              </div>
              <PillButton
                variant="outline"
                className="w-full lg:w-auto"
                onClick={() => setChangePatientOpen(true)}
              >
                Change Patient
              </PillButton>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <Card className="min-w-0 border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Clinical timeline
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    All signed entries remain immutable; corrections become
                    amendments.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 sm:w-56">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search notes..."
                      className="border-slate-200 pl-9"
                    />
                  </div>
                  <Select
                    value={authorFilter}
                    onValueChange={(value) =>
                      setAuthorFilter(value as AuthorFilter)
                    }
                  >
                    <SelectTrigger className="w-full border-slate-200 sm:w-32">
                      <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All authors</SelectItem>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Nurse">Nurse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              {filteredNotes.map((note) => (
                <ProgressNoteCard
                  key={note.id}
                  note={note}
                  onView={() => setSelectedNote(note)}
                />
              ))}

              {filteredNotes.length === 0 && (
                <div className="py-14 text-center">
                  <Search className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 font-semibold text-slate-700">
                    No progress notes found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another filter or create a new note.
                  </p>
                </div>
              )}

              {!embedded && (
                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <PillButton
                    icon={ArrowRight}
                    onClick={handleNextMedicineOrders}
                  >
                    Next: Review Medicine Orders
                  </PillButton>
                </div>
              )}
            </CardContent>
          </Card>

          <DocumentationRules />
        </div>
      </main>

      {selectedNote && (
        <AuditDialog
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
      <NewProgressNoteDrawer
        open={noteDrawerOpen}
        patient={patient}
        onClose={() => setNoteDrawerOpen(false)}
        onSave={handleSaveNote}
      />
      {!embedded && (
        <ChangePatientDialog
          patients={WARD_ROUND_PATIENTS}
          currentUhid={patient.uhid}
          open={changePatientOpen}
          onOpenChange={setChangePatientOpen}
          onSelectPatient={handleSelectPatient}
        />
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="truncate text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}

const CATEGORY_BADGE: Record<ProgressNoteCategory, string> = {
  "Doctor Round": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "Nursing Update": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Clinical Review": "border-sky-200 bg-sky-50 text-sky-700",
  "Care Plan": "border-violet-200 bg-violet-50 text-violet-700",
  "Transfer / Handover": "border-amber-200 bg-amber-50 text-amber-700",
  "Discharge Planning": "border-rose-200 bg-rose-50 text-rose-700",
};

const PRIORITY_BADGE: Record<ProgressNotePriority, string> = {
  Routine: "border-slate-200 bg-slate-50 text-slate-600",
  Important: "border-amber-200 bg-amber-50 text-amber-700",
  Urgent: "border-red-200 bg-red-50 text-red-700",
};

function ProgressNoteCard({
  note,
  onView,
}: {
  note: ProgressNote;
  onView: () => void;
}) {
  const isDoctor = note.role === "Doctor";
  const initials = note.author
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      {/* Left role strip */}
      <div className="flex">
        <span
          className={`w-1 shrink-0 ${isDoctor ? "bg-gradient-to-b from-blue-500 to-cyan-500" : "bg-gradient-to-b from-emerald-500 to-teal-500"}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDoctor
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {initials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    className={
                      isDoctor
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }
                  >
                    {note.role.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={PRIORITY_BADGE[note.priority]}
                  >
                    {note.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {note.author} · {note.createdAt}
                </p>
              </div>
            </div>
            <PillButton
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={onView}
            >
              View audit <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </PillButton>
          </div>

          <h2 className="mt-3 text-base font-bold text-slate-800">
            {note.title}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={CATEGORY_BADGE[note.category]}>
              {note.category}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {note.noteText}
          </p>

          {note.vitals && (
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 sm:grid-cols-5">
              {Object.entries(note.vitals).map(([key, value]) => (
                <div key={key} className="rounded-md bg-white px-2 py-1.5 text-center shadow-sm">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {key}
                  </p>
                  <p className="text-xs font-bold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <LockKeyhole className="h-3.5 w-3.5" /> {note.status}
            </span>
            <span className="text-[11px] text-slate-400">
              Note ID: {note.id}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function DocumentationRules() {
  const completed = DOCUMENTATION_RULES.filter((rule) => rule.completed).length;
  return (
    <Card className="h-fit border-slate-200 shadow-sm xl:sticky xl:top-5">
      <CardHeader className="px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Documentation rules
        </CardTitle>
        <p className="text-xs text-slate-500">
          Today&apos;s note compliance status
        </p>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">
              Today&apos;s completion
            </span>
            <span className="text-sm font-bold text-blue-700">
              {completed}/{DOCUMENTATION_RULES.length}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${(completed / DOCUMENTATION_RULES.length) * 100}%`,
              }}
            />
          </div>
        </div>
        {DOCUMENTATION_RULES.map((rule) => (
          <div key={rule.id} className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0">
              {rule.completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">{rule.label}</p>
              {rule.detail && (
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {rule.detail}
                </p>
              )}
            </div>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
          Signed notes are locked to preserve the clinical audit trail. Any
          correction should be recorded as an amendment.
        </div>
      </CardContent>
    </Card>
  );
}

function AuditDialog({
  note,
  onClose,
}: {
  note: ProgressNote;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  note.role === "Doctor"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-emerald-50 text-emerald-700"
                }
              >
                {note.role}
              </Badge>
              <Badge variant="outline">{note.category}</Badge>
            </div>
            <h2 className="mt-2 text-lg font-bold text-slate-800">
              {note.title}
            </h2>
            <p className="text-xs text-slate-500">
              {note.createdAt} · {note.author}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-5 p-5">
          <AuditSection label="Subjective" value={note.subjective} />
          <AuditSection label="Objective" value={note.objective} />
          <AuditSection label="Assessment" value={note.assessment} />
          <AuditSection label="Plan" value={note.plan} />
          <AuditSection label="Full note" value={note.noteText} />
          {note.vitals && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Vitals documented
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {Object.entries(note.vitals).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg bg-slate-50 p-2 text-center"
                  >
                    <p className="text-[10px] uppercase text-slate-400">
                      {key}
                    </p>
                    <p className="text-sm font-bold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-emerald-700">
            <LockKeyhole className="h-4 w-4" /> Signed & locked audit entry
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditSection({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function NewProgressNoteDrawer({
  open,
  patient,
  onClose,
  onSave,
}: {
  open: boolean;
  patient: ReturnType<typeof getPatientByUhid>;
  onClose: () => void;
  onSave: (note: ProgressNote) => void;
}) {
  const [role, setRole] = useState<ProgressNoteAuthorRole>("Doctor");
  const [category, setCategory] =
    useState<ProgressNoteCategory>("Doctor Round");
  const [priority, setPriority] = useState<ProgressNotePriority>("Routine");
  const [title, setTitle] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [includeVitals, setIncludeVitals] = useState(true);

  function reset() {
    setRole("Doctor");
    setCategory("Doctor Round");
    setPriority("Routine");
    setTitle("");
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
    setIncludeVitals(true);
  }
  function close() {
    reset();
    onClose();
  }
  function save() {
    if (
      !title.trim() ||
      !subjective.trim() ||
      !assessment.trim() ||
      !plan.trim()
    ) {
      toast.error("Complete title, subjective findings, assessment, and plan");
      return;
    }
    const note: ProgressNote = {
      id: `PN-${Date.now()}`,
      uhid: patient.uhid,
      title: title.trim(),
      author: role === "Doctor" ? patient.admittingDoctor : "Nurse Kavita",
      role,
      category,
      priority,
      createdAt:
        "Just now · " +
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      status: "Signed & Locked",
      subjective: subjective.trim(),
      objective: objective.trim(),
      assessment: assessment.trim(),
      plan: plan.trim(),
      noteText: `${subjective.trim()} ${objective.trim()} ${assessment.trim()} Plan: ${plan.trim()}`,
      vitals: includeVitals
        ? {
            bp: patient.vitals.bp,
            pulse: patient.vitals.pulse,
            temp: patient.vitals.temp,
            spo2: patient.vitals.spo2,
            pain: patient.vitals.pain,
          }
        : undefined,
    };
    onSave(note);
    reset();
  }
  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      title="New Progress Note"
      description={`Create a structured clinical note for ${patient.patientName}.`}
      icon={<ClipboardList className="h-5 w-5" />}
      accent="blue"
      meta={
        <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          {patient.uhid} · {patient.wardRoomBed}
        </span>
      }
      footer={
        <div className="flex gap-3">
          <PillButton variant="outline" className="flex-1" onClick={close}>
            Cancel
          </PillButton>
          <PillButton className="flex-1" onClick={save}>
            Save & Sign Note
          </PillButton>
        </div>
      }
    >
      <div className="space-y-5">
      <DrawerSection
        title="Note details"
        caption="Author, priority, category, and a short title"
        icon={<ClipboardList className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SingleSelect
            label="Author role"
            value={role}
            options={[
              { value: "Doctor", label: "Doctor" },
              { value: "Nurse", label: "Nurse" },
            ]}
            onChange={(value) => setRole(value as ProgressNoteAuthorRole)}
          />
          <SingleSelect
            label="Priority"
            value={priority}
            options={[
              { value: "Routine", label: "Routine" },
              { value: "Important", label: "Important" },
              { value: "Urgent", label: "Urgent" },
            ]}
            onChange={(value) => setPriority(value as ProgressNotePriority)}
          />
        </div>
        <SingleSelect
          label="Note category"
          value={category}
          options={[
            "Doctor Round",
            "Nursing Update",
            "Clinical Review",
            "Care Plan",
            "Transfer / Handover",
            "Discharge Planning",
          ].map((item) => ({ value: item, label: item }))}
          onChange={(value) => setCategory(value as ProgressNoteCategory)}
        />
        <SuffixedInput
          label="Note title *"
          value={title}
          onChange={setTitle}
          placeholder="e.g. Morning ward round"
        />
      </DrawerSection>

      <DrawerSection
        title="Clinical note"
        caption="Structured SOAP documentation"
        icon={<HeartPulse className="h-4 w-4" />}
      >
        <FormTextarea
          label="Subjective findings *"
          value={subjective}
          onChange={setSubjective}
          rows={4}
          placeholder="Document symptoms, complaints, sleep, appetite, pain, or family concerns..."
        />
        <FormTextarea
          label="Objective findings"
          value={objective}
          onChange={setObjective}
          rows={4}
          placeholder="Document examination findings, vitals, oxygen support, drains, wounds, and investigations..."
        />
        <FormTextarea
          label="Clinical assessment *"
          value={assessment}
          onChange={setAssessment}
          rows={4}
          placeholder="Summarise the current clinical assessment and response to treatment..."
        />
        <FormTextarea
          label="Plan and next actions *"
          value={plan}
          onChange={setPlan}
          rows={4}
          placeholder="Document medicines, investigations, monitoring, escalation, review time, and communication plan..."
        />
      </DrawerSection>

      <DrawerSection
        title="Attachments & signing"
        caption="Vitals attachment and audit behaviour"
        icon={<ShieldCheck className="h-4 w-4" />}
      >
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <span>
            <span className="block text-sm font-medium text-slate-700">
              Include latest vitals
            </span>
            <span className="block text-xs text-slate-500">
              Attach the latest recorded vitals to this note.
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={includeVitals}
            onClick={() => setIncludeVitals((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${includeVitals ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${includeVitals ? "left-5.5" : "left-0.5"}`}
            />
          </button>
        </label>
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Signing this note will create an immutable audit entry. Corrections
            must be documented as an amendment.
          </span>
        </div>
      </DrawerSection>
      </div>
    </ConsultationDrawer>
  );
}


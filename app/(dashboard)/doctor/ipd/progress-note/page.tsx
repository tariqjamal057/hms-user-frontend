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
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

type AuthorFilter = "All" | ProgressNoteAuthorRole;

export default function ProgressNotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;
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
            <Button
              onClick={() => setNoteDrawerOpen(true)}
              className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Progress Note</span>
              <span className="sm:hidden">New Note</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-5 py-5">
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
            <Button
              variant="outline"
              className="w-full border-slate-200 lg:w-auto"
              onClick={() => setChangePatientOpen(true)}
            >
              Change Patient
            </Button>
          </CardContent>
        </Card>

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

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <Button
                  onClick={handleNextMedicineOrders}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Next: Review Medicine Orders
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
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
      <ChangePatientDialog
        patients={WARD_ROUND_PATIENTS}
        currentUhid={patient.uhid}
        open={changePatientOpen}
        onOpenChange={setChangePatientOpen}
        onSelectPatient={handleSelectPatient}
      />
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

function ProgressNoteCard({
  note,
  onView,
}: {
  note: ProgressNote;
  onView: () => void;
}) {
  const isDoctor = note.role === "Doctor";
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
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
            className={
              note.priority === "Urgent"
                ? "border-red-200 text-red-600"
                : "border-slate-200 text-slate-500"
            }
          >
            {note.priority}
          </Badge>
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={onView}
          className="h-auto p-0 text-blue-600"
        >
          View audit <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
      <h2 className="mt-3 text-base font-bold text-slate-800">{note.title}</h2>
      <p className="mt-1 text-xs text-slate-500">
        {note.createdAt} · {note.author} · {note.category}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-600">{note.noteText}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <LockKeyhole className="h-3.5 w-3.5" /> {note.status}
        </span>
        <span className="text-xs text-slate-400">Note ID: {note.id}</span>
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
    <div
      className={`fixed inset-0 z-40 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-slate-950/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              New Progress Note
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Create a structured clinical note for {patient.patientName}.
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              UHID: {patient.uhid} · {patient.wardRoomBed}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={close}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldLabel label="Author role">
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as ProgressNoteAuthorRole)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Nurse">Nurse</SelectItem>
                </SelectContent>
              </Select>
            </FieldLabel>
            <FieldLabel label="Priority">
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value as ProgressNotePriority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </FieldLabel>
          </div>
          <FieldLabel label="Note category">
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as ProgressNoteCategory)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Doctor Round",
                  "Nursing Update",
                  "Clinical Review",
                  "Care Plan",
                  "Transfer / Handover",
                  "Discharge Planning",
                ].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldLabel>
          <FieldLabel label="Note title *">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Morning ward round"
            />
          </FieldLabel>
          <FieldLabel
            label="Subjective findings *"
            hint="Patient or family-reported symptoms and concerns"
          >
            <Textarea
              value={subjective}
              onChange={(event) => setSubjective(event.target.value)}
              rows={4}
              placeholder="Document symptoms, complaints, sleep, appetite, pain, or family concerns..."
            />
          </FieldLabel>
          <FieldLabel
            label="Objective findings"
            hint="Examination findings, observations, devices, and relevant results"
          >
            <Textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              rows={4}
              placeholder="Document examination findings, vitals, oxygen support, drains, wounds, and investigations..."
            />
          </FieldLabel>
          <FieldLabel label="Clinical assessment *">
            <Textarea
              value={assessment}
              onChange={(event) => setAssessment(event.target.value)}
              rows={4}
              placeholder="Summarise the current clinical assessment and response to treatment..."
            />
          </FieldLabel>
          <FieldLabel label="Plan and next actions *">
            <Textarea
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              rows={4}
              placeholder="Document medicines, investigations, monitoring, escalation, review time, and communication plan..."
            />
          </FieldLabel>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Include latest vitals
              </p>
              <p className="text-xs text-slate-500">
                Attach the latest recorded vitals to this note.
              </p>
            </div>
            <Switch
              checked={includeVitals}
              onCheckedChange={setIncludeVitals}
            />
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Signing this note will create an immutable audit entry.
              Corrections must be documented as an amendment.
            </span>
          </div>
        </div>
        <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white p-5">
          <Button variant="outline" onClick={close} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={save}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Save & Sign Note
          </Button>
        </div>
      </aside>
    </div>
  );
}

function FieldLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}


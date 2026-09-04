// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-progress-notes.tsx
"use client";
import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { SingleSelect } from "@/components/forms/select";
import type { NoteRole, ProgressNote } from "@/types/emergency/emergency-types";
import { DateFilterBar } from "./date-filter-bar";

type AuthorFilter = "All" | NoteRole;
const roleTone: Record<NoteRole, string> = {
  Doctor: "bg-blue-50 text-blue-700 border-blue-200",
  RMO: "bg-violet-50 text-violet-700 border-violet-200",
  Nurse: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function SectionProgressNotes({ notes }: { notes: ProgressNote[] }) {
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>("All");
  const [date, setDate] = useState("");
  const filtered = useMemo(
    () =>
      notes.filter(
        (n) =>
          (authorFilter === "All" || n.role === authorFilter) &&
          (!date || n.date === date),
      ),
    [notes, authorFilter, date],
  );

  const columns: DataColumn<ProgressNote>[] = [
    {
      key: "title",
      label: "Note",
      render: (n) => (
        <div>
          <p className="font-semibold text-slate-800">{n.title}</p>
          <p className="mt-0.5 line-clamp-2 max-w-[420px] text-xs text-slate-500">
            {n.noteText}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Author",
      render: (n) => (
        <div>
          <Badge className={roleTone[n.role]}>{n.role.toUpperCase()}</Badge>
          <p className="mt-1 text-xs text-slate-500">{n.author}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (n) => (
        <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
          {n.category}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (n) => (
        <span className="text-xs text-slate-500">
          {n.date}
          <br />
          <span className="text-[10px] text-slate-400">{n.createdAt}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-bold text-slate-800">Progress Notes</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Doctor, RMO, and Nurse notes, listed date and time wise.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <DateFilterBar value={date} onChange={setDate} />
          <div className="sm:w-44">
            <SingleSelect
              label=""
              value={authorFilter}
              onChange={(v) => setAuthorFilter(v as AuthorFilter)}
              options={[
                { value: "All", label: "All Authors" },
                { value: "Doctor", label: "Doctor" },
                { value: "RMO", label: "RMO" },
                { value: "Nurse", label: "Nurse" },
              ]}
            />
          </div>
        </div>
      </div>

      <DataTable
        card
        title="Notes Timeline"
        titleIcon={<ClipboardList className="h-4 w-4" />}
        rows={filtered}
        columns={columns}
        rowKey={(n) => n.id}
        countLabel="notes"
        emptyText="No progress notes found."
      />
    </div>
  );
}

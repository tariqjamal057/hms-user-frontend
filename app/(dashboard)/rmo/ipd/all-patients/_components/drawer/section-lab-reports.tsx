// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-lab-reports.tsx
"use client";
import { useMemo, useState } from "react";
import { FlaskConical, ImageIcon, Microscope, ScanLine } from "lucide-react";
import { RadioGroup } from "@/components/forms/radio-group";
import { DateField } from "@/components/forms/form-controls";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import type { LabReport, PathologyResult } from "@/types/rmo/ipd/rmo-types";
import { PathologyFlagBadge } from "../rmo-badges";

type CategoryFilter = "All" | "Pathology" | "Radiology";

export function SectionLabReports({ reports }: { reports: LabReport[] }) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filtered = useMemo(() => reports.filter((r) => (!date || r.date === date) && (category === "All" || r.category === category)), [reports, date, category]);
  const pathology = filtered.filter((r) => r.category === "Pathology");
  const radiology = filtered.filter((r) => r.category === "Radiology");

  const resultColumns: DataColumn<PathologyResult>[] = [
    { key: "parameter", label: "Parameter", render: (r) => <span className="font-medium text-slate-700">{r.parameter}</span> },
    { key: "value", label: "Value", render: (r) => <span className="text-slate-700">{r.value} <span className="text-xs text-slate-400">{r.unit}</span></span> },
    { key: "refRange", label: "Reference Range", render: (r) => <span className="text-slate-500">{r.refRange}</span> },
    { key: "flag", label: "Status", render: (r) => <PathologyFlagBadge flag={r.flag} /> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-sm">
            <FlaskConical className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">Lab Reports</p>
            <p className="text-xs text-slate-500">Pathology results with reference ranges and Radiology reports with images, organized by date.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <RadioGroup
            name="lab-category"
            options={[
              { value: "All", label: "All" },
              { value: "Pathology", label: "Pathology" },
              { value: "Radiology", label: "Radiology" },
            ]}
            value={category}
            onChange={(v) => setCategory(v as CategoryFilter)}
          />
          <div className="w-full sm:w-56">
            <DateField label="" value={date} onChange={setDate} placeholder="Filter by date" />
          </div>
        </div>
      </div>

      {(category === "All" || category === "Pathology") && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400"><Microscope className="h-3.5 w-3.5" />Pathology Reports</p>
          <div className="space-y-3">
            {pathology.map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">{report.testName}</p>
                  <span className="text-xs text-slate-400">{report.date}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Ordered by {report.orderedBy} · Reported {report.reportedAt}</p>
                <div className="mt-3">
                  <DataTable
                    rows={report.pathologyResults ?? []}
                    columns={resultColumns}
                    rowKey={(r) => r.parameter}
                    emptyText="No parameters available."
                  />
                </div>
                {report.reportImageUrl && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500"><ImageIcon className="h-4 w-4" />Report image attached by lab</div>
                )}
              </div>
            ))}
            {pathology.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">No pathology reports found.</div>}
          </div>
        </div>
      )}

      {(category === "All" || category === "Radiology") && (
        <div>
          <p className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400"><ScanLine className="h-3.5 w-3.5" />Radiology Reports</p>
          <div className="space-y-3">
            {radiology.map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">{report.testName}</p>
                  <span className="text-xs text-slate-400">{report.date}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Ordered by {report.orderedBy} · Reported {report.reportedAt}</p>
                {report.reportImageUrl ? (
                  <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                    <div className="text-center"><ImageIcon className="mx-auto h-8 w-8" /><p className="mt-1 text-xs">Radiology image preview</p></div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No image uploaded for this report.</div>
                )}
                {report.notes && <div className="mt-3 rounded-lg bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">Radiologist Notes</p><p className="mt-1 text-sm text-slate-700">{report.notes}</p></div>}
              </div>
            ))}
            {radiology.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">No radiology reports found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
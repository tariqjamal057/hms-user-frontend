// app/(dashboard)/admission-desk/emergency/all-patients/_components/drawer/section-lab-reports.tsx
"use client";
import { useMemo, useState } from "react";
import {
  FlaskConical,
  ImageIcon,
  Microscope,
  ScanLine,
} from "lucide-react";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type {
  LabReport,
  PathologyResult,
} from "@/types/emergency/emergency-types";
import { DateFilterBar } from "./date-filter-bar";
import { PathologyFlagBadge } from "../emergency-badges";

type CategoryFilter = "All" | "Pathology" | "Radiology";

export function SectionLabReports({ reports }: { reports: LabReport[] }) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (!date || r.date === date) &&
          (category === "All" || r.category === category),
      ),
    [reports, date, category],
  );
  const pathology = filtered.filter((r) => r.category === "Pathology");
  const radiology = filtered.filter((r) => r.category === "Radiology");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <FlaskConical className="h-4 w-4 text-cyan-600" />
          Lab Reports
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <DateFilterBar value={date} onChange={setDate} />
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(["All", "Pathology", "Radiology"] as CategoryFilter[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  category === c
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-slate-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(category === "All" || category === "Pathology") && (
        <PathologyTable reports={pathology} />
      )}

      {(category === "All" || category === "Radiology") && (
        <RadiologyTable reports={radiology} />
      )}
    </div>
  );
}

function flattenPathology(reports: LabReport[]): Array<
  PathologyResult & { testName: string; date: string; orderedBy: string; reportedAt: string }
> {
  const rows: Array<
    PathologyResult & {
      testName: string;
      date: string;
      orderedBy: string;
      reportedAt: string;
    }
  > = [];
  reports.forEach((r) => {
    (r.pathologyResults ?? []).forEach((p) => {
      rows.push({ ...p, testName: r.testName, date: r.date, orderedBy: r.orderedBy, reportedAt: r.reportedAt });
    });
  });
  return rows;
}

function PathologyTable({ reports }: { reports: LabReport[] }) {
  const flat = useMemo(() => flattenPathology(reports), [reports]);
  const columns: DataColumn<ReturnType<typeof flattenPathology>[number]>[] = [
    {
      key: "testName",
      label: "Test",
      render: (r) => <span className="font-semibold text-slate-800">{r.testName}</span>,
    },
    {
      key: "parameter",
      label: "Parameter",
      render: (r) => <span className="text-slate-700">{r.parameter}</span>,
    },
    {
      key: "value",
      label: "Value",
      render: (r) => (
        <span className="font-semibold text-slate-800">
          {r.value} <span className="text-xs font-normal text-slate-400">{r.unit}</span>
        </span>
      ),
    },
    {
      key: "refRange",
      label: "Reference Range",
      render: (r) => <span className="text-slate-500">{r.refRange}</span>,
    },
    {
      key: "flag",
      label: "Status",
      render: (r) => <PathologyFlagBadge flag={r.flag} />,
    },
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.date}
          <br />
          <span className="text-[10px] text-slate-400">by {r.orderedBy}</span>
        </span>
      ),
    },
  ];
  return (
    <DataTable
      card
      title="Pathology Reports"
      titleIcon={<Microscope className="h-4 w-4" />}
      rows={flat}
      columns={columns}
      rowKey={(r) => `${r.testName}-${r.parameter}-${r.date}`}
      countLabel="results"
      emptyText="No pathology reports found."
    />
  );
}

function RadiologyTable({ reports }: { reports: LabReport[] }) {
  const columns: DataColumn<LabReport>[] = [
    {
      key: "testName",
      label: "Test",
      render: (r) => <span className="font-semibold text-slate-800">{r.testName}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (r) => <span className="text-slate-500">{r.date}</span>,
    },
    {
      key: "orderedBy",
      label: "Ordered By",
      render: (r) => <span className="text-slate-600">{r.orderedBy}</span>,
    },
    {
      key: "reportedAt",
      label: "Reported",
      render: (r) => <span className="text-slate-600">{r.reportedAt}</span>,
    },
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.reportImageUrl ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
            <ImageIcon className="h-3.5 w-3.5" /> Attached
          </span>
        ) : (
          <span className="text-xs text-slate-400">Not uploaded</span>
        ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (r) => r.notes ?? <span className="text-slate-400">—</span>,
    },
  ];
  return (
    <DataTable
      card
      title="Radiology Reports"
      titleIcon={<ScanLine className="h-4 w-4" />}
      rows={reports}
      columns={columns}
      rowKey={(r) => r.id}
      countLabel="reports"
      emptyText="No radiology reports found."
    />
  );
}

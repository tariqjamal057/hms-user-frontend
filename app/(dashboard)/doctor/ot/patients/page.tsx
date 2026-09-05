// app/(dashboard)/doctor/ot/patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ClipboardCheck, Eye, Scissors, UserRound } from "lucide-react";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import type { OtPatient, OtStatus } from "@/types/doctor/ot/ot-types";
import { getOtPatients, OT_STATUS_OPTIONS } from "@/lib/doctor/ot/ot-data";

type ViewMode = "list" | "grid";

const previousDay = { total: 4, inSurgery: 1, preOp: 2, completed: 3 };

const STATUS_TONES: Record<OtStatus, string> = {
  Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  "Pre-Op Ready": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "In Surgery": "border-rose-200 bg-rose-50 text-rose-700",
  "In Recovery": "border-amber-200 bg-amber-50 text-amber-700",
  "Post-Operative": "border-violet-200 bg-violet-50 text-violet-700",
  "Ready for Transfer": "border-cyan-200 bg-cyan-50 text-cyan-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-red-200 bg-red-50 text-red-700",
};

export default function DoctorOtPatientsPage() {
  const router = useRouter();
  const patients = useMemo(() => getOtPatients(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [p.patientName, p.uhid, p.otId, p.procedure]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [patients, searchQuery, statusFilter],
  );

  const stats = useMemo(
    () => ({
      total: patients.length,
      inSurgery: patients.filter((p) => p.status === "In Surgery").length,
      preOp: patients.filter((p) => p.status === "Pre-Op Ready" || p.status === "Scheduled").length,
      completed: patients.filter((p) => p.status === "Completed" || p.status === "Ready for Transfer").length,
    }),
    [patients],
  );

  const isActive = searchQuery !== "" || statusFilter !== "All";

  function viewPatient(patient: OtPatient) {
    router.push(`/doctor/ot/patients/${patient.uhid}`);
  }

  const infoCards: KpiCardProps[] = [
    { label: "OT Schedule", value: String(stats.total), icon: CalendarClock, accent: "blue", footer: "Procedures in the OT plan", trend: buildTrend(stats.total, previousDay.total) },
    { label: "In Surgery", value: String(stats.inSurgery), icon: Scissors, accent: "rose", footer: "Live procedures in OT", trend: buildTrend(stats.inSurgery, previousDay.inSurgery) },
    { label: "Pre-Op / Scheduled", value: String(stats.preOp), icon: ClipboardCheck, accent: "amber", footer: "Awaiting or ready for OT", trend: buildTrend(stats.preOp, previousDay.preOp) },
    { label: "Completed / Transfer", value: String(stats.completed), icon: UserRound, accent: "emerald", footer: "Post-op or transferred", trend: buildTrend(stats.completed, previousDay.completed) },
  ];

  const columns: OpsColumn<OtPatient>[] = [
    { key: "patient", header: "Patient", cell: (p) => (<div><p className="font-semibold text-slate-800">{p.patientName}</p><p className="text-xs text-slate-400">{p.uhid}</p></div>) },
    { key: "otId", header: "OT ID", cell: (p) => <span className="text-sm text-slate-600">{p.otId}</span> },
    { key: "procedure", header: "Procedure", cell: (p) => (<div><p className="text-sm text-slate-700">{p.procedure}</p><p className="text-xs text-slate-400">{p.procedureCode}</p></div>) },
    { key: "scheduledAt", header: "Schedule", cell: (p) => (<div><p className="text-sm text-slate-700">{p.plannedDateTime}</p><p className="text-xs text-slate-400">{p.otRoom}</p></div>) },
    { key: "surgeon", header: "Surgeon", enableHiding: false, cell: (p) => <span className="text-sm text-slate-600">{p.surgeon}</span> },
    { key: "anesthetist", header: "Anesthetist", cell: (p) => <span className="text-sm text-slate-600">{p.anesthetist}</span> },
    { key: "status", header: "Status", cell: (p) => <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[p.status]}`}>{p.status}</span> },
    { key: "action", header: "Action", headerClassName: "text-right", className: "text-right", enableHiding: false, cell: (p) => (<OpsActionButton label="Open OT Workspace" icon={Eye} onClick={() => viewPatient(p)} />) },
  ];

  function renderCard(p: OtPatient) {
    return (
      <OpsGridCard
        avatar={p.patientName.charAt(0)}
        title={p.patientName}
        subtitle={p.uhid}
        badge={<span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_TONES[p.status]}`}>{p.status}</span>}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{p.procedure}</p>
            <p className="mt-1 text-xs text-slate-500">{p.otRoom} · {p.plannedDateTime}</p>
          </>
        }
        stats={[
          { label: "Surgeon", value: p.surgeon },
          { label: "Anesthetist", value: p.anesthetist },
        ]}
        action={{ label: "Open OT Workspace", icon: Eye, onClick: () => viewPatient(p) }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Operation Theatre Workspace"
        description="Manage the OT schedule, pre-operative assessment, surgical safety, procedure documentation, anesthesia, recovery and handover for your surgical patients."
        meta={<span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">Surgeon</span>}
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Patient, UHID, OT ID or procedure..."
            canClear={isActive}
            onClear={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
            viewSupported
            viewMode={viewMode}
            onViewChange={setViewMode}
            filterToggle
            filters={[
              {
                key: "status",
                label: "Filter by OT status",
                selected: statusFilter,
                options: [
                  { value: "All", label: "All Statuses" },
                  ...OT_STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "status") setStatusFilter(value);
            }}
          />
        </div>

        {viewMode === "list" ? (
          <OpsTable data={filteredPatients} rowKey={(p) => p.uhid} columns={columns} showColumnToggle />
        ) : (
          <OpsGrid data={filteredPatients} rowKey={(p) => p.uhid} renderCard={renderCard} pageSize={6} />
        )}
      </main>
    </div>
  );
}
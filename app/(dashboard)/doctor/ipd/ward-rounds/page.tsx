"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAllWardPatients } from "@/lib/doctor/ipd/ward-round-data";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  OpsGrid,
  OpsGridCard,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn, ViewMode } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";

type QueueFilter = "all" | "Critical" | "Under Observation" | "Stable";

const previousDay = { total: 12, critical: 3, review: 5, stable: 7, reviewed: 8 };

function parseWardRoomBed(value: string) {
  const [ward = "", room = "", bed = ""] = value
    .split("/")
    .map((item) => item.trim());
  return { ward, room, bed };
}

function statusClasses(status: WardRoundPatient["status"]) {
  if (status === "Critical") return "border-red-200 bg-red-50 text-red-700";
  if (status === "Under Observation")
    return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function patientClinicalPriority(patient: WardRoundPatient) {
  if (patient.status === "Critical") return "Critical";
  if (patient.status === "Under Observation") return "Review";
  return "Stable";
}

function pendingAction(patient: WardRoundPatient) {
  if (patient.status === "Critical") return "Immediate clinical review";
  if (patient.status === "Under Observation") return "Review pending results";
  return "Routine ward review";
}

export default function DoctorWardRoundsPage() {
  const router = useRouter();
  const patients = useMemo(() => getAllWardPatients(), []);
  const [search, setSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const wards = useMemo(
    () =>
      Array.from(
        new Set(
          patients.map((patient) => parseWardRoomBed(patient.wardRoomBed).ward),
        ),
      ).sort(),
    [patients],
  );

  const isActive =
    search !== "" || queueFilter !== "all" || wardFilter !== "all";

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return patients.filter((patient) => {
      const { ward } = parseWardRoomBed(patient.wardRoomBed);
      const matchesSearch =
        !query ||
        [
          patient.patientName,
          patient.uhid,
          patient.ipdId,
          patient.currentDiagnosis,
          patient.wardRoomBed,
        ].some((value) => value.toLowerCase().includes(query));
      const matchesStatus =
        queueFilter === "all" || patient.status === queueFilter;
      const matchesWard = wardFilter === "all" || ward === wardFilter;
      return matchesSearch && matchesStatus && matchesWard;
    });
  }, [patients, search, queueFilter, wardFilter]);

  const stats = useMemo(() => {
    const critical = patients.filter((p) => p.status === "Critical").length;
    const review = patients.filter((p) => p.status === "Under Observation").length;
    const stable = patients.filter((p) => p.status === "Stable").length;
    const pendingActions = patients.filter((p) => p.status !== "Stable").length;
    const reviewed = patients.filter((p) =>
      p.clinicalLogs?.some((log) => log.type === "Doctor Round"),
    ).length;
    return { total: patients.length, critical, review, stable, pendingActions, reviewed };
  }, [patients]);

  const openClinicalOverview = (uhid: string) => {
    router.push(`/doctor/ipd/clinical-overview/${uhid}`);
  };

  const kpis: KpiCardProps[] = [
    {
      label: "Patients under care",
      value: String(stats.total),
      icon: BedDouble,
      accent: "blue",
      footer: `${stats.reviewed} reviewed · ${stats.total - stats.reviewed} remaining`,
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Priority alerts",
      value: String(stats.critical + stats.review).padStart(2, "0"),
      icon: ShieldAlert,
      accent: "rose",
      footer: `${stats.critical} critical · ${stats.review} clinical review`,
      trend: buildTrend(stats.critical + stats.review, previousDay.critical + previousDay.review),
    },
    {
      label: "Tasks due today",
      value: String(stats.pendingActions + 4).padStart(2, "0"),
      icon: Clock3,
      accent: "amber",
      footer: `${Math.min(stats.pendingActions, 4)} due within 2 hours`,
    },
    {
      label: "Rounds completed",
      value: `${stats.reviewed}/${stats.total}`,
      icon: CheckCircle2,
      accent: "emerald",
      footer: `${stats.total ? Math.round((stats.reviewed / stats.total) * 100) : 0}% completion`,
      trend: buildTrend(stats.reviewed, previousDay.reviewed),
    },
  ];

  const columns: OpsColumn<WardRoundPatient>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
            {p.patientName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{p.patientName}</p>
            <p className="text-[11px] text-slate-400">{p.uhid}</p>
          </div>
        </div>
      ),
    },
    {
      key: "bed",
      header: "Bed",
      hideOn: "md",
      cell: (p) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {parseWardRoomBed(p.wardRoomBed).bed}
        </span>
      ),
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      widthClass: "w-44",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-700">{p.currentDiagnosis}</p>
          <p className="text-[11px] text-slate-400">{p.department}</p>
        </div>
      ),
    },
    {
      key: "vitals",
      header: "Last vitals",
      hideOn: "lg",
      cell: (p) => (
        <span className="whitespace-nowrap text-xs text-slate-600">
          BP {p.vitals.bp} · SpO₂ {p.vitals.spo2}%
        </span>
      ),
    },
    {
      key: "status",
      header: "Clinical status",
      cell: (p) => (
        <Badge className={statusClasses(p.status)}>{patientClinicalPriority(p)}</Badge>
      ),
    },
    {
      key: "pendingAction",
      header: "Pending action",
      cell: (p) => <span className="text-xs text-slate-600">{pendingAction(p)}</span>,
    },
    {
      key: "action",
      header: "Action",
      enableHiding: false,
      cell: (p) => (
        <Button
          variant="link"
          size="sm"
          onClick={() => openClinicalOverview(p.uhid)}
          className="gap-1 text-blue-600"
        >
          Open <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  function renderCard(p: WardRoundPatient) {
    const accent =
      p.status === "Critical"
        ? "from-red-500 via-rose-500 to-red-500"
        : p.status === "Under Observation"
          ? "from-amber-500 via-orange-500 to-amber-500"
          : "from-emerald-500 via-teal-500 to-emerald-500";
    return (
      <OpsGridCard
        accent={accent}
        avatar={p.patientName.charAt(0)}
        title={p.patientName}
        subtitle={`${p.uhid} · ${p.ipdId}`}
        badge={<Badge className={statusClasses(p.status)}>{patientClinicalPriority(p)}</Badge>}
        context={
          <>
            <p className="text-sm text-slate-600">
              {p.currentDiagnosis}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {p.department} · {p.wardRoomBed}
            </p>
          </>
        }
        stats={[
          { label: "Bed", value: parseWardRoomBed(p.wardRoomBed).bed },
          { label: "BP", value: p.vitals.bp },
          { label: "Pulse", value: `${p.vitals.pulse}/min` },
          { label: "SpO₂", value: `${p.vitals.spo2}%` },
        ]}
        action={{
          label: "Open clinical overview",
          icon: Stethoscope,
          onClick: () => openClinicalOverview(p.uhid),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Ward Rounds"
        description="Review your admitted patients, pending actions, and clinical priorities."
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Today
          </span>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-slate-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      <main className="mx-auto max-w-[1600px] space-y-6 py-4">
        <StatsRow items={kpis} />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,0.75fr)]">
          <div className="min-w-0 space-y-4">
            <FilterBar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search patient, UHID, diagnosis..."
              canClear={isActive}
              onClear={() => {
                setSearch("");
                setQueueFilter("all");
                setWardFilter("all");
              }}
              viewSupported
              viewMode={viewMode}
              onViewChange={setViewMode}
              filters={[
                {
                  key: "queueFilter",
                  label: "Clinical status",
                  selected: queueFilter,
                  options: [
                    { value: "all", label: "All statuses" },
                    { value: "Critical", label: "Critical" },
                    { value: "Under Observation", label: "Under Observation" },
                    { value: "Stable", label: "Stable" },
                  ],
                },
                {
                  key: "wardFilter",
                  label: "Ward",
                  selected: wardFilter,
                  options: [
                    { value: "all", label: "All wards" },
                    ...wards.map((w) => ({ value: w, label: w })),
                  ],
                },
              ]}
              onFilterChange={(key, value) => {
                if (key === "queueFilter") setQueueFilter(value as QueueFilter);
                if (key === "wardFilter") setWardFilter(value);
              }}
              extra={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/doctor/ipd/patients")}
                  className="border-slate-200"
                >
                  All patients
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              }
            />

            {viewMode === "list" ? (
              <div className="min-w-0 w-full">
                <OpsTable
                  data={filteredPatients}
                  rowKey={(p) => p.uhid}
                  columns={columns}
                  showColumnToggle
                  pageSize={8}
                />
              </div>
            ) : (
              <OpsGrid
                data={filteredPatients}
                rowKey={(p) => p.uhid}
                renderCard={renderCard}
                pageSize={6}
              />
            )}
          </div>

          <PriorityAlerts patients={patients} onOpen={openClinicalOverview} />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between px-5 py-4 sm:px-6">
              <div>
                <CardTitle className="text-base font-bold sm:text-lg">
                  Ward workload
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Patient distribution by current clinical workflow state.
                </p>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => router.push("/doctor/ipd/patients")}
                className="text-blue-600"
              >
                Open patient list <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <WorkloadCard count={stats.stable} label="Stable / routine" color="bg-emerald-500" />
                <WorkloadCard count={stats.review} label="Review pending" color="bg-amber-400" />
                <WorkloadCard count={stats.critical} label="High acuity" color="bg-red-500" />
                <WorkloadCard count={Math.max(1, Math.floor(stats.stable / 2))} label="Discharge ready" color="bg-violet-500" />
              </div>
              <div className="mt-5 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50/50 px-4 py-3 text-sm text-blue-950">
                <span className="font-bold">Round recommendation:</span>{" "}
                {roundRecommendation(patients)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Clinical workflow</p>
                  <p className="text-xs text-slate-500">
                    Keep today&apos;s round focused and actionable.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <WorkflowRow
                  icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                  label="Critical patients first"
                  value={stats.critical}
                />
                <WorkflowRow
                  icon={<HeartPulse className="h-4 w-4 text-amber-500" />}
                  label="Patients needing review"
                  value={stats.review}
                />
                <WorkflowRow
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  label="Stable patients"
                  value={stats.stable}
                />
              </div>
              <Button
                onClick={() => router.push("/doctor/ipd/patients")}
                className="mt-5 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
              >
                View all IPD patients
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function WorkloadCard({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className={cn("mb-3 h-1.5 w-1.5 rounded-full", color)} />
      <p className="text-xl font-bold text-slate-800">{String(count).padStart(2, "0")}</p>
      <p className="mt-1 text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function WorkflowRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-600">
        {icon}
        {label}
      </span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}

function PriorityAlerts({
  patients,
  onOpen,
}: {
  patients: WardRoundPatient[];
  onOpen: (uhid: string) => void;
}) {
  const critical = patients.filter((p) => p.status === "Critical");
  const review = patients.filter((p) => p.status === "Under Observation");
  const alerts = [...critical, ...review].slice(0, 3);
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between px-5 py-4 sm:px-6">
        <div>
          <CardTitle className="text-base font-bold sm:text-lg">Priority alerts</CardTitle>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Require doctor review or acknowledgement.
          </p>
        </div>
        <Badge variant="outline" className="border-red-200 text-red-600">
          {critical.length + review.length} open
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5 sm:px-6">
        {alerts.map((patient) => (
          <button
            key={patient.uhid}
            onClick={() => onOpen(patient.uhid)}
            className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                patient.status === "Critical" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500",
              )}
            >
              {patient.status === "Critical" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {patient.status === "Critical"
                  ? `Critical review: ${patient.currentDiagnosis}`
                  : `Review required: ${patient.patientName}`}
              </p>
              <p className="mt-1 truncate text-xs text-slate-400">
                {patient.patientName} · {patient.wardRoomBed}
              </p>
              <span className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600">
                Review now{" "}
                <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        ))}
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Users className="h-7 w-7 text-slate-300" />
            <p className="text-sm text-slate-400">No priority alerts today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function roundRecommendation(patients: WardRoundPatient[]) {
  const critical = patients.find((p) => p.status === "Critical");
  if (critical)
    return `Review ${parseWardRoomBed(critical.wardRoomBed).bed} first — ${critical.patientName} is marked critical with ${critical.currentDiagnosis}.`;
  const review = patients.find((p) => p.status === "Under Observation");
  return review
    ? `Review ${review.patientName} next — pending clinical observation and investigation results.`
    : "All assigned patients are stable. Continue with routine ward review.";
}
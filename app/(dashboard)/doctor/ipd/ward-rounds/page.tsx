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
  Eye,
  HeartPulse,
  LayoutGrid,
  ListFilter,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  Users,
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
import { cn } from "@/lib/utils";
import { getAllWardPatients } from "@/lib/doctor/ipd/ward-round-data";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";

type QueueFilter = "all" | "Critical" | "Under Observation" | "Stable";
type ViewMode = "table" | "cards";

function parseWardRoomBed(value: string) {
  const [ward = "", room = "", bed = ""] = value
    .split("/")
    .map((item) => item.trim());
  return { ward, room, bed };
}

function statusClasses(status: WardRoundPatient["status"]) {
  if (status === "Critical") return "bg-red-50 text-red-700 border-red-200";
  if (status === "Under Observation")
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function patientClinicalPriority(patient: WardRoundPatient) {
  if (patient.status === "Critical") return "Critical";
  if (patient.status === "Under Observation") return "Review";
  return "Stable";
}

export default function DoctorWardRoundsPage() {
  const router = useRouter();
  const patients = useMemo(() => getAllWardPatients(), []);
  const [search, setSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const wards = useMemo(
    () =>
      Array.from(
        new Set(
          patients.map((patient) => parseWardRoomBed(patient.wardRoomBed).ward),
        ),
      ).sort(),
    [patients],
  );

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
    const critical = patients.filter(
      (patient) => patient.status === "Critical",
    ).length;
    const review = patients.filter(
      (patient) => patient.status === "Under Observation",
    ).length;
    const stable = patients.filter(
      (patient) => patient.status === "Stable",
    ).length;
    const pendingActions = patients.filter(
      (patient) => patient.status !== "Stable",
    ).length;
    const reviewed = patients.filter((patient) =>
      patient.clinicalLogs?.some((log) => log.type === "Doctor Round"),
    ).length;

    return {
      total: patients.length,
      critical,
      review,
      stable,
      pendingActions,
      reviewed,
    };
  }, [patients]);

  const openClinicalOverview = (uhid: string) => {
    router.push(`/doctor/ipd/clinical-overview/${uhid}`);
  };

  return (
    <div className="min-h-screen text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                  Ward Rounds
                </h1>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                  Today
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Review your admitted patients, pending actions, and clinical
                priorities.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="shrink-0 border-slate-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 py-6 ">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            label="Patients under care"
            value={stats.total}
            note={`${stats.reviewed} reviewed · ${stats.total - stats.reviewed} remaining`}
            icon={<BedDouble className="h-5 w-5" />}
            tone="blue"
          />
          <StatCard
            label="Priority alerts"
            value={String(stats.critical + stats.review).padStart(2, "0")}
            note={`${stats.critical} critical · ${stats.review} clinical review`}
            icon={<ShieldAlert className="h-5 w-5" />}
            tone="red"
          />
          <StatCard
            label="Tasks due today"
            value={String(stats.pendingActions + 4).padStart(2, "0")}
            note={`${Math.min(stats.pendingActions, 4)} due within 2 hours`}
            icon={<Clock3 className="h-5 w-5" />}
            tone="amber"
          />
          <StatCard
            label="Rounds completed"
            value={`${stats.reviewed.toString().padStart(2, "0")} / ${stats.total.toString().padStart(2, "0")}`}
            note={`${stats.total ? Math.round((stats.reviewed / stats.total) * 100) : 0}% completion`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone="green"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,0.75fr)]">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="text-base font-bold sm:text-lg">
                    Today&apos;s rounding queue
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Sorted by acuity, pending clinical actions, and time since
                    last review.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/doctor/ipd/patients")}
                  className="self-start border-slate-200"
                >
                  All assigned patients
                  <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search patient, UHID, diagnosis..."
                    className="border-slate-200 pl-9"
                  />
                </div>
                <Select
                  value={queueFilter}
                  onValueChange={(value) =>
                    setQueueFilter(value as QueueFilter)
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Clinical status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Under Observation">
                      Under Observation
                    </SelectItem>
                    <SelectItem value="Stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={wardFilter} onValueChange={setWardFilter}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All wards</SelectItem>
                    {wards.map((ward) => (
                      <SelectItem key={ward} value={ward}>
                        {ward}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-1 md:justify-center">
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "rounded-md p-2",
                      viewMode === "table"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-400",
                    )}
                    aria-label="Table view"
                  >
                    <ListFilter className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("cards")}
                    className={cn(
                      "rounded-md p-2",
                      viewMode === "cards"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-400",
                    )}
                    aria-label="Card view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <TableHead>Patient</TableHead>
                        <TableHead>Bed</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Last vitals</TableHead>
                        <TableHead>Clinical status</TableHead>
                        <TableHead>Pending action</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPatients.map((patient) => {
                        const { bed } = parseWardRoomBed(patient.wardRoomBed);
                        return (
                          <tr
                            key={patient.uhid}
                            className="transition-colors hover:bg-blue-50/30"
                          >
                            <td className="px-4 py-4 sm:px-5">
                              <div className="flex items-center gap-3">
                                <Avatar name={patient.patientName} />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {patient.patientName}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {patient.uhid}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 sm:px-5">
                              {bed}
                            </td>
                            <td className="max-w-[170px] px-4 py-4 sm:px-5">
                              <p className="truncate text-sm text-slate-700">
                                {patient.currentDiagnosis}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {patient.department}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600 sm:px-5">
                              BP {patient.vitals.bp} · SpO₂{" "}
                              {patient.vitals.spo2}%
                            </td>
                            <td className="px-4 py-4 sm:px-5">
                              <Badge className={statusClasses(patient.status)}>
                                {patientClinicalPriority(patient)}
                              </Badge>
                            </td>
                            <td className="max-w-[160px] px-4 py-4 text-xs text-slate-600 sm:px-5">
                              {pendingAction(patient)}
                            </td>
                            <td className="px-4 py-4 text-right sm:px-5">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() =>
                                  openClinicalOverview(patient.uhid)
                                }
                                className="text-blue-600"
                              >
                                Open{" "}
                                <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:p-5">
                  {filteredPatients.map((patient) => (
                    <QueuePatientCard
                      key={patient.uhid}
                      patient={patient}
                      onOpen={openClinicalOverview}
                    />
                  ))}
                </div>
              )}
              {filteredPatients.length === 0 && <EmptyQueue />}
            </CardContent>
          </Card>

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
                <WorkloadCard
                  count={stats.stable}
                  label="Stable / routine"
                  color="bg-emerald-500"
                />
                <WorkloadCard
                  count={stats.review}
                  label="Review pending"
                  color="bg-amber-400"
                />
                <WorkloadCard
                  count={stats.critical}
                  label="High acuity"
                  color="bg-red-500"
                />
                <WorkloadCard
                  count={Math.max(1, Math.floor(stats.stable / 2))}
                  label="Discharge ready"
                  color="bg-violet-500"
                />
              </div>
              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
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

function StatCard({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
  tone: "blue" | "red" | "amber" | "green";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
  };
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div
          className={cn(
            "mb-4 flex h-9 w-9 items-center justify-center rounded-lg",
            tones[tone],
          )}
        >
          {icon}
        </div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </p>
        <p className="mt-1 truncate text-[10px] text-slate-400">{note}</p>
      </CardContent>
    </Card>
  );
}

function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-5",
        className,
      )}
    >
      {children}
    </th>
  );
}
function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
      {name.charAt(0)}
    </div>
  );
}
function pendingAction(patient: WardRoundPatient) {
  if (patient.status === "Critical") return "Immediate clinical review";
  if (patient.status === "Under Observation") return "Review pending results";
  return "Routine ward review";
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
      <p className="text-xl font-bold text-slate-800">
        {String(count).padStart(2, "0")}
      </p>
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
function EmptyQueue() {
  return (
    <div className="px-6 py-14 text-center">
      <Users className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 font-semibold text-slate-700">
        No patients match your filters
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Try changing the search or status filter.
      </p>
    </div>
  );
}
function QueuePatientCard({
  patient,
  onOpen,
}: {
  patient: WardRoundPatient;
  onOpen: (uhid: string) => void;
}) {
  const { bed } = parseWardRoomBed(patient.wardRoomBed);
  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={patient.patientName} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">
                {patient.patientName}
              </p>
              <p className="text-xs text-slate-400">{patient.uhid}</p>
            </div>
          </div>
          <Badge className={statusClasses(patient.status)}>
            {patientClinicalPriority(patient)}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-400">Bed</p>
            <p className="mt-1 font-medium text-slate-700">{bed}</p>
          </div>
          <div>
            <p className="text-slate-400">Last vitals</p>
            <p className="mt-1 font-medium text-slate-700">
              BP {patient.vitals.bp}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-400">Diagnosis</p>
            <p className="mt-1 font-medium text-slate-700">
              {patient.currentDiagnosis}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpen(patient.uhid)}
          className="mt-4 w-full border-blue-200 text-blue-600"
        >
          Open clinical overview
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
function PriorityAlerts({
  patients,
  onOpen,
}: {
  patients: WardRoundPatient[];
  onOpen: (uhid: string) => void;
}) {
  const critical = patients.filter((patient) => patient.status === "Critical");
  const review = patients.filter(
    (patient) => patient.status === "Under Observation",
  );
  const alerts = [...critical, ...review].slice(0, 3);
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between px-5 py-4 sm:px-6">
        <div>
          <CardTitle className="text-base font-bold sm:text-lg">
            Priority alerts
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Require doctor review or acknowledgement.
          </p>
        </div>
        <Badge variant="outline" className="border-red-200 text-red-600">
          {critical.length + review.length} open
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5 sm:px-6">
        {alerts.map((patient, index) => (
          <button
            key={patient.uhid}
            onClick={() => onOpen(patient.uhid)}
            className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                patient.status === "Critical"
                  ? "bg-red-50 text-red-500"
                  : "bg-amber-50 text-amber-500",
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
          <p className="py-8 text-center text-sm text-slate-400">
            No priority alerts today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
function roundRecommendation(patients: WardRoundPatient[]) {
  const critical = patients.find((patient) => patient.status === "Critical");
  if (critical)
    return `Review ${parseWardRoomBed(critical.wardRoomBed).bed} first — ${critical.patientName} is marked critical with ${critical.currentDiagnosis}.`;
  const review = patients.find(
    (patient) => patient.status === "Under Observation",
  );
  return review
    ? `Review ${review.patientName} next — pending clinical observation and investigation results.`
    : "All assigned patients are stable. Continue with routine ward review.";
}


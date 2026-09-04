// app/(dashboard)/rmo/ipd/all-patients/page.tsx
"use client";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  RmoFilters as RmoFiltersState,
  RmoPatient,
} from "@/types/rmo/ipd/rmo-types";
import { RMO_PATIENTS, RMO_WARDS, RMO_DEPARTMENTS } from "@/lib/rmo/ipd/rmo-data";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import { PatientStatusBadge } from "./_components/rmo-badges";

type ViewMode = "list" | "grid";
const initialFilters: RmoFiltersState = {
  search: "",
  ward: "All",
  status: "All",
  department: "All",
};

const previousDay = {
  total: 26,
  stable: 14,
  underObservation: 7,
  critical: 5,
};

export default function RmoAllPatientsPage() {
  const router = useRouter();
  const [patients] = useState<RmoPatient[]>(RMO_PATIENTS);
  const [filters, setFilters] = useState<RmoFiltersState>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");

  const openPatient = useCallback((patient: RmoPatient) => {
    router.push(`/rmo/ipd/all-patients/${patient.uhid}`);
  }, [router]);

  const filtered = useMemo(
    () =>
      patients.filter((patient) => {
        const query = filters.search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [patient.patientName, patient.uhid, patient.ipdId]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesWard =
          filters.ward === "All" || patient.ward === filters.ward;
        const matchesStatus =
          filters.status === "All" || patient.status === filters.status;
        return matchesSearch && matchesWard && matchesStatus;
      }),
    [patients, filters],
  );

  const stats = useMemo(
    () => ({
      total: patients.length,
      stable: patients.filter((p) => p.status === "Stable").length,
      underObservation: patients.filter(
        (p) => p.status === "Under Observation",
      ).length,
      critical: patients.filter((p) => p.status === "Critical").length,
    }),
    [patients],
  );

function updateFilter<K extends keyof RmoFiltersState>(
    key: K,
    value: RmoFiltersState[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  const hasActiveFilters =
    filters.search ||
    filters.ward !== "All" ||
    filters.status !== "All" ||
    filters.department !== "All";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Patients",
      value: String(stats.total),
      icon: UserRound,
      accent: "blue",
      footer: "Under RMO care",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Stable",
      value: String(stats.stable),
      icon: CheckCircle2,
      accent: "emerald",
      footer: "No active concerns",
      trend: buildTrend(stats.stable, previousDay.stable),
    },
    {
      label: "Under Observation",
      value: String(stats.underObservation),
      icon: Clock3,
      accent: "amber",
      footer: "Being closely monitored",
      trend: buildTrend(
        stats.underObservation,
        previousDay.underObservation,
      ),
    },
    {
      label: "Critical",
      value: String(stats.critical),
      icon: AlertTriangle,
      accent: "rose",
      footer: "Require urgent attention",
      trend: buildTrend(stats.critical, previousDay.critical),
    },
  ];

  const columns: OpsColumn<RmoPatient>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (p) => (
        <div>
          <p className="font-semibold text-slate-800">{p.patientName}</p>
          <p className="text-xs text-slate-400">{p.uhid}</p>
        </div>
      ),
    },
    {
      key: "ipdId",
      header: "IPD ID",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.ipdId}</span>
      ),
    },
    {
      key: "ageGender",
      header: "Age / Gender",
      cell: (p) => (
        <span className="text-sm text-slate-600">
          {p.age} yrs · {p.gender}
        </span>
      ),
    },
    {
      key: "ward",
      header: "Ward / Bed",
      cell: (p) => (
        <div className="text-sm text-slate-600">
          {p.ward}
          <p className="text-xs text-slate-400">
            {p.room} · {p.bed}
          </p>
        </div>
      ),
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      cell: (p) => {
        const latest = p.diagnoses[0];
        return latest ? (
          <div>
            <p className="text-sm text-slate-700">{latest.name}</p>
            <p className="text-xs text-slate-400">{latest.code}</p>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Not yet added</span>
        );
      },
    },
    {
      key: "doctor",
      header: "Attending Doctor",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.attendingDoctor}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.department}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => <PatientStatusBadge status={p.status} />,
    },
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      enableHiding: false,
      cell: (p) => (
        <OpsActionButton
          label="View Details"
          icon={Eye}
          onClick={() => openPatient(p)}
        />
      ),
    },
  ];

  function renderCard(p: RmoPatient) {
    const latestDiagnosis = p.diagnoses[0];
    const pendingDoses = p.doses.filter((d) => d.status === "Pending").length;
    return (
      <Card className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">
                {p.patientName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{p.patientName}</p>
                <p className="text-xs text-slate-400">{p.uhid}</p>
              </div>
            </div>
            <PatientStatusBadge status={p.status} />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-700">
              {p.attendingDoctor}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {p.ward} · {p.room} · {p.bed}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">
                Diagnosis
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-700">
                {latestDiagnosis?.name ?? "Not yet added"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">
                Pending Doses
              </p>
              <p
                className={`mt-1 text-sm font-bold ${pendingDoses > 0 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {pendingDoses}
              </p>
            </div>
          </div>

<Button
            className="mt-4 w-full gap-2 border-blue-200 text-blue-700"
            variant="outline"
            onClick={() => openPatient(p)}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="RMO — All IPD Patients"
        description="Full clinical overview: vitals, diagnosis, medicines, labs, notes, billing, and discharge in one place."
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Resident Medical Officer
          </span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, or IPD ID..."
            onSearch={(v) => updateFilter("search", v)}
            canClear={!!hasActiveFilters}
            onClear={() => setFilters(initialFilters)}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filters={[
              {
                key: "ward",
                label: "Ward",
                placeholder: "All Wards",
                selected: filters.ward,
                options: [
                  { value: "All", label: "All Wards" },
                  ...RMO_WARDS.map((w) => ({ value: w, label: w })),
                ],
              },
              {
                key: "status",
                label: "Status",
                placeholder: "All Statuses",
                selected: filters.status,
                options: [
                  { value: "All", label: "All Statuses" },
                  { value: "Stable", label: "Stable" },
                  { value: "Under Observation", label: "Under Observation" },
                  { value: "Critical", label: "Critical" },
                  { value: "Discharged", label: "Discharged" },
                ],
              },
              {
                key: "department",
                label: "Department",
                placeholder: "All Departments",
                selected: filters.department,
                options: [
                  { value: "All", label: "All Departments" },
                  ...RMO_DEPARTMENTS.map((d) => ({
                    value: d,
                    label: d,
                  })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "ward") updateFilter("ward", value);
              if (key === "status")
                updateFilter(
                  "status",
                  value as RmoFiltersState["status"],
                );
              if (key === "department")
                updateFilter(
                  "department",
                  value as RmoFiltersState["department"],
                );
            }}
          />
        </div>

        {view === "list" ? (
<OpsTable
            data={filtered}
            rowKey={(p) => p.uhid}
            columns={columns}
            onRowClick={openPatient}
            showColumnToggle
          />
        ) : (
<OpsGrid
            data={filtered}
            rowKey={(p) => p.uhid}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  HeartCrack,
  ShieldAlert,
  Siren,
  UserPlus,
  Users,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  EmergencyFilters as EmergencyFiltersState,
  EmergencyPatient,
} from "@/types/emergency/emergency-types";
import { EMERGENCY_PATIENTS } from "@/lib/emergency/emergency-data";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  OpsGrid,
  OpsGridCard,
  OpsActionButton,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import { EmergencyStatusBadge } from "./_components/emergency-badges";
import { EmergencyDetailDrawer } from "./_components/drawer/emergency-detail-drawer";
import { EMERGENCY_STATUS_OPTIONS, INCIDENT_TYPE_OPTIONS } from "@/lib/emergency/emergency-data";

type ViewMode = "list" | "grid";

const previousDay = {
  total: 42,
  critical: 8,
  underObservation: 15,
  policeCases: 3,
  deaths: 1,
};

const initialFilters: EmergencyFiltersState = {
  search: "",
  status: "All",
  incidentType: "All",
};

export default function EmergencyAllPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<EmergencyPatient[]>(
    EMERGENCY_PATIENTS,
  );
  const [filters, setFilters] = useState<EmergencyFiltersState>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [viewingPatient, setViewingPatient] =
    useState<EmergencyPatient | null>(null);

  const filtered = useMemo(
    () =>
      patients.filter((patient) => {
        const query = filters.search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [patient.patientName ?? "", patient.uhid, patient.emergencyNumber]
            .join(" ")
            .toLowerCase()
            .includes(query);
        const matchesStatus =
          filters.status === "All" || patient.status === filters.status;
        const matchesIncident =
          filters.incidentType === "All" ||
          patient.incidentType === filters.incidentType;
        return matchesSearch && matchesStatus && matchesIncident;
      }),
    [patients, filters],
  );

  const stats = useMemo(
    () => ({
      total: patients.length,
      critical: patients.filter((p) => p.status === "Critical").length,
      underObservation: patients.filter(
        (p) => p.status === "Under Observation",
      ).length,
      policeCases: patients.filter((p) => p.police.caseType !== "None").length,
      deaths: patients.filter((p) => p.status === "Patient Death").length,
    }),
    [patients],
  );

  function updateFilter<K extends keyof EmergencyFiltersState>(
    key: K,
    value: EmergencyFiltersState[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function handlePatientUpdate(updated: EmergencyPatient) {
    setPatients((previous) =>
      previous.map((p) =>
        p.emergencyNumber === updated.emergencyNumber ? updated : p,
      ),
    );
    setViewingPatient(updated);
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "All" ||
    filters.incidentType !== "All";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Emergency Patients",
      value: String(stats.total),
      icon: Users,
      accent: "blue",
      footer: "All time",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Critical",
      value: String(stats.critical),
      icon: Siren,
      accent: "rose",
      footer: "Require immediate attention",
      trend: buildTrend(stats.critical, previousDay.critical),
    },
    {
      label: "Under Observation",
      value: String(stats.underObservation),
      icon: AlertTriangle,
      accent: "amber",
      footer: "Being monitored",
      trend: buildTrend(stats.underObservation, previousDay.underObservation),
    },
    {
      label: "Police / MLC Cases",
      value: String(stats.policeCases),
      icon: ShieldAlert,
      accent: "violet",
      footer: "Medico-legal cases",
      trend: buildTrend(stats.policeCases, previousDay.policeCases),
    },
    {
      label: "Patient Deaths",
      value: String(stats.deaths),
      icon: HeartCrack,
      accent: "slate",
      footer: "Reported this period",
      trend: buildTrend(stats.deaths, previousDay.deaths),
    },
  ];

  const columns: OpsColumn<EmergencyPatient>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (p) => (
        <div>
          <p className="font-semibold text-slate-800">
            {p.patientName || "Unidentified"}
          </p>
          <p className="text-xs text-slate-400">{p.uhid}</p>
        </div>
      ),
    },
    {
      key: "emergencyNumber",
      header: "Emergency No.",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.emergencyNumber}</span>
      ),
    },
    {
      key: "ageGender",
      header: "Age / Gender",
      hideOn: "md",
      cell: (p) => (
        <span className="text-sm text-slate-600">
          {p.age ? `${p.age} yrs` : "—"} · {p.gender}
        </span>
      ),
    },
    {
      key: "incidentType",
      header: "Incident",
      hideOn: "md",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.incidentType}</span>
      ),
    },
    {
      key: "arrivalMode",
      header: "Arrival Mode",
      hideOn: "lg",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.arrivalMode}</span>
      ),
    },
    {
      key: "doctor",
      header: "Attending Doctor",
      hideOn: "lg",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.attendingDoctor}</span>
      ),
    },
    {
      key: "bedOrBay",
      header: "Bed / Bay",
      hideOn: "xl",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.bedOrBay}</span>
      ),
    },
    {
      key: "policeCase",
      header: "Police Case",
      hideOn: "2xl",
      cell: (p) =>
        p.police.caseType !== "None" ? (
          <Badge
            variant="outline"
            className="gap-1 border-red-200 bg-red-50 text-red-700"
          >
            <ShieldAlert className="h-3 w-3" />
            {p.police.caseType}
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => <EmergencyStatusBadge status={p.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      enableHiding: false,
      cell: (p) => (
        <div className="text-right">
          <OpsActionButton label="View Details" icon={Eye} onClick={() => setViewingPatient(p)} className="border-red-200 text-red-700" />
        </div>
      ),
    },
  ];

  function renderCard(patient: EmergencyPatient) {
    return (
      <OpsGridCard
        accent="from-red-500 via-orange-500 to-red-500"
        avatar={(patient.patientName || "U").charAt(0)}
        title={patient.patientName || "Unidentified"}
        subtitle={patient.uhid}
        badge={<EmergencyStatusBadge status={patient.status} />}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{patient.attendingDoctor}</p>
            <p className="mt-1 text-xs text-slate-500">{patient.bedOrBay} · {patient.emergencyNumber}</p>
          </>
        }
        stats={[
          { label: "Incident", value: patient.incidentType },
          { label: "Arrival", value: patient.arrivalMode },
        ]}
        footerTags={
          patient.police.caseType !== "None" ? (
            <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700">
              <ShieldAlert className="h-3 w-3" />
              Police Case: {patient.police.caseType}
            </Badge>
          ) : undefined
        }
        action={{
          label: "View Details",
          icon: Eye,
          onClick: () => setViewingPatient(patient),
          variant: "outline",
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Emergency Department"
        description="All emergency patients — registration, vitals, medicines, labs, and case status in one place."
        meta={
          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            Admission Desk
          </span>
        }
        actions={
          <Button
            className="gap-2 bg-red-600 hover:bg-red-700"
            onClick={() =>
              router.push("/admission/emergency/new-registration")
            }
          >
            <UserPlus className="h-4 w-4" /> New Registration
          </Button>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            onSearch={(v) => updateFilter("search", v)}
            searchPlaceholder="Patient, UHID, or Emergency No..."
            canClear={hasActiveFilters}
            onClear={() => setFilters(initialFilters)}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filters={[
              {
                key: "status",
                label: "Status",
                placeholder: "All Statuses",
                selected: filters.status,
                options: [
                  { value: "All", label: "All Statuses" },
                  ...EMERGENCY_STATUS_OPTIONS.map((s) => ({
                    value: s,
                    label: s,
                  })),
                ],
              },
              {
                key: "incidentType",
                label: "Incident",
                placeholder: "All Incidents",
                selected: filters.incidentType,
                options: [
                  { value: "All", label: "All Incidents" },
                  ...INCIDENT_TYPE_OPTIONS.map((i) => ({
                    value: i,
                    label: i,
                  })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "status")
                updateFilter(
                  "status",
                  value as EmergencyFiltersState["status"],
                );
              if (key === "incidentType")
                updateFilter(
                  "incidentType",
                  value as EmergencyFiltersState["incidentType"],
                );
            }}
          />
        </div>

        {view === "list" ? (
          <div className="min-w-0 w-full">
            <OpsTable
              data={filtered}
              rowKey={(p) => p.emergencyNumber}
              columns={columns}
              showColumnToggle
            />
          </div>
        ) : (
          <OpsGrid
            data={filtered}
            rowKey={(p) => p.emergencyNumber}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>

      <EmergencyDetailDrawer
        patient={viewingPatient}
        onClose={() => setViewingPatient(null)}
        onPatientUpdate={handlePatientUpdate}
      />
    </div>
  );
}


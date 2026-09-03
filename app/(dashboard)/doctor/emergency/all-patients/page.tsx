// app/(dashboard)/doctor/emergency/all-patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { ShieldAlert, Siren, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmergencyFilters } from "@/types/emergency/emergency-types";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import { EMERGENCY_PATIENTS, EMERGENCY_STATUS_OPTIONS, INCIDENT_TYPE_OPTIONS } from "@/lib/emergency/emergency-data";
import { EmergencyStatusBadge } from "@/app/(dashboard)/admission/emergency/all-patients/_components/emergency-badges";
import { RmoPatientDetailsDrawer } from "@/app/(dashboard)/rmo/emergency/all-patients/_components/rmo-patient-details-drawer";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";

type ViewMode = "list" | "grid";

const initialFilters: EmergencyFilters = { search: "", status: "All", incidentType: "All" };

const previousDay = { total: 13, critical: 2, underObservation: 4, unassigned: 3, police: 1 };

export default function DoctorEmergencyAllPatientsPage() {
  const [patients, setPatients] = useState<RmoEmergencyPatient[]>(EMERGENCY_PATIENTS.map((p) => ({ ...p, criticalNotifications: [] })));
  const [filters, setFilters] = useState<EmergencyFilters>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [drawerPatient, setDrawerPatient] = useState<RmoEmergencyPatient | null>(null);

  const filtered = useMemo(
    () =>
      patients.filter((p) => {
        const q = filters.search.toLowerCase().trim();
        return (
          (!q || [p.patientName || "", p.uhid, p.emergencyNumber].join(" ").toLowerCase().includes(q)) &&
          (filters.status === "All" || p.status === filters.status) &&
          (filters.incidentType === "All" || p.incidentType === filters.incidentType)
        );
      }),
    [patients, filters],
  );

  const stats = useMemo(
    () => ({
      total: patients.length,
      critical: patients.filter((p) => p.status === "Critical").length,
      underObservation: patients.filter((p) => p.status === "Under Observation").length,
      unassigned: patients.filter((p) => p.attendingDoctor === "Unassigned").length,
      police: patients.filter((p) => p.police.caseType !== "None").length,
    }),
    [patients],
  );

  function updatePatient(updated: RmoEmergencyPatient) {
    setPatients((rows) => rows.map((p) => (p.emergencyNumber === updated.emergencyNumber ? updated : p)));
    setDrawerPatient(updated);
  }

  const isActive = filters.search !== "" || filters.status !== "All" || filters.incidentType !== "All";

  const infoCards: KpiCardProps[] = [
    { label: "Total Patients", value: String(stats.total), icon: Users, accent: "blue", footer: "Emergency census", trend: buildTrend(stats.total, previousDay.total) },
    { label: "Critical", value: String(stats.critical), icon: Siren, accent: "rose", footer: "Immediate attention", trend: buildTrend(stats.critical, previousDay.critical) },
    { label: "Under Observation", value: String(stats.underObservation), icon: Stethoscope, accent: "amber", footer: "Being monitored", trend: buildTrend(stats.underObservation, previousDay.underObservation) },
    { label: "Unassigned to Me", value: String(stats.unassigned), icon: Users, accent: "violet", footer: "Need assignment", trend: buildTrend(stats.unassigned, previousDay.unassigned) },
    { label: "Police Cases", value: String(stats.police), icon: ShieldAlert, accent: "slate", footer: "MLC cases", trend: buildTrend(stats.police, previousDay.police) },
  ];

  const columns: OpsColumn<RmoEmergencyPatient>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (p) => (
        <div>
          <p className="font-semibold text-slate-800">{p.patientName || "Unidentified"}</p>
          <p className="text-xs text-slate-400">{p.uhid}</p>
        </div>
      ),
    },
    {
      key: "emergencyNumber",
      header: "Emergency No.",
      cell: (p) => <span className="text-sm text-slate-600">{p.emergencyNumber}</span>,
    },
    {
      key: "incidentType",
      header: "Incident",
      cell: (p) => <span className="text-sm text-slate-600">{p.incidentType}</span>,
    },
    {
      key: "attendingDoctor",
      header: "Attending Doctor",
      cell: (p) => (
        <span className={p.attendingDoctor === "Unassigned" ? "font-semibold text-amber-600" : "text-sm text-slate-600"}>
          {p.attendingDoctor}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => <EmergencyStatusBadge status={p.status} />,
    },
    {
      key: "action",
      header: "Action",
      enableHiding: false,
      cell: (p) => (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setDrawerPatient(p)}>
          <Stethoscope className="h-4 w-4" />View Details
        </Button>
      ),
    },
  ];

  function renderCard(p: RmoEmergencyPatient) {
    return (
      <OpsGridCard
        avatar={p.patientName ? p.patientName.charAt(0).toUpperCase() : "U"}
        title={p.patientName || "Unidentified"}
        subtitle={`${p.uhid} · ${p.emergencyNumber}`}
        badge={<EmergencyStatusBadge status={p.status} />}
        context={
          <>
            <p className="text-sm text-slate-600">Doctor: {p.attendingDoctor}</p>
            <p className="mt-1 text-sm text-slate-600">Incident: {p.incidentType}</p>
          </>
        }
        action={{
          label: "View Details",
          icon: Stethoscope,
          onClick: () => setDrawerPatient(p),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Emergency Patients"
        description="Review clinical records, order investigations, add treatment plans, and manage emergency status."
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Doctor</span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            onSearch={(value) => setFilters((f) => ({ ...f, search: value }))}
            searchPlaceholder="Patient, UHID, or Emergency No..."
            canClear={isActive}
            onClear={() => setFilters(initialFilters)}
            viewSupported
            viewMode={viewMode}
            onViewChange={setViewMode}
            filters={[
              {
                key: "status",
                label: "Filter by status",
                selected: filters.status,
                options: [
                  { value: "All", label: "All Statuses" },
                  ...EMERGENCY_STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
                ],
              },
              {
                key: "incidentType",
                label: "Filter by incident",
                selected: filters.incidentType,
                options: [
                  { value: "All", label: "All Incidents" },
                  ...INCIDENT_TYPE_OPTIONS.map((t) => ({ value: t, label: t })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              setFilters((f) => ({ ...f, [key]: value }));
            }}
          />
        </div>

        {viewMode === "list" ? (
          <OpsTable
            data={filtered}
            rowKey={(p) => p.emergencyNumber}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={filtered}
            rowKey={(p) => p.emergencyNumber}
            renderCard={renderCard}
            pageSize={6}
          />
        )}

        <RmoPatientDetailsDrawer patient={drawerPatient} onClose={() => setDrawerPatient(null)} onUpdate={updatePatient} />
      </main>
    </div>
  );
}


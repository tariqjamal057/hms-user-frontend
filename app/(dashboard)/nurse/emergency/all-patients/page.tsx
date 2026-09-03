// app/(dashboard)/nurse/emergency/all-patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { ShieldAlert, Siren, Syringe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import { EMERGENCY_PATIENTS, EMERGENCY_STATUS_OPTIONS, INCIDENT_TYPE_OPTIONS } from "@/lib/emergency/emergency-data";
import { EmergencyStatusBadge } from "@/app/(dashboard)/admission/emergency/all-patients/_components/emergency-badges";
import { NursePatientDetailsDrawer } from "./_components/nurse-patient-details-drawer";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";

type ViewMode = "list" | "grid";

const previousDay = { total: 9, critical: 2, pendingMeds: 8, activeTreatments: 5, police: 1 };

interface NurseEmergencyFilters {
  search: string;
  status: "All" | string;
  incidentType: "All" | string;
}

const initialFilters: NurseEmergencyFilters = { search: "", status: "All", incidentType: "All" };

export default function NurseEmergencyAllPatientsPage() {
  const [patients, setPatients] = useState<RmoEmergencyPatient[]>(EMERGENCY_PATIENTS.map((p) => ({ ...p, criticalNotifications: [] })));
  const [filters, setFilters] = useState<NurseEmergencyFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
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
      pendingMeds: patients.reduce((sum, p) => sum + p.doses.filter((d) => d.status === "Pending").length, 0),
      activeTreatments: patients.reduce((sum, p) => sum + p.treatmentPlans.filter((t) => t.followStatus === "Following").length, 0),
      police: patients.filter((p) => p.police.caseType !== "None").length,
    }),
    [patients],
  );

  function updatePatient(updated: RmoEmergencyPatient) {
    setPatients((rows) => rows.map((p) => (p.emergencyNumber === updated.emergencyNumber ? updated : p)));
    setDrawerPatient(updated);
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Patients", value: String(stats.total), icon: Users, accent: "blue", footer: "Emergency census", trend: buildTrend(stats.total, previousDay.total) },
    { label: "Critical", value: String(stats.critical), icon: Siren, accent: "rose", footer: "Immediate attention", trend: buildTrend(stats.critical, previousDay.critical) },
    { label: "Pending Medicines", value: String(stats.pendingMeds), icon: Syringe, accent: "amber", footer: "To be administered", trend: buildTrend(stats.pendingMeds, previousDay.pendingMeds) },
    { label: "Active Treatments", value: String(stats.activeTreatments), icon: Users, accent: "emerald", footer: "Being followed", trend: buildTrend(stats.activeTreatments, previousDay.activeTreatments) },
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
      key: "assignedNurse",
      header: "Assigned Nurse",
      cell: (p) => (
        <span className={p.assignedNurse === "Unassigned" ? "font-semibold text-amber-600" : "text-slate-600"}>
          {p.assignedNurse}
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
      headerClassName: "text-right",
      className: "text-right",
      enableHiding: false,
      cell: (p) => (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setDrawerPatient(p)}>
          <Syringe className="h-4 w-4" />View Details
        </Button>
      ),
    },
  ];

  function renderCard(p: RmoEmergencyPatient) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <CardContent className="p-0">
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800">{p.patientName || "Unidentified"}</p>
              <p className="text-xs text-slate-400">{p.uhid} · {p.emergencyNumber}</p>
            </div>
            <EmergencyStatusBadge status={p.status} />
          </div>
          <p className="mt-3 text-sm text-slate-600">Nurse: {p.assignedNurse}</p>
          <p className="text-sm text-slate-600">Pending meds: {p.doses.filter((d) => d.status === "Pending").length}</p>
          <Button variant="outline" className="mt-4 w-full gap-2" onClick={() => setDrawerPatient(p)}>
            <Syringe className="h-4 w-4" />View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Emergency Patients"
        description="Administer medicines, track treatment plans, and monitor patient status."
        meta={
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Nurse
          </span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, or Emergency No..."
            onSearch={(value) => setFilters((f) => ({ ...f, search: value }))}
            canClear={Boolean(filters.search || filters.status !== "All" || filters.incidentType !== "All")}
            onClear={() => setFilters(initialFilters)}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filterToggle
            filters={[
              {
                key: "status",
                label: "Status",
                placeholder: "All Statuses",
                selected: filters.status,
                options: [{ value: "All", label: "All Statuses" }, ...EMERGENCY_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))],
              },
              {
                key: "incidentType",
                label: "Incident",
                placeholder: "All Incidents",
                selected: filters.incidentType,
                options: [{ value: "All", label: "All Incidents" }, ...INCIDENT_TYPE_OPTIONS.map((i) => ({ value: i, label: i }))],
              },
            ]}
            onFilterChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={filtered}
            rowKey={(p) => p.emergencyNumber}
            columns={columns}
           
            showColumnToggle
            onRowClick={(p) => setDrawerPatient(p)}
          />
        ) : (
          <OpsGrid data={filtered} rowKey={(p) => p.emergencyNumber} renderCard={renderCard} pageSize={6} />
        )}

        <NursePatientDetailsDrawer patient={drawerPatient} onClose={() => setDrawerPatient(null)} onUpdate={updatePatient} />
      </main>
    </div>
  );
}


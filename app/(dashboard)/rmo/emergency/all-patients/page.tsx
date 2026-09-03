// app/(dashboard)/rmo/emergency/all-patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Eye,
  ShieldAlert,
  Siren,
  UserRound,
  UserRoundCog,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  EmergencyFilters,
  EmergencyPatient,
} from "@/types/emergency/emergency-types";
import type {
  AssignmentRole,
  AvailableDoctor,
  AvailableNurse,
  RmoEmergencyPatient,
} from "@/types/emergency/rmo-emergency-types";
import { EMERGENCY_PATIENTS } from "@/lib/emergency/emergency-data";
import {
  AVAILABLE_DOCTORS,
  AVAILABLE_NURSES,
} from "@/lib/emergency/rmo-emergency-data";
import { EMERGENCY_STATUS_OPTIONS, INCIDENT_TYPE_OPTIONS } from "@/lib/emergency/emergency-data";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsActionMenu, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import { EmergencyStatusBadge } from "@/app/(dashboard)/admission/emergency/all-patients/_components/emergency-badges";
import { AssignmentDrawer } from "./_components/assignment-drawer";
import { RmoPatientDetailsDrawer } from "./_components/rmo-patient-details-drawer";

type ViewMode = "list" | "grid";

const initialFilters: EmergencyFilters = {
  search: "",
  status: "All",
  incidentType: "All",
};

const previousDay = {
  total: 30,
  critical: 5,
  unassignedDoctor: 4,
  unassignedNurse: 6,
  police: 3,
};

export default function RmoEmergencyAllPatientsPage() {
  const [patients, setPatients] = useState<RmoEmergencyPatient[]>(
    EMERGENCY_PATIENTS.map((p) => ({ ...p, criticalNotifications: [] })),
  );
  const [filters, setFilters] = useState<EmergencyFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [drawerPatient, setDrawerPatient] =
    useState<RmoEmergencyPatient | null>(null);
  const [assignment, setAssignment] = useState<{
    patient: RmoEmergencyPatient;
    role: AssignmentRole;
  } | null>(null);

  const filtered = useMemo(
    () =>
      patients.filter((p) => {
        const q = filters.search.toLowerCase().trim();
        return (
          (!q ||
            [p.patientName || "", p.uhid, p.emergencyNumber]
              .join(" ")
              .toLowerCase()
              .includes(q)) &&
          (filters.status === "All" || p.status === filters.status) &&
          (filters.incidentType === "All" ||
            p.incidentType === filters.incidentType)
        );
      }),
    [patients, filters],
  );

  const stats = useMemo(
    () => ({
      total: patients.length,
      critical: patients.filter((p) => p.status === "Critical").length,
      unassignedDoctor: patients.filter(
        (p) => p.attendingDoctor === "Unassigned",
      ).length,
      unassignedNurse: patients.filter(
        (p) => p.assignedNurse === "Unassigned",
      ).length,
      police: patients.filter((p) => p.police.caseType !== "None").length,
    }),
    [patients],
  );

  function updatePatient(updated: RmoEmergencyPatient) {
    setPatients((rows) =>
      rows.map((p) =>
        p.emergencyNumber === updated.emergencyNumber ? updated : p,
      ),
    );
    setDrawerPatient(updated);
  }

  function assign(
    selection: AvailableDoctor | AvailableNurse,
    showToast: boolean = true,
  ) {
    if (!assignment) return;
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const p = assignment.patient;
    const updated: RmoEmergencyPatient =
      assignment.role === "Doctor"
        ? {
            ...p,
            attendingDoctor: selection.name,
            department: (selection as AvailableDoctor).department,
            doctorAssignment: {
              doctorId: selection.id,
              doctorName: selection.name,
              department: (selection as AvailableDoctor).department,
              assignedBy: "RMO",
              assignedAt: stamp,
            },
          }
        : {
            ...p,
            assignedNurse: selection.name,
            nurseAssignment: {
              nurseId: selection.id,
              nurseName: selection.name,
              shift: (selection as AvailableNurse).shift,
              assignedBy: "RMO",
              assignedAt: stamp,
            },
          };
    updatePatient(updated);
    setAssignment(null);
  }

  const hasActiveFilters =
    filters.search ||
    filters.status !== "All" ||
    filters.incidentType !== "All";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Patients",
      value: String(stats.total),
      icon: Users,
      accent: "blue",
      footer: "Emergency census",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Critical",
      value: String(stats.critical),
      icon: Siren,
      accent: "rose",
      footer: "Immediate action",
      trend: buildTrend(stats.critical, previousDay.critical),
    },
    {
      label: "Doctor Pending",
      value: String(stats.unassignedDoctor),
      icon: AlertTriangle,
      accent: "amber",
      footer: "Need assignment",
      trend: buildTrend(stats.unassignedDoctor, previousDay.unassignedDoctor),
    },
    {
      label: "Nurse Pending",
      value: String(stats.unassignedNurse),
      icon: Users,
      accent: "violet",
      footer: "Need assignment",
      trend: buildTrend(stats.unassignedNurse, previousDay.unassignedNurse),
    },
    {
      label: "Police Cases",
      value: String(stats.police),
      icon: ShieldAlert,
      accent: "slate",
      footer: "MLC cases",
      trend: buildTrend(stats.police, previousDay.police),
    },
  ];

  const columns: OpsColumn<RmoEmergencyPatient>[] = [
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
      key: "emergencyNo",
      header: "Emergency No.",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.emergencyNumber}</span>
      ),
    },
    {
      key: "incident",
      header: "Incident",
      hideOn: "md",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.incidentType}</span>
      ),
    },
    {
      key: "doctor",
      header: "Attending Doctor",
      hideOn: "md",
      cell: (p) => (
        <span
          className={
            p.attendingDoctor === "Unassigned"
              ? "font-semibold text-amber-600"
              : "text-slate-600"
          }
        >
          {p.attendingDoctor}
        </span>
      ),
    },
    {
      key: "nurse",
      header: "Assigned Nurse",
      hideOn: "lg",
      cell: (p) => (
        <span
          className={
            p.assignedNurse === "Unassigned"
              ? "font-semibold text-amber-600"
              : "text-slate-600"
          }
        >
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
        <OpsActionMenu
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => setDrawerPatient(p),
            },
            {
              label: p.attendingDoctor === "Unassigned" ? "Assign Doctor" : "Doctor Assigned",
              icon: UserRoundCog,
              onClick: () => setAssignment({ patient: p, role: "Doctor" }),
            },
            {
              label: p.assignedNurse === "Unassigned" ? "Assign Nurse" : "Nurse Assigned",
              icon: UserRound,
              onClick: () => setAssignment({ patient: p, role: "Nurse" }),
            },
          ]}
        />
      ),
    },
  ];

  function renderCard(p: RmoEmergencyPatient) {
    return (
      <Card className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent className="p-5">
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800">
                {p.patientName || "Unidentified"}
              </p>
              <p className="text-xs text-slate-400">
                {p.uhid} · {p.emergencyNumber}
              </p>
            </div>
            <EmergencyStatusBadge status={p.status} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Doctor: {p.attendingDoctor}
          </p>
          <p className="text-sm text-slate-600">
            Nurse: {p.assignedNurse}
          </p>
          <div className="mt-4">
            <OpsActionMenu
              items={[
                {
                  label: "View Details",
                  icon: Eye,
                  onClick: () => setDrawerPatient(p),
                },
                {
                  label: p.attendingDoctor === "Unassigned" ? "Assign Doctor" : "Doctor Assigned",
                  icon: UserRoundCog,
                  onClick: () => setAssignment({ patient: p, role: "Doctor" }),
                },
                {
                  label: p.assignedNurse === "Unassigned" ? "Assign Nurse" : "Nurse Assigned",
                  icon: UserRound,
                  onClick: () => setAssignment({ patient: p, role: "Nurse" }),
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Emergency Patients"
        description="Assign care teams, review clinical records, order investigations, and manage emergency status."
        meta={
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            RMO
          </span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, or Emergency No..."
            onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
            canClear={!!hasActiveFilters}
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
            onFilterChange={(key, value) =>
              setFilters((f) => ({
                ...f,
                [key]: value as EmergencyFilters[keyof EmergencyFilters],
              }))
            }
          />
        </div>

        {view === "list" ? (
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

        <AssignmentDrawer
          patient={assignment?.patient || null}
          role={assignment?.role || null}
          doctors={AVAILABLE_DOCTORS}
          nurses={AVAILABLE_NURSES}
          onClose={() => setAssignment(null)}
          onAssign={assign}
        />
        <RmoPatientDetailsDrawer
          patient={drawerPatient}
          onClose={() => setDrawerPatient(null)}
          onUpdate={updatePatient}
        />
      </main>
    </div>
  );
}


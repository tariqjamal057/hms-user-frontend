"use client";

import { useMemo, useState } from "react";
import { Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IcuPatient, IcuFilters } from "@/types/admission-desk/icu/icu-types";
import { ICU_PATIENTS } from "@/lib/admission-desk/icu/icu-data";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  OpsGrid,
  OpsGridCard,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import { IcuStatusBadge, AdmissionTypeBadge } from "./_components/icu-badges";
import { IcuPatientDrawer } from "./_components/icu-patient-drawer";
import { ICU_STATUS_OPTIONS, ADMISSION_TYPE_OPTIONS, ICU_FLOORS } from "@/lib/admission-desk/icu/icu-data";

type ViewMode = "list" | "grid";

const previousDay = {
  total: 35,
  stable: 18,
  observation: 10,
  critical: 5,
};

const initialFilters: IcuFilters = {
  search: "",
  status: "All",
  admissionType: "All",
  floor: "All",
  dateFrom: "",
  dateTo: "",
};

export default function IcuAllPatientsPage() {
  const [patients] = useState<IcuPatient[]>(ICU_PATIENTS);
  const [filters, setFilters] = useState<IcuFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedPatient, setSelectedPatient] = useState<IcuPatient | null>(null);

  const filtered = useMemo(
    () =>
      patients.filter((p) => {
        const q = filters.search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          [p.patientName, p.uhid, p.icuId].join(" ").toLowerCase().includes(q);
        const matchesStatus =
          filters.status === "All" || p.status === filters.status;
        const matchesAdmission =
          filters.admissionType === "All" ||
          p.admissionType === filters.admissionType;
        const matchesFloor =
          filters.floor === "All" || p.floor === filters.floor;
        const matchesDateFrom =
          !filters.dateFrom || p.admissionDate >= filters.dateFrom;
        const matchesDateTo =
          !filters.dateTo || p.admissionDate <= filters.dateTo;
        return (
          matchesSearch &&
          matchesStatus &&
          matchesAdmission &&
          matchesFloor &&
          matchesDateFrom &&
          matchesDateTo
        );
      }),
    [patients, filters],
  );

  const stats = useMemo(
    () => ({
      total: patients.length,
      stable: patients.filter((p) => p.status === "Stable").length,
      critical: patients.filter((p) => p.status === "Critical").length,
      observation: patients.filter(
        (p) => p.status === "Under Observation",
      ).length,
    }),
    [patients],
  );

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "All" ||
    filters.admissionType !== "All" ||
    filters.floor !== "All" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total ICU Patients",
      value: String(stats.total),
      icon: Heart,
      accent: "blue",
      footer: "Currently admitted",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Stable",
      value: String(stats.stable),
      icon: Heart,
      accent: "emerald",
      footer: "Hemodynamically stable",
      trend: buildTrend(stats.stable, previousDay.stable),
    },
    {
      label: "Under Observation",
      value: String(stats.observation),
      icon: Heart,
      accent: "amber",
      footer: "Requires monitoring",
      trend: buildTrend(stats.observation, previousDay.observation),
    },
    {
      label: "Critical",
      value: String(stats.critical),
      icon: Heart,
      accent: "rose",
      footer: "Requires immediate attention",
      trend: buildTrend(stats.critical, previousDay.critical),
    },
  ];

  const columns: OpsColumn<IcuPatient>[] = [
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
      key: "icuId",
      header: "ICU ID",
      cell: (p) => <span className="text-sm text-slate-600">{p.icuId}</span>,
    },
    {
      key: "floor",
      header: "Floor",
      cell: (p) => <span className="text-sm text-slate-600">{p.floor}</span>,
    },
    {
      key: "wardBed",
      header: "Ward/Bed",
      cell: (p) => (
        <span className="text-slate-600">
          {p.ward} · {p.bed}
        </span>
      ),
    },
    {
      key: "doctor",
      header: "Assigned Doctor",
      cell: (p) => (
        <span className="text-sm text-slate-600">{p.assignedDoctor}</span>
      ),
    },
    {
      key: "admissionType",
      header: "Admission Type",
      cell: (p) => <AdmissionTypeBadge type={p.admissionType} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => <IcuStatusBadge status={p.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      enableHiding: false,
      cell: (p) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedPatient(p)}
          className="gap-1"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ];

  function renderCard(patient: IcuPatient) {
    return (
      <OpsGridCard
        avatar={patient.patientName.charAt(0)}
        title={patient.patientName}
        subtitle={patient.uhid}
        badge={<IcuStatusBadge status={patient.status} />}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{patient.ward} · {patient.bed}</p>
            <p className="mt-1 text-xs text-slate-500">{patient.floor} · {patient.icuId}</p>
          </>
        }
        footerTags={
          <>
            <AdmissionTypeBadge type={patient.admissionType} />
            <Badge variant="outline" className="border-slate-200 text-slate-600">Dr. {patient.assignedDoctor}</Badge>
          </>
        }
        action={{
          label: "View Details",
          icon: Eye,
          onClick: () => setSelectedPatient(patient),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="ICU Patients"
        description="Monitor and manage all patients admitted to Intensive Care Units."
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Admission Desk
          </span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
            searchPlaceholder="Patient name, UHID, or ICU ID..."
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
                  ...ICU_STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
                ],
              },
              {
                key: "admissionType",
                label: "Admission Type",
                placeholder: "All Types",
                selected: filters.admissionType,
                options: [
                  { value: "All", label: "All Types" },
                  ...ADMISSION_TYPE_OPTIONS.map((a) => ({
                    value: a,
                    label: a,
                  })),
                ],
              },
              {
                key: "floor",
                label: "Floor",
                placeholder: "All Floors",
                selected: filters.floor,
                options: [
                  { value: "All", label: "All Floors" },
                  ...ICU_FLOORS.map((f) => ({ value: f, label: f })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "status")
                setFilters((f) => ({
                  ...f,
                  status: value as IcuFilters["status"],
                }));
              if (key === "admissionType")
                setFilters((f) => ({
                  ...f,
                  admissionType: value as IcuFilters["admissionType"],
                }));
              if (key === "floor")
                setFilters((f) => ({
                  ...f,
                  floor: value as IcuFilters["floor"],
                }));
            }}
            extra={
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, dateFrom: e.target.value }))
                }
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
                placeholder="From date"
              />
            }
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={filtered}
            rowKey={(p) => p.icuId}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={filtered}
            rowKey={(p) => p.icuId}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>

      <IcuPatientDrawer
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
}


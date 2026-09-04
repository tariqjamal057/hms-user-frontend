// app/(dashboard)/nurse-admin/ipd/all-ward-patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BedDouble, CheckCircle2, Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WardPatientFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { ALL_WARDS, WARD_PATIENTS_FULL } from "@/lib/nurse-admin/ipd/ward-detail-data";
import { PatientStatusBadge } from "./_components/status-badges";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";

type ViewMode = "list" | "grid";

const previousDay = { total: 32, stable: 20, underObservation: 8, critical: 3, discharged: 1 };

export default function AllWardPatientsPage() {
  const router = useRouter();
  const patients = WARD_PATIENTS_FULL;
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filtered = useMemo(() => patients.filter((patient) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [patient.patientName, patient.uhid, patient.ipdId, patient.bed].join(" ").toLowerCase().includes(query);
    const matchesWard = wardFilter === "All" || patient.ward === wardFilter;
    const matchesStatus = statusFilter === "All" || patient.status === statusFilter;
    return matchesSearch && matchesWard && matchesStatus;
  }), [patients, searchQuery, wardFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: patients.length,
    stable: patients.filter((p) => p.status === "Stable").length,
    critical: patients.filter((p) => p.status === "Critical").length,
    underObservation: patients.filter((p) => p.status === "Under Observation").length,
    discharged: patients.filter((p) => p.status === "Discharged").length,
  }), [patients]);

  const infoCards: KpiCardProps[] = [
    { label: "Total Patients", value: String(stats.total), icon: BedDouble, accent: "blue", footer: "Across all wards", trend: buildTrend(stats.total, previousDay.total) },
    { label: "Stable", value: String(stats.stable), icon: CheckCircle2, accent: "emerald", footer: "No active concerns", trend: buildTrend(stats.stable, previousDay.stable) },
    { label: "Under Observation", value: String(stats.underObservation), icon: AlertTriangle, accent: "amber", footer: "Being closely monitored", trend: buildTrend(stats.underObservation, previousDay.underObservation) },
    { label: "Critical", value: String(stats.critical), icon: AlertTriangle, accent: "rose", footer: "Require urgent attention", trend: buildTrend(stats.critical, previousDay.critical) },
    { label: "Discharged", value: String(stats.discharged), icon: LogOut, accent: "violet", footer: "Recently released", trend: buildTrend(stats.discharged, previousDay.discharged) },
  ];

  const columns: OpsColumn<WardPatientFull>[] = [
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
      cell: (p) => <span className="text-sm text-slate-600">{p.ipdId}</span>,
    },
    {
      key: "ageGender",
      header: "Age / Gender",
      cell: (p) => <span className="text-sm text-slate-600">{p.age} yrs · {p.gender}</span>,
    },
    {
      key: "wardBed",
      header: "Ward / Bed",
      cell: (p) => <div className="text-sm text-slate-600">{p.ward}<p className="text-xs text-slate-400">{p.room} · {p.bed}</p></div>,
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      cell: (p) => (
        <div>
          <p className="text-sm text-slate-700">{p.currentDiagnosis}</p>
          <p className="text-xs text-slate-400">{p.diagnosisCode}</p>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (p) => <span className="text-sm text-slate-600">{p.admittingDoctor}</span>,
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
          onClick={() => router.push(`/nurseAdmin/ipd/all-ward-patients/${p.uhid}`)}
        />
      ),
    },
  ];

  function renderCard(patient: WardPatientFull) {
    return (
      <Card key={patient.uhid} className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">{patient.patientName.charAt(0)}</div>
              <div><p className="font-bold text-slate-800">{patient.patientName}</p><p className="text-xs text-slate-400">{patient.uhid}</p></div>
            </div>
            <PatientStatusBadge status={patient.status} />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><span className="h-3.5 w-3.5 text-violet-600">🩺</span>{patient.admittingDoctor}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">📍 {patient.ward} · {patient.room} · {patient.bed}</p>
          </div>

          <div className="mt-3 rounded-lg border border-slate-100 p-3">
            <p className="text-[10px] uppercase text-slate-400">Diagnosis</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-700">{patient.currentDiagnosis}</p>
          </div>

          <Button className="mt-4 w-full gap-2 border-blue-200 text-blue-700" variant="outline" onClick={() => router.push(`/nurseAdmin/ipd/all-ward-patients/${patient.uhid}`)}>
            <Eye className="h-4 w-4" />View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="All Ward Patients"
        description="Complete post-admission view of every ward patient — beds, vitals, medicines, nursing, and discharge in one place."
        meta={<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Nurse Admin</span>}
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            searchPlaceholder="Patient, UHID, IPD ID or bed..."
            onSearch={setSearchQuery}
            canClear={searchQuery !== "" || wardFilter !== "All" || statusFilter !== "All"}
            onClear={() => { setSearchQuery(""); setWardFilter("All"); setStatusFilter("All"); }}
            viewSupported
            viewMode={viewMode}
            onViewChange={setViewMode}
            filters={[
              {
                key: "ward",
                label: "Filter by ward",
                placeholder: "All Wards",
                selected: wardFilter,
                options: [{ value: "All", label: "All Wards" }, ...ALL_WARDS.map((w) => ({ value: w, label: w }))],
              },
              {
                key: "status",
                label: "Filter by status",
                placeholder: "All Status",
                selected: statusFilter,
                options: [
                  { value: "All", label: "All Status" },
                  { value: "Stable", label: "Stable" },
                  { value: "Under Observation", label: "Under Observation" },
                  { value: "Critical", label: "Critical" },
                  { value: "Discharged", label: "Discharged" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "ward") setWardFilter(value);
              if (key === "status") setStatusFilter(value);
            }}
          />
        </div>

        {viewMode === "list" ? (
          <OpsTable
            data={filtered}
            rowKey={(p) => p.uhid}
            columns={columns}
          />
        ) : (
          <OpsGrid data={filtered} rowKey={(p) => p.uhid} renderCard={renderCard} pageSize={6} />
        )}
      </main>
    </div>
  );
}


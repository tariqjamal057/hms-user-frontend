// app/(dashboard)/nurse/ipd/patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, HeartPulse, PackageX, Users, Eye, MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { NurseIpdPatient, NurseIpdPatientFilters } from "@/types/nurse/ipd/nurse-ipd-types";
import { NURSE_IPD_SHIFTS, NURSE_IPD_WARDS, getEmarForPatient, getNursePatients } from "@/lib/nurse/ipd/nurse-ipd-data";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import { AcuityBadge } from "./_components/nurse-ipd-badges";

type ViewMode = "list" | "grid";

const previousDay = { total: 8, critical: 1, pendingDoses: 6, outOfStock: 1 };

const initialFilters: NurseIpdPatientFilters = { search: "", ward: "All", acuity: "All", shift: "All" };

export default function NurseIpdPatientsPage() {
  const router = useRouter();
  const patients = useMemo(() => getNursePatients(), []);
  const [filters, setFilters] = useState<NurseIpdPatientFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("list");

  const filteredPatients = useMemo(() => patients.filter((patient) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [patient.patientName, patient.uhid, patient.ipdId, patient.bed].join(" ").toLowerCase().includes(query);
    const matchesWard = filters.ward === "All" || patient.ward === filters.ward;
    const matchesAcuity = filters.acuity === "All" || patient.acuity === filters.acuity;
    return matchesSearch && matchesWard && matchesAcuity;
  }), [patients, filters]);

  const stats = useMemo(() => {
    const critical = patients.filter((p) => p.acuity === "Critical").length;
    const pendingDoses = patients.reduce((sum, p) => sum + getEmarForPatient(p.uhid).filter((d) => d.status === "Pending").length, 0);
    const outOfStock = patients.reduce((sum, p) => sum + getEmarForPatient(p.uhid).filter((d) => d.status === "Out of Stock").length, 0);
    return { total: patients.length, critical, pendingDoses, outOfStock };
  }, [patients]);

  function updateFilter<K extends keyof NurseIpdPatientFilters>(key: K, value: NurseIpdPatientFilters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function viewPatient(patient: NurseIpdPatient) {
    router.push(`/nurse/ipd/patients/${patient.uhid}`);
  }

  const infoCards: KpiCardProps[] = [
    { label: "Assigned Patients", value: String(stats.total), icon: Users, accent: "blue", footer: "Under your care this shift", trend: buildTrend(stats.total, previousDay.total) },
    { label: "Critical Patients", value: String(stats.critical), icon: AlertTriangle, accent: "rose", footer: "Require close monitoring", trend: buildTrend(stats.critical, previousDay.critical) },
    { label: "Pending Doses", value: String(stats.pendingDoses), icon: HeartPulse, accent: "amber", footer: "Medicines due to be given", trend: buildTrend(stats.pendingDoses, previousDay.pendingDoses) },
    { label: "Out of Stock", value: String(stats.outOfStock), icon: PackageX, accent: "violet", footer: "Doses awaiting pharmacy stock", trend: buildTrend(stats.outOfStock, previousDay.outOfStock) },
  ];

  const columns: OpsColumn<NurseIpdPatient>[] = [
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
      enableHiding: true,
      cell: (p) => <span className="text-sm text-slate-600">{p.age} yrs · {p.gender}</span>,
    },
    {
      key: "wardBed",
      header: "Ward / Bed",
      cell: (p) => (
        <div className="text-sm text-slate-600">{p.ward}<p className="text-xs text-slate-400">{p.room} · {p.bed}</p></div>
      ),
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      cell: (p) => (
        <div><p className="text-sm text-slate-700">{p.currentDiagnosis}</p><p className="text-xs text-slate-400">{p.diagnosisCode}</p></div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      enableHiding: true,
      cell: (p) => <span className="text-sm text-slate-600">{p.admittingDoctor}</span>,
    },
    {
      key: "pendingDoses",
      header: "Pending Doses",
      cell: (p) => {
        const pending = getEmarForPatient(p.uhid).filter((dose) => dose.status === "Pending").length;
        return <span className={`text-sm font-semibold ${pending > 0 ? "text-amber-600" : "text-emerald-600"}`}>{pending}</span>;
      },
    },
    {
      key: "shiftNurse",
      header: "Shift Nurse",
      cell: (p) => (
        <div><p className="text-sm text-slate-700">{p.assignedNurse}</p><p className="text-xs text-slate-400">{p.currentShift}</p></div>
      ),
    },
    {
      key: "acuity",
      header: "Acuity",
      cell: (p) => <AcuityBadge acuity={p.acuity} />,
    },
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      enableHiding: false,
      cell: (p) => (
        <Button variant="outline" size="sm" onClick={() => viewPatient(p)} className="border-blue-200 text-blue-700">
          <Eye className="mr-1 h-4 w-4" />View Details
        </Button>
      ),
    },
  ];

  function renderCard(p: NurseIpdPatient) {
    const pending = getEmarForPatient(p.uhid).filter((dose) => dose.status === "Pending").length;
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
            <AcuityBadge acuity={p.acuity} />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Stethoscope className="h-3.5 w-3.5 text-violet-600" />{p.admittingDoctor}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3 w-3" />{p.ward} · {p.room} · {p.bed}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">Diagnosis</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-700">{p.currentDiagnosis}</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">Pending Doses</p>
              <p className={`mt-1 text-sm font-bold ${pending > 0 ? "text-amber-600" : "text-emerald-600"}`}>{pending}</p>
            </div>
          </div>

          <Button className="mt-4 w-full border-blue-200 text-blue-700" variant="outline" onClick={() => viewPatient(p)}>
            <Eye className="mr-2 h-4 w-4" />View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="My IPD Patients"
        description="Manage vitals, medication administration, and care plans for your assigned patients."
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Nursing Station
          </span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            searchPlaceholder="Patient, UHID, IPD ID or bed..."
            onSearch={(value) => updateFilter("search", value)}
            canClear={Boolean(filters.search || filters.ward !== "All" || filters.acuity !== "All")}
            onClear={() => setFilters(initialFilters)}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filterToggle
            filters={[
              {
                key: "ward",
                label: "Ward",
                placeholder: "All Wards",
                selected: filters.ward,
                options: [{ value: "All", label: "All Wards" }, ...NURSE_IPD_WARDS.map((w) => ({ value: w, label: w }))],
              },
              {
                key: "acuity",
                label: "Acuity",
                placeholder: "All Acuity",
                selected: filters.acuity,
                options: [
                  { value: "All", label: "All Acuity" },
                  { value: "Stable", label: "Stable" },
                  { value: "Under Observation", label: "Under Observation" },
                  { value: "Critical", label: "Critical" },
                ],
              },
            ]}
            onFilterChange={(key, value) => updateFilter(key as keyof NurseIpdPatientFilters, value as NurseIpdPatientFilters[keyof NurseIpdPatientFilters])}
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={filteredPatients}
            rowKey={(p) => p.uhid}
            columns={columns}
           
            showColumnToggle
            onRowClick={viewPatient}
          />
        ) : (
          <OpsGrid data={filteredPatients} rowKey={(p) => p.uhid} renderCard={renderCard} pageSize={6} />
        )}
      </main>
    </div>
  );
}


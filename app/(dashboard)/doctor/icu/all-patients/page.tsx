// app/(dashboard)/doctor/icu/all-patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, HeartPulse, PackageX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NurseIpdPatient } from "@/types/nurse/ipd/nurse-ipd-types";
import { NURSE_ICU_SHIFTS, NURSE_ICU_WARDS, getEmarForPatient, getNursePatients } from "@/lib/nurse/icu/nurse-icu-data";
import { AcuityBadge } from "../../../nurse/ipd/patients/_components/nurse-ipd-badges";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";

type ViewMode = "list" | "grid";

const previousDay = { total: 7, critical: 2, pendingDoses: 8, outOfStock: 1 };

export default function DoctorIcuPatientsPage() {
  const router = useRouter();
  const patients = useMemo(() => getNursePatients(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [acuityFilter, setAcuityFilter] = useState("All");
  const [shiftFilter, setShiftFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filteredPatients = useMemo(() => patients.filter((patient) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [patient.patientName, patient.uhid, patient.ipdId, patient.bed].join(" ").toLowerCase().includes(query);
    const matchesWard = wardFilter === "All" || patient.ward === wardFilter;
    const matchesAcuity = acuityFilter === "All" || patient.acuity === acuityFilter;
    return matchesSearch && matchesWard && matchesAcuity;
  }), [patients, searchQuery, wardFilter, acuityFilter]);

  const stats = useMemo(() => {
    const critical = patients.filter((p) => p.acuity === "Critical").length;
    const pendingDoses = patients.reduce((sum, p) => sum + getEmarForPatient(p.uhid).filter((d) => d.status === "Pending").length, 0);
    const outOfStock = patients.reduce((sum, p) => sum + getEmarForPatient(p.uhid).filter((d) => d.status === "Out of Stock").length, 0);
    return { total: patients.length, critical, pendingDoses, outOfStock };
  }, [patients]);

  const isActive = searchQuery !== "" || wardFilter !== "All" || acuityFilter !== "All" || shiftFilter !== "All";

  function viewPatient(patient: NurseIpdPatient) {
    router.push(`/doctor/icu/all-patients/${patient.uhid}`);
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
      cell: (p) => <span className="text-sm text-slate-600">{p.age} yrs &middot; {p.gender}</span>,
    },
    {
      key: "ward",
      header: "Ward / Bed",
      cell: (p) => (
        <div className="text-sm text-slate-600">
          {p.ward}
          <p className="text-xs text-slate-400">{p.room} &middot; {p.bed}</p>
        </div>
      ),
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
      enableHiding: false,
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
      key: "nurse",
      header: "Shift Nurse",
      cell: (p) => (
        <div>
          <p className="text-sm text-slate-700">{p.assignedNurse}</p>
          <p className="text-xs text-slate-400">{p.currentShift}</p>
        </div>
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
        <OpsActionButton
          label="View Details"
          icon={Eye}
          onClick={() => viewPatient(p)}
        />
      ),
    },
  ];

  function renderCard(p: NurseIpdPatient) {
    const pending = getEmarForPatient(p.uhid).filter((dose) => dose.status === "Pending").length;
    return (
      <OpsGridCard
        avatar={p.patientName.charAt(0)}
        title={p.patientName}
        subtitle={p.uhid}
        badge={<AcuityBadge acuity={p.acuity} />}
        context={
          <>
            <p className="text-sm font-semibold text-slate-700">{p.admittingDoctor}</p>
            <p className="mt-1 text-xs text-slate-500">{p.ward} &middot; {p.room} &middot; {p.bed}</p>
          </>
        }
        stats={[
          { label: "Diagnosis", value: p.currentDiagnosis },
          { label: "Pending Doses", value: pending, tone: pending > 0 ? "warning" : "positive" },
        ]}
        action={{
          label: "View Details",
          icon: Eye,
          onClick: () => viewPatient(p),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="My ICU Patients"
        description="Manage vitals, medication administration, ventilation, oxygen therapy, and care plans for your assigned ICU patients."
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Doctor</span>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Patient, UHID, ICU ID or bed no..."
            canClear={isActive}
            onClear={() => {
              setSearchQuery("");
              setWardFilter("All");
              setAcuityFilter("All");
              setShiftFilter("All");
            }}
            viewSupported
            viewMode={viewMode}
            onViewChange={setViewMode}
            filterToggle
            filters={[
              {
                key: "ward",
                label: "Filter by ward",
                selected: wardFilter,
                options: [
                  { value: "All", label: "All Wards" },
                  ...NURSE_ICU_WARDS.map((w) => ({ value: w, label: w })),
                ],
              },
              {
                key: "acuity",
                label: "Filter by acuity",
                selected: acuityFilter,
                options: [
                  { value: "All", label: "All Acuity" },
                  { value: "Stable", label: "Stable" },
                  { value: "Under Observation", label: "Under Observation" },
                  { value: "Critical", label: "Critical" },
                ],
              },
              {
                key: "shift",
                label: "Filter by shift",
                selected: shiftFilter,
                options: [
                  { value: "All", label: "All Shifts" },
                  ...NURSE_ICU_SHIFTS.map((s) => ({ value: s, label: s })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "ward") setWardFilter(value);
              if (key === "acuity") setAcuityFilter(value);
              if (key === "shift") setShiftFilter(value);
            }}
          />
        </div>

        {viewMode === "list" ? (
          <OpsTable
            data={filteredPatients}
            rowKey={(p) => p.uhid}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={filteredPatients}
            rowKey={(p) => p.uhid}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>
    </div>
  );
}


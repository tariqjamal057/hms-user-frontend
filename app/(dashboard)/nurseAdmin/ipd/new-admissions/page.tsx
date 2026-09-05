// app/(dashboard)/nurse-admin/ipd/new-admissions/page.tsx
"use client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PillButton } from "@/components/forms/pill-button";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import type { AdmittedPatient, DailyShiftAssignment } from "@/types/nurse-admin/ipd/nurse-admin-types";
import { NEW_ADMISSIONS, NURSE_ADMIN_DEPARTMENTS, NURSE_ADMIN_WARDS, WARD_PATIENTS } from "@/lib/nurse-admin/ipd/nurse-admin-data";
import { AssignNurseDrawer } from "./_components/assign-nurse-drawer";
import { AcuityBadge } from "./_components/nurse-admin-badges";

type ViewMode = "list" | "grid";

const ACUITY_STYLES: Record<string, string> = {
  Stable: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Under Observation": "bg-amber-50 text-amber-700 border-amber-200",
  Critical: "bg-red-50 text-red-700 border-red-200",
};

const previousDay = { total: 4, critical: 1, today: 3 };

export default function NewAdmissionsPage() {
  const [admissions, setAdmissions] = useState<AdmittedPatient[]>(NEW_ADMISSIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [acuityFilter, setAcuityFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [assigningPatient, setAssigningPatient] = useState<AdmittedPatient | null>(null);

  const filtered = useMemo(() => admissions.filter((patient) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [patient.patientName, patient.uhid, patient.ipdId, patient.bed].join(" ").toLowerCase().includes(query);
    const matchesWard = wardFilter === "All" || patient.ward === wardFilter;
    const matchesAcuity = acuityFilter === "All" || patient.acuity === acuityFilter;
    return matchesSearch && matchesWard && matchesAcuity;
  }), [admissions, searchQuery, wardFilter, acuityFilter]);

  const stats = useMemo(() => ({
    total: admissions.length,
    critical: admissions.filter((p) => p.acuity === "Critical").length,
    today: admissions.filter((p) => p.admissionDateTime.startsWith("24 Aug 2026")).length,
  }), [admissions]);

  function handleSaveAssignment(uhid: string, assignments: DailyShiftAssignment[]) {
    const patient = admissions.find((p) => p.uhid === uhid);
    if (!patient) return;

    const hasAnyAssignment = assignments.some((a) => a.nurseIds.length > 0);
    if (!hasAnyAssignment) {
      toast.error("Assign at least one nurse to a shift before saving.");
      return;
    }

    WARD_PATIENTS.push({ ...patient, assignments });
    setAdmissions((previous) => previous.filter((p) => p.uhid !== uhid));
    setAssigningPatient(null);
    toast.success(`${patient.patientName} moved to Ward Patients with nurse assignments.`);
  }

  const infoCards: KpiCardProps[] = [
    { label: "Pending Assignment", value: String(stats.total), icon: Users, accent: "blue", footer: "Awaiting nurse allocation", trend: buildTrend(stats.total, previousDay.total) },
    { label: "Critical Patients", value: String(stats.critical), icon: AlertTriangle, accent: "rose", footer: "Require immediate assignment", trend: buildTrend(stats.critical, previousDay.critical) },
    { label: "Admitted Today", value: String(stats.today), icon: UserPlus, accent: "emerald", footer: "24 Aug 2026", trend: buildTrend(stats.today, previousDay.today) },
  ];

  const columns: OpsColumn<AdmittedPatient>[] = [
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
      cell: (p) => (
        <div className="text-sm text-slate-600">{p.ward}<p className="text-xs text-slate-400">{p.room} · {p.bed}</p></div>
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
      cell: (p) => <span className="text-sm text-slate-600">{p.admittingDoctor}</span>,
    },
    {
      key: "admissionTime",
      header: "Admission Time",
      cell: (p) => <span className="text-sm text-slate-600">{p.admissionDateTime}</span>,
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
          label="Assign Nurse"
          icon={UserPlus}
          onClick={() => setAssigningPatient(p)}
        />
      ),
    },
  ];

  function renderCard(patient: AdmittedPatient) {
    return (
      <Card key={patient.uhid} className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">
                {patient.patientName.charAt(0)}
              </div>
              <div><p className="font-bold text-slate-800">{patient.patientName}</p><p className="text-xs text-slate-400">{patient.uhid}</p></div>
            </div>
            <AcuityBadge acuity={patient.acuity} />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><span className="h-3.5 w-3.5 text-violet-600">🩺</span>{patient.admittingDoctor}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">📍 {patient.ward} · {patient.room} · {patient.bed}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-3"><p className="text-[10px] uppercase text-slate-400">Diagnosis</p><p className="mt-1 truncate text-sm font-bold text-slate-700">{patient.currentDiagnosis}</p></div>
            <div className="rounded-lg border border-slate-100 p-3"><p className="text-[10px] uppercase text-slate-400">Admitted</p><p className="mt-1 truncate text-sm font-bold text-slate-700">{patient.admissionDateTime.split(",")[0]}</p></div>
          </div>

          <PillButton variant="gradient" icon={UserPlus} className="mt-4 w-full justify-center" onClick={() => setAssigningPatient(patient)}>
            Assign Nurse
          </PillButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="New Admissions"
        description="Patients freshly admitted from the admission desk, awaiting shift-wise nurse assignment."
        meta={<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Pending Nurse Assignment</span>}
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            searchPlaceholder="Patient, UHID, IPD ID or bed..."
            onSearch={setSearchQuery}
            canClear={searchQuery !== "" || wardFilter !== "All" || acuityFilter !== "All"}
            onClear={() => { setSearchQuery(""); setWardFilter("All"); setAcuityFilter("All"); }}
            viewSupported
            viewMode={viewMode}
            onViewChange={setViewMode}
            filters={[
              {
                key: "ward",
                label: "Filter by ward",
                placeholder: "All Wards",
                selected: wardFilter,
                options: [{ value: "All", label: "All Wards" }, ...NURSE_ADMIN_WARDS.map((w) => ({ value: w, label: w }))],
              },
              {
                key: "acuity",
                label: "Filter by acuity",
                placeholder: "All Acuity",
                selected: acuityFilter,
                options: [
                  { value: "All", label: "All Acuity" },
                  { value: "Stable", label: "Stable" },
                  { value: "Under Observation", label: "Under Observation" },
                  { value: "Critical", label: "Critical" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "ward") setWardFilter(value);
              if (key === "acuity") setAcuityFilter(value);
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

      <AssignNurseDrawer
        patient={assigningPatient}
        open={assigningPatient !== null}
        onOpenChange={(next) => { if (!next) setAssigningPatient(null); }}
        onSave={handleSaveAssignment}
      />
    </div>
  );
}


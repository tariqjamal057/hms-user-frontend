// app/(dashboard)/nurseAdmin/icu/patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, HeartPulse, PackageX, UserPlus, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PillButton } from "@/components/forms/pill-button";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsActionMenu, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import type { NurseIpdPatient, NurseIpdPatientFilters } from "@/types/nurse/ipd/nurse-ipd-types";
import type { AdmittedPatient, DailyShiftAssignment } from "@/types/nurse-admin/ipd/nurse-admin-types";
import { NURSE_ICU_SHIFTS, NURSE_ICU_WARDS, getEmarForPatient, getNursePatients } from "@/lib/nurse/icu/nurse-icu-data";
import { AcuityBadge } from "@/app/(dashboard)/nurse/ipd/patients/_components/nurse-ipd-badges";
import { AssignNurseDrawer } from "../../ipd/new-admissions/_components/assign-nurse-drawer";

type ViewMode = "list" | "grid";

const previousDay = { total: 10, critical: 2, pendingDoses: 8, outOfStock: 1 };

export default function NurseAdminIcuPatientsPage() {
  const router = useRouter();
  const patients = useMemo(() => getNursePatients(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [acuityFilter, setAcuityFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [assignNursePatient, setAssignNursePatient] = useState<AdmittedPatient | null>(null);

  const filteredPatients = useMemo(() =>
    patients.filter((patient) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || [patient.patientName, patient.uhid, patient.ipdId, patient.bed].join(" ").toLowerCase().includes(query);
      const matchesWard = wardFilter === "All" || patient.ward === wardFilter;
      const matchesAcuity = acuityFilter === "All" || patient.acuity === acuityFilter;
      return matchesSearch && matchesWard && matchesAcuity;
    }),
    [patients, searchQuery, wardFilter, acuityFilter],
  );

  const stats = useMemo(() => {
    const critical = patients.filter((p) => p.acuity === "Critical").length;
    const pendingDoses = patients.reduce(
      (sum, p) => sum + getEmarForPatient(p.uhid).filter((d) => d.status === "Pending").length, 0,
    );
    const outOfStock = patients.reduce(
      (sum, p) => sum + getEmarForPatient(p.uhid).filter((d) => d.status === "Out of Stock").length, 0,
    );
    return { total: patients.length, critical, pendingDoses, outOfStock };
  }, [patients]);

  function viewPatient(patient: NurseIpdPatient) {
    router.push(`/nurseAdmin/icu/patients/${patient.uhid}`);
  }

  function openAssignNurse(patient: NurseIpdPatient) {
    const mapped = {
      ...patient,
      admittedFrom: "Emergency",
      contactNumber: "",
      guardianName: "",
      assignments: [],
    } as unknown as AdmittedPatient;
    setAssignNursePatient(mapped);
  }

  function handleSaveAssignment(uhid: string, assignments: DailyShiftAssignment[]) {
    console.log("Saved nurse assignments for", uhid, assignments);
    setAssignNursePatient(null);
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
      enableHiding: true,
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
        <OpsActionMenu
          items={[
            {
              label: "Assign Nurse",
              icon: UserPlus,
              onClick: () => openAssignNurse(p),
            },
            {
              label: "View Details",
              icon: Eye,
              onClick: () => viewPatient(p),
            },
          ]}
        />
      ),
    },
  ];

  function renderCard(patient: NurseIpdPatient) {
    const pending = getEmarForPatient(patient.uhid).filter((dose) => dose.status === "Pending").length;
    return (
      <Card key={patient.uhid} className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white">
                {patient.patientName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{patient.patientName}</p>
                <p className="text-xs text-slate-400">{patient.uhid}</p>
              </div>
            </div>
            <AcuityBadge acuity={patient.acuity} />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><span className="h-3.5 w-3.5 text-violet-600">🩺</span>{patient.admittingDoctor}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">📍 {patient.ward} · {patient.room} · {patient.bed}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">Diagnosis</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-700">{patient.currentDiagnosis}</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[10px] uppercase text-slate-400">Pending Doses</p>
              <p className={`mt-1 text-sm font-bold ${pending > 0 ? "text-amber-600" : "text-emerald-600"}`}>{pending}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <PillButton variant="outline" icon={UserPlus} className="flex-1 border-emerald-300 text-emerald-700 hover:border-emerald-400" onClick={() => openAssignNurse(patient)}>
              Assign Nurse
            </PillButton>
            <PillButton variant="outline" icon={Eye} className="flex-1 border-blue-300 text-blue-700 hover:border-blue-400" onClick={() => viewPatient(patient)}>
              View Details
            </PillButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="My ICU Patients"
        description="Manage vitals, medication administration, ventilation, oxygen therapy, and care plans for your assigned ICU patients."
        meta={<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Nursing Station Incharge</span>}
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            searchPlaceholder="Patient, UHID, ICU ID or bed no..."
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
                options: [{ value: "All", label: "All Wards" }, ...NURSE_ICU_WARDS.map((w) => ({ value: w, label: w }))],
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
            data={filteredPatients}
            rowKey={(p) => p.uhid}
            columns={columns}
          />
        ) : (
          <OpsGrid data={filteredPatients} rowKey={(p) => p.uhid} renderCard={renderCard} pageSize={6} />
        )}
      </main>

      <AssignNurseDrawer
        patient={assignNursePatient}
        open={assignNursePatient !== null}
        onOpenChange={(next) => { if (!next) setAssignNursePatient(null); }}
        onSave={handleSaveAssignment}
      />
    </div>
  );
}


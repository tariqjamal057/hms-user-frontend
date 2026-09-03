// app/(dashboard)/admission/ipd/all-patients/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Activity,
  TrendingUp,
  IndianRupee,
  Plus,
  X,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Stethoscope,
  BedDouble,
  FileText,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, OpsActionButton, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import type { IPDPatient } from "@/types/admission-desk/ipd/ipd-admission-types";
import { EXISTING_PATIENTS } from "@/lib/admission-desk/ipd/ipd-admission-data";

type ViewMode = "list" | "grid";

const previousDay = { total: 24, admitted: 18, discharged: 4, revenue: 90000 };

export default function IPDAllPatientsPage() {
  const router = useRouter();
  const [patients] = useState<IPDPatient[]>(EXISTING_PATIENTS);
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterDepartment, setFilterDepartment] = useState<string>("All");
  const [selectedPatient, setSelectedPatient] = useState<IPDPatient | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(query) ||
        patient.uhid.toLowerCase().includes(query) ||
        patient.ipdId.toLowerCase().includes(query) ||
        patient.mobileNumber?.includes(query);
      const matchesStatus =
        filterStatus === "All" || patient.status === filterStatus;
      const matchesDepartment =
        filterDepartment === "All" || patient.department === filterDepartment;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [patients, search, filterStatus, filterDepartment]);

  const stats = useMemo(() => {
    return {
      total: patients.length,
      admitted: patients.filter((p) => p.status === "Admitted").length,
      discharged: patients.filter((p) => p.status === "Discharged").length,
      revenue: patients.filter((p) => p.status === "Admitted").length * 5000,
    };
  }, [patients]);

  const columns: OpsColumn<IPDPatient>[] = [
    {
      key: "Patient",
      header: "Patient",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {row.firstName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-slate-400">{row.uhid}</p>
          </div>
        </div>
      ),
    },
    {
      key: "IPD ID",
      header: "IPD ID",
      cell: (row) => (
        <div className="font-mono text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded">
          {row.ipdId}
        </div>
      ),
    },
    {
      key: "Department",
      header: "Department",
      cell: (row) => (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
        >
          {row.department}
        </Badge>
      ),
    },
    {
      key: "Doctor",
      header: "Doctor",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            {row.doctor.name}
          </span>
        </div>
      ),
    },
    {
      key: "Bed",
      header: "Bed",
      cell: (row) => (
        <div className="text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <BedDouble className="h-4 w-4 text-slate-400" />
            <span className="font-medium">{row.bed}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {row.ward} · {row.room}
          </p>
        </div>
      ),
    },
    {
      key: "Status",
      header: "Status",
      cell: (row) => (
        <Badge
          className={`font-medium ${
            row.status === "Admitted"
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : row.status === "Discharged"
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
          }`}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "Admission Date",
      header: "Admission Date",
      cell: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{row.admissionDate}</span>
        </div>
      ),
    },
    {
      key: "Action",
      header: "Action",
      enableHiding: false,
      headerClassName: "text-right",
      cell: (row) => (
        <div className="text-right">
          <OpsActionButton label="View" icon={Eye} onClick={() => openDrawer(row)} />
        </div>
      ),
    },
  ];

  function openDrawer(patient: IPDPatient) {
    setSelectedPatient(patient);
    setIsDrawerOpen(true);
  }

  function handleResetFilters() {
    setSearch("");
    setFilterStatus("All");
    setFilterDepartment("All");
  }

  const hasActiveFilters =
    search !== "" || filterStatus !== "All" || filterDepartment !== "All";

  const infoCards: KpiCardProps[] = [
    { label: "Total Patients", value: String(stats.total), icon: Users, accent: "blue", footer: "All admissions", trend: buildTrend(stats.total, previousDay.total, "vs yesterday") },
    { label: "Currently Admitted", value: String(stats.admitted), icon: Activity, accent: "emerald", footer: "Active patients", trend: buildTrend(stats.admitted, previousDay.admitted, "vs yesterday") },
    { label: "Discharged", value: String(stats.discharged), icon: TrendingUp, accent: "indigo", footer: "Completed treatment", trend: buildTrend(stats.discharged, previousDay.discharged, "vs yesterday") },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, accent: "amber", footer: "From admitted patients", trend: buildTrend(stats.revenue, previousDay.revenue, "vs yesterday") },
  ];

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="All IPD Patients"
        description="Manage all admitted patients across departments"
        actions={
          <Button
            onClick={() => router.push("/admission/ipd/new-registration")}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4" /> New Registration
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {/* Premium Stats Cards */}
        <StatsRow items={infoCards} />

        {/* Premium Filters */}
        <FilterBar
          search={search}
          searchPlaceholder="Search by patient name, UHID, IPD ID, or mobile..."
          onSearch={setSearch}
          canClear={hasActiveFilters}
          onClear={handleResetFilters}
          viewSupported
          viewMode={view}
          onViewChange={setView}
          filters={[
            {
              key: "status",
              label: "Filter by status",
              placeholder: "All Status",
              selected: filterStatus,
              options: [
                { value: "All", label: "All Status" },
                { value: "Admitted", label: "Admitted" },
                { value: "Discharged", label: "Discharged" },
              ],
            },
            {
              key: "department",
              label: "Filter by department",
              placeholder: "All Departments",
              selected: filterDepartment,
              options: [
                { value: "All", label: "All Departments" },
                { value: "Cardiology", label: "Cardiology" },
                { value: "Neurology", label: "Neurology" },
                { value: "Orthopedics", label: "Orthopedics" },
                { value: "Trauma Surgery", label: "Trauma Surgery" },
                { value: "Emergency Medicine", label: "Emergency Medicine" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setFilterStatus(value);
            if (key === "department") setFilterDepartment(value);
          }}
        />

        {/* Patients List */}
        {view === "list" ? (
          <OpsTable
            columns={columns}
            data={filteredPatients}
            rowKey={(row) => row.ipdId}
            onRowClick={openDrawer}
          />
        ) : (
          <OpsGrid
            data={filteredPatients}
            rowKey={(row) => row.ipdId}
            renderCard={(patient) => (
              <OpsGridCard
                avatar={patient.firstName[0]}
                title={`${patient.firstName} ${patient.lastName}`}
                subtitle={patient.uhid}
                badge={
                  <Badge className={patient.status === "Admitted" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}>
                    {patient.status}
                  </Badge>
                }
                stats={[
                  { label: "IPD ID", value: patient.ipdId },
                  { label: "Department", value: patient.department },
                  { label: "Bed", value: patient.bed },
                  { label: "Doctor", value: patient.doctor.name },
                ]}
                action={{
                  label: "View Details",
                  icon: Eye,
                  onClick: () => openDrawer(patient),
                }}
              />
            )}
          />
        )}

        {/* Right Side Drawer */}
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedPatient && (
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Patient Details
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedPatient.ipdId}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-full hover:bg-white/50"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Patient Avatar & Basic Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {selectedPatient.firstName[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedPatient.uhid}
                    </p>
                    <Badge
                      className={`mt-2 ${selectedPatient.status === "Admitted" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                    >
                      {selectedPatient.status}
                    </Badge>
                  </div>
                </div>

                {/* Personal Information */}
                <Section
                  title="Personal Information"
                  icon={<User className="h-5 w-5" />}
                >
                  <InfoGrid>
                    <InfoField
                      label="Age"
                      value={`${selectedPatient.age} years`}
                    />
                    <InfoField label="Gender" value={selectedPatient.gender} />
                    <InfoField
                      label="Date of Birth"
                      value={selectedPatient.dateOfBirth}
                    />
                    <InfoField
                      label="Mobile"
                      value={selectedPatient.mobileNumber}
                      icon={<Phone className="h-4 w-4" />}
                    />
                    {selectedPatient.email && (
                      <InfoField
                        label="Email"
                        value={selectedPatient.email}
                        icon={<Mail className="h-4 w-4" />}
                      />
                    )}
                    <InfoField
                      label="Address"
                      value={`${selectedPatient.address}, ${selectedPatient.city}, ${selectedPatient.state} - ${selectedPatient.pinCode}`}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                  </InfoGrid>
                </Section>

                {/* Admission Details */}
                <Section
                  title="Admission Details"
                  icon={<FileText className="h-5 w-5" />}
                >
                  <InfoGrid>
                    <InfoField
                      label="IPD ID"
                      value={selectedPatient.ipdId}
                      highlight
                    />
                    <InfoField label="UHID" value={selectedPatient.uhid} />
                    <InfoField
                      label="Admission Date"
                      value={selectedPatient.admissionDate}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Department"
                      value={selectedPatient.department}
                      badge
                    />
                    <InfoField
                      label="Doctor"
                      value={selectedPatient.doctor.name}
                      icon={<Stethoscope className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Package"
                      value={selectedPatient.package}
                    />
                  </InfoGrid>
                </Section>

                {/* Bed Allocation */}
                <Section
                  title="Bed Allocation"
                  icon={<BedDouble className="h-5 w-5" />}
                >
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Ward
                        </p>
                        <p className="font-bold text-slate-800 mt-1">
                          {selectedPatient.ward}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Room
                        </p>
                        <p className="font-bold text-slate-800 mt-1">
                          {selectedPatient.room}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Bed
                        </p>
                        <p className="font-bold text-blue-600 mt-1">
                          {selectedPatient.bed}
                        </p>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Payment Information */}
                <Section
                  title="Payment Information"
                  icon={<CreditCard className="h-5 w-5" />}
                >
                  <InfoGrid>
                    <InfoField
                      label="Payment Method"
                      value={selectedPatient.paymentMethod}
                    />
                    {selectedPatient.insuranceNumber && (
                      <InfoField
                        label="Insurance Number"
                        value={selectedPatient.insuranceNumber}
                      />
                    )}
                  </InfoGrid>
                </Section>
              </div>
            </div>
          )}
        </div>

        {/* Backdrop */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

// Section Component
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">{icon}</div>
        {title}
      </h4>
      {children}
    </div>
  );
}

// Info Grid Component
function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

// Info Field Component
function InfoField({
  label,
  value,
  icon,
  badge,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      {badge ? (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
        >
          {value}
        </Badge>
      ) : highlight ? (
        <p className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {value}
        </p>
      ) : (
        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
          {icon} {value}
        </p>
      )}
    </div>
  );
}

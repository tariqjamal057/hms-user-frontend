"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DepartmentRequest } from "@/types/admission-desk/ipd/ipd-admission-types";
import { DEPARTMENT_REQUESTS } from "@/lib/admission-desk/ipd/ipd-admission-data";
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

type ViewMode = "list" | "grid";

const previousDay = {
  total: 30,
  emergency: 5,
  urgent: 8,
  routine: 15,
};

function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = {
    Emergency: {
      className: "bg-red-50 text-red-700 border-red-200 font-medium",
      icon: <AlertTriangle className="h-3 w-3 mr-1" />,
    },
    Urgent: {
      className: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    Routine: {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
      icon: <TrendingUp className="h-3 w-3 mr-1" />,
    },
  };
  const { className, icon } =
    config[urgency as keyof typeof config] || config.Routine;
  return (
    <Badge variant="outline" className={className}>
      {icon}
      {urgency}
    </Badge>
  );
}

export default function IPDDepartmentRequestsPage() {
  const router = useRouter();
  const [requests] = useState<DepartmentRequest[]>(DEPARTMENT_REQUESTS);
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [filterUrgency, setFilterUrgency] = useState<string>("All");
  const [filterDepartment, setFilterDepartment] = useState<string>("All");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const query = search.toLowerCase();
      const firstName = req.patient.firstName ?? "";
      const lastName = req.patient.lastName ?? "";
      const matchesSearch =
        !query ||
        `${firstName} ${lastName}`.toLowerCase().includes(query) ||
        req.department.toLowerCase().includes(query);
      const matchesUrgency =
        filterUrgency === "All" || req.urgency === filterUrgency;
      const matchesDepartment =
        filterDepartment === "All" || req.department === filterDepartment;
      return matchesSearch && matchesUrgency && matchesDepartment;
    });
  }, [requests, search, filterUrgency, filterDepartment]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      emergency: requests.filter((r) => r.urgency === "Emergency").length,
      urgent: requests.filter((r) => r.urgency === "Urgent").length,
      routine: requests.filter((r) => r.urgency === "Routine").length,
    };
  }, [requests]);

  function completeAdmission(requestId: string) {
    router.push(`/admission/ipd/new-registration?request=${requestId}`);
  }

  function handleResetFilters() {
    setSearch("");
    setFilterUrgency("All");
    setFilterDepartment("All");
  }

  const hasActiveFilters =
    search !== "" || filterUrgency !== "All" || filterDepartment !== "All";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Requests",
      value: String(stats.total),
      icon: Activity,
      accent: "blue",
      footer: "All departments",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Emergency",
      value: String(stats.emergency),
      icon: AlertTriangle,
      accent: "rose",
      footer: "Critical cases",
      trend: buildTrend(stats.emergency, previousDay.emergency),
    },
    {
      label: "Urgent",
      value: String(stats.urgent),
      icon: Clock,
      accent: "amber",
      footer: "Needs attention",
      trend: buildTrend(stats.urgent, previousDay.urgent),
    },
    {
      label: "Routine",
      value: String(stats.routine),
      icon: TrendingUp,
      accent: "emerald",
      footer: "Normal priority",
      trend: buildTrend(stats.routine, previousDay.routine),
    },
  ];

  const columns: OpsColumn<DepartmentRequest>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (req) => {
        const firstName = req.patient.firstName ?? "";
        const lastName = req.patient.lastName ?? "";
        const age = req.patient.age ?? 0;
        const gender = req.patient.gender ?? "N/A";
        const mobileNumber = req.patient.mobileNumber ?? "";
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {firstName[0] || "?"}
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {firstName} {lastName}
              </p>
              <p className="text-xs text-slate-400">
                Age: {age} · {gender} · {mobileNumber}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "department",
      header: "Department",
      cell: (req) => (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
          {req.department}
        </Badge>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      cell: (req) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle className="h-4 w-4 text-slate-400" />
          <span>{req.doctor.name}</span>
        </div>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      cell: (req) => <UrgencyBadge urgency={req.urgency} />,
    },
    {
      key: "requestedAt",
      header: "Requested At",
      cell: (req) => (
        <span className="text-sm text-slate-600">{req.requestedAt}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (req) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => completeAdmission(req.id)}
          className="border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Complete Admission
        </Button>
      ),
    },
  ];

  function renderCard(request: DepartmentRequest) {
    const firstName = request.patient.firstName ?? "";
    return (
      <OpsGridCard
        avatar={firstName[0] || "?"}
        title={`${request.patient.firstName} ${request.patient.lastName}`}
        subtitle={`${request.patient.age} yrs · ${request.patient.gender}`}
        badge={<UrgencyBadge urgency={request.urgency} />}
        stats={[
          { label: "Department", value: request.department },
          { label: "Doctor", value: request.doctor.name },
          { label: "Requested", value: request.requestedAt },
        ]}
        action={{
          label: "Complete Admission",
          icon: CheckCircle,
          onClick: () => completeAdmission(request.id),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Department Requests"
        description="Admission requests from Emergency, ICU & OPD"
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search by patient name or department..."
            canClear={hasActiveFilters}
            onClear={handleResetFilters}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filters={[
              {
                key: "urgency",
                label: "Urgency",
                placeholder: "All Urgency",
                selected: filterUrgency,
                options: [
                  { value: "All", label: "All Urgency" },
                  { value: "Emergency", label: "Emergency" },
                  { value: "Urgent", label: "Urgent" },
                  { value: "Routine", label: "Routine" },
                ],
              },
              {
                key: "department",
                label: "Department",
                placeholder: "All Departments",
                selected: filterDepartment,
                options: [
                  { value: "All", label: "All Departments" },
                  { value: "Emergency", label: "Emergency" },
                  { value: "ICU", label: "ICU" },
                  { value: "OPD", label: "OPD" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "urgency") setFilterUrgency(value);
              if (key === "department") setFilterDepartment(value);
            }}
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={filteredRequests}
            rowKey={(req) => req.id}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={filteredRequests}
            rowKey={(req) => req.id}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>
    </div>
  );
}


"use client";

import { useState } from "react";
import {
  Users, Clock, CheckCircle, Calendar,
  Eye, Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, OpsActionMenu, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import { getAllAppointments, type PatientFullProfile } from "@/lib/doctor/opd/opd-mock-data";
import { useRouter } from "next/navigation";

type ViewMode = "list" | "grid";
type StatusFilter = "all" | "waiting" | "checked-in" | "completed" | "scheduled";
type PatientTypeFilter = "all" | "new" | "follow-up";

const STATUS_BADGES: Record<string, string> = {
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  "checked-in": "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  scheduled: "bg-purple-50 text-purple-700 border-purple-200",
};

const previousDay = { total: 19, waiting: 5, checkedIn: 4, completed: 8, scheduled: 3 };

export default function DoctorOPDAppointmentsPage() {
  const router = useRouter();
  const [appointments] = useState<PatientFullProfile[]>(getAllAppointments());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [patientTypeFilter, setPatientTypeFilter] = useState<PatientTypeFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");


  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointmentNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesPatientType = patientTypeFilter === "all" || apt.patientType === patientTypeFilter;
    return matchesSearch && matchesStatus && matchesPatientType;
  });

  const stats = {
    total: appointments.length,
    waiting: appointments.filter((a) => a.status === "waiting").length,
    checkedIn: appointments.filter((a) => a.status === "checked-in").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    scheduled: appointments.filter((a) => a.status === "scheduled").length,
  };

  const isActive = searchQuery !== "" || statusFilter !== "all" || patientTypeFilter !== "all";

  function handleViewDetails(apt: PatientFullProfile) {
    router.push(`/doctor/opd/appointments/${apt.uhid}`);
  }

  function handleStartConsultation(apt: PatientFullProfile) {
    window.location.href = `/doctor/opd/consultation/${apt.uhid}`;
  }

  function getStatusBadge(status: string) {
    return STATUS_BADGES[status] || STATUS_BADGES.waiting;
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Queue", value: String(stats.total), icon: Users, accent: "blue", footer: "All appointments today", trend: buildTrend(stats.total, previousDay.total) },
    { label: "Waiting", value: String(stats.waiting), icon: Clock, accent: "amber", footer: "Awaiting consultation", trend: buildTrend(stats.waiting, previousDay.waiting) },
    { label: "Checked In", value: String(stats.checkedIn), icon: CheckCircle, accent: "indigo", footer: "Ready for doctor", trend: buildTrend(stats.checkedIn, previousDay.checkedIn) },
    { label: "Completed", value: String(stats.completed), icon: CheckCircle, accent: "emerald", footer: "Consultations done", trend: buildTrend(stats.completed, previousDay.completed) },
    { label: "Scheduled", value: String(stats.scheduled), icon: Calendar, accent: "violet", footer: "Upcoming today", trend: buildTrend(stats.scheduled, previousDay.scheduled) },
  ];

  const columns: OpsColumn<PatientFullProfile>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (apt) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
            {apt.patientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{apt.patientName}</p>
            <p className="text-xs text-slate-500">{apt.age} yrs &bull; {apt.gender}</p>
          </div>
        </div>
      ),
    },
    {
      key: "ids",
      header: "UHID / Appointment",
      cell: (apt) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{apt.uhid}</p>
          <p className="text-xs text-slate-500">{apt.appointmentNo}</p>
        </div>
      ),
    },
    {
      key: "time",
      header: "Time",
      cell: (apt) => <span className="text-sm text-slate-600">{apt.time}</span>,
    },
    {
      key: "type",
      header: "Type",
      cell: (apt) => (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 capitalize">
          {apt.patientType}
        </Badge>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      cell: (apt) => <span className="text-sm text-slate-600 truncate max-w-[200px] block">{apt.reason}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (apt) => <Badge className={getStatusBadge(apt.status)}>{apt.status.replace("-", " ")}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      enableHiding: false,
      cell: (apt) => (
        <OpsActionMenu
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => handleViewDetails(apt),
            },
            {
              label: apt.status === "checked-in" ? "Continue Consultation" : "Start Consultation",
              icon: Play,
              disabled: apt.status === "completed",
              onClick: () => handleStartConsultation(apt),
            },
          ]}
        />
      ),
    },
  ];

  function renderCard(apt: PatientFullProfile) {
    return (
      <OpsGridCard
        key={apt.id}
        avatar={apt.patientName.charAt(0).toUpperCase()}
        title={apt.patientName}
        subtitle={`${apt.age} yrs • ${apt.gender}`}
        badge={<Badge className={getStatusBadge(apt.status)}>{apt.status.replace("-", " ")}</Badge>}
        stats={[
          { label: "UHID", value: apt.uhid },
          { label: "Appointment", value: apt.appointmentNo },
          { label: "Time", value: apt.time },
          { label: "Type", value: apt.patientType },
        ]}
        action={{
          label: "View Details",
          icon: Eye,
          onClick: () => handleViewDetails(apt),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="OPD Appointment Queue"
        description="Review patients, record clinical notes, and complete consultations"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={searchQuery}
              onChange={() => {}}
              className="hidden"
            />
          </div>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search patient, UHID, or appointment..."
            canClear={isActive}
            onClear={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPatientTypeFilter("all");
            }}
            viewSupported
            viewMode={viewMode}
            onViewChange={setViewMode}
            filters={[
              {
                key: "status",
                label: "Filter by status",
                selected: statusFilter,
                options: [
                  { value: "all", label: "All Status" },
                  { value: "waiting", label: "Waiting" },
                  { value: "checked-in", label: "Checked In" },
                  { value: "completed", label: "Completed" },
                  { value: "scheduled", label: "Scheduled" },
                ],
              },
              {
                key: "patientType",
                label: "Patient type",
                selected: patientTypeFilter,
                options: [
                  { value: "all", label: "All Patients" },
                  { value: "new", label: "New Visit" },
                  { value: "follow-up", label: "Follow-up" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "status") setStatusFilter(value as StatusFilter);
              if (key === "patientType") setPatientTypeFilter(value as PatientTypeFilter);
            }}
          />
        </div>

        {viewMode === "list" ? (
          <div className="min-w-0 w-full">
            <OpsTable
              data={filteredAppointments}
              rowKey={(apt) => apt.id}
              columns={columns}
              showColumnToggle
            />
          </div>
        ) : (
          <OpsGrid
            data={filteredAppointments}
            rowKey={(apt) => apt.id}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>
    </div>
  );
}


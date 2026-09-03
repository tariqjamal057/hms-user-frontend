"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  Stethoscope,
  UserCheck,
  Calendar,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  Appointment,
  AppointmentFilters,
} from "@/types/admission-desk/opd/appointment-types";
import {
  APPOINTMENTS,
  SPECIALTIES,
  getEffectiveStatus,
} from "@/lib/admission-desk/opd/appointment-data";
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
import { AppointmentDetailDrawer } from "../appointments/_components/appointment-detail-drawer";
import { RescheduleAppointmentDrawer } from "../appointments/_components/reschedule-appointment-drawer";
import { StatusBadge } from "../appointments/_components/appointment-detail-drawer";

type ViewMode = "list" | "grid";

const previousDay = {
  total: 28,
  waiting: 3,
  checkedIn: 8,
  completed: 12,
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatAppointmentDate(date: string) {
  if (!date) return "—";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTypeStyle(type: Appointment["appointmentType"]) {
  return type === "New Registration"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-violet-200 bg-violet-50 text-violet-700";
}

export default function TodaysAppointmentsPage() {
  const today = getTodayDate();

  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [view, setView] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<Omit<AppointmentFilters, "date">>({
    search: "",
    type: "All",
    status: "All",
    specialty: "All",
    doctorId: "All",
  });

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState<Appointment | null>(null);

  const todayAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.appointmentDate === today,
    );
  }, [appointments, today]);

  const visibleAppointments = useMemo(() => {
    const searchQuery = filters.search.trim().toLowerCase();
    return todayAppointments.filter((appointment) => {
      const effectiveStatus = getEffectiveStatus(appointment);
      const searchableText = [
        appointment.id,
        appointment.patient.uhid,
        appointment.patient.firstName,
        appointment.patient.middleName ?? "",
        appointment.patient.lastName,
        appointment.patient.mobile,
        appointment.doctor.name,
        appointment.specialty,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchQuery || searchableText.includes(searchQuery);
      const matchesType =
        filters.type === "All" || appointment.appointmentType === filters.type;
      const matchesStatus =
        filters.status === "All" || effectiveStatus === filters.status;
      const matchesSpecialty =
        filters.specialty === "All" ||
        appointment.specialty === filters.specialty;
      const matchesDoctor =
        filters.doctorId === "All" ||
        appointment.doctor.id === filters.doctorId;
      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesSpecialty &&
        matchesDoctor
      );
    });
  }, [todayAppointments, filters]);

  const stats = useMemo(() => {
    const waiting = todayAppointments.filter(
      (a) => getEffectiveStatus(a) === "Waiting",
    ).length;
    const checkedIn = todayAppointments.filter(
      (a) => getEffectiveStatus(a) === "Checked In",
    ).length;
    const completed = todayAppointments.filter(
      (a) => getEffectiveStatus(a) === "Completed",
    ).length;
    const remaining = todayAppointments.filter((a) => {
      const status = getEffectiveStatus(a);
      return status === "Booked" || status === "Waiting";
    }).length;
    return { total: todayAppointments.length, waiting, checkedIn, completed, remaining };
  }, [todayAppointments]);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "All" ||
    filters.status !== "All" ||
    filters.specialty !== "All" ||
    filters.doctorId !== "All";

  function updateFilter<K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      type: "All",
      status: "All",
      specialty: "All",
      doctorId: "All",
    });
  }

  function handleReschedule(
    appointmentId: string,
    newDate: string,
    newSlot: Appointment["slot"],
  ) {
    setAppointments((previous) =>
      previous.map((appointment) => {
        if (appointment.id !== appointmentId) return appointment;
        return {
          ...appointment,
          appointmentDate: newDate,
          slot: newSlot,
          status: "Rescheduled",
          rescheduledFrom: {
            date: appointment.appointmentDate,
            slot: appointment.slot.period,
          },
          reason: "Rescheduled by admission desk",
        };
      }),
    );
    setRescheduleAppointment(null);
    toast.success(
      "Appointment rescheduled successfully. It has been moved from today's queue.",
    );
  }

  const formattedToday = new Date(`${today}T12:00:00`).toLocaleDateString(
    "en-IN",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  const infoCards: KpiCardProps[] = [
    {
      label: "Today's Appointments",
      value: String(stats.total),
      icon: CalendarDays,
      accent: "blue",
      footer: "Scheduled",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Waiting Patients",
      value: String(stats.waiting),
      icon: Clock3,
      accent: "amber",
      footer: "Need check-in",
      trend: buildTrend(stats.waiting, previousDay.waiting),
    },
    {
      label: "Checked In",
      value: String(stats.checkedIn),
      icon: UserCheck,
      accent: "violet",
      footer: "In queue",
      trend: buildTrend(stats.checkedIn, previousDay.checkedIn),
    },
    {
      label: "Completed",
      value: String(stats.completed),
      icon: CheckCircle2,
      accent: "emerald",
      footer: "Consulted",
      trend: buildTrend(stats.completed, previousDay.completed),
    },
  ];

  const columns: OpsColumn<Appointment>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (a) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
            {a.patient.firstName[0]}
            {a.patient.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              {a.patient.firstName} {a.patient.lastName}
            </p>
            <p className="text-xs text-slate-400">
              {a.patient.age} yrs · {a.patient.gender}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "ids",
      header: "UHID / Appointment",
      cell: (a) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{a.patient.uhid}</p>
          <p className="text-xs text-slate-400">{a.id}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (a) => (
        <span className="text-sm text-slate-600">{a.appointmentType}</span>
      ),
    },
    {
      key: "doctor",
      header: "Doctor / Specialty",
      cell: (a) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{a.doctor.name}</p>
          <p className="text-xs text-slate-400">{a.specialty}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Slot",
      cell: (a) => (
        <div>
          <span className="text-sm text-slate-600">{a.slot.period}</span>
          <p className="text-xs text-slate-400">{a.slot.startTime}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (a) => <StatusBadge status={getEffectiveStatus(a)} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (a) => {
        const status = getEffectiveStatus(a);
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAppointment(a)}
            >
              <Eye className="mr-1 h-4 w-4" /> View
            </Button>
            {["Booked", "Waiting"].includes(status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleAppointment(a)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Reschedule
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  function renderCard(a: Appointment) {
    const status = getEffectiveStatus(a);
    const canReschedule = status === "Booked" || status === "Waiting";

    return (
      <OpsGridCard
        avatar={`${a.patient.firstName.charAt(0)}${a.patient.lastName.charAt(0)}`}
        title={`${a.patient.firstName} ${a.patient.lastName}`}
        subtitle={a.patient.uhid}
        badge={<StatusBadge status={status} />}
        context={
          <p className="text-sm font-semibold text-slate-700">{a.doctor.name} · {a.specialty}</p>
        }
        stats={[
          { label: "Appointment Date", value: formatAppointmentDate(a.appointmentDate) },
          { label: "Consultation Slot", value: a.slot.period },
          { label: "Paid Amount", value: `₹${a.totalAmount.toLocaleString("en-IN")}` },
          { label: "Payment", value: a.paymentMethod },
        ]}
        footerTags={
          <Badge variant="outline" className={getTypeStyle(a.appointmentType)}>
            <UserPlus className="mr-1 h-3 w-3" />
            {a.appointmentType}
          </Badge>
        }
        action={{
          label: "View Details",
          icon: Eye,
          onClick: () => setSelectedAppointment(a),
        }}
      >
        {canReschedule && (
          <Button
            variant="outline"
            className="mt-2 w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={() => setRescheduleAppointment(a)}
          >
            <RefreshCw className="h-4 w-4" />
            Reschedule
          </Button>
        )}
      </OpsGridCard>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Today's OPD Appointments"
        description={`${formattedToday} · Monitor and manage today's patient consultation queue.`}
        meta={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Live Queue
          </span>
        }
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            <Clock3 className="h-4 w-4" />
            {stats.remaining} pending consultation
            {stats.remaining !== 1 ? "s" : ""}
          </div>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            onSearch={(v) => updateFilter("search", v)}
            searchPlaceholder="Search patient, UHID, mobile or appointment ID..."
            canClear={hasActiveFilters}
            onClear={resetFilters}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filters={[
              {
                key: "type",
                label: "Patient type",
                placeholder: "All Types",
                selected: filters.type,
                options: [
                  { value: "All", label: "All Types" },
                  { value: "New Registration", label: "New Registration" },
                  { value: "Follow-up", label: "Follow-up" },
                ],
              },
              {
                key: "status",
                label: "Status",
                placeholder: "All Status",
                selected: filters.status,
                options: [
                  { value: "All", label: "All Status" },
                  { value: "Booked", label: "Booked" },
                  { value: "Waiting", label: "Waiting" },
                  { value: "Checked In", label: "Checked In" },
                  { value: "Completed", label: "Completed" },
                  { value: "Rescheduled", label: "Rescheduled" },
                ],
              },
              {
                key: "specialty",
                label: "Specialty",
                placeholder: "All Specialties",
                selected: filters.specialty,
                options: [
                  { value: "All", label: "All Specialties" },
                  ...SPECIALTIES.map((s) => ({ value: s.name, label: s.name })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "type") updateFilter("type", value as typeof filters.type);
              if (key === "status") updateFilter("status", value as typeof filters.status);
              if (key === "specialty") updateFilter("specialty", value);
            }}
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={visibleAppointments}
            rowKey={(a) => a.id}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={visibleAppointments}
            rowKey={(a) => a.id}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>

      <AppointmentDetailDrawer
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
      <RescheduleAppointmentDrawer
        appointment={rescheduleAppointment}
        onClose={() => setRescheduleAppointment(null)}
        onConfirm={(newDate, newSlot) => {
          if (!rescheduleAppointment) return;
          handleReschedule(rescheduleAppointment.id, newDate, newSlot);
        }}
      />
    </div>
  );
}


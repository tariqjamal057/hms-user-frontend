"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  IndianRupee,
  Plus,
  Users,
  UserPlus,
  Eye,
  RefreshCw,
  Stethoscope,
  Clock3,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  OpsGrid,
  OpsGridCard,
  OpsActionMenu,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import {
  APPOINTMENTS,
  SPECIALTIES,
  getEffectiveStatus,
} from "@/lib/admission-desk/opd/appointment-data";
import type {
  Appointment,
  AppointmentFilters,
} from "@/types/admission-desk/opd/appointment-types";
import { AppointmentDetailDrawer } from "./_components/appointment-detail-drawer";
import { RescheduleAppointmentDrawer } from "./_components/reschedule-appointment-drawer";
import { toast } from "sonner";
import { StatusBadge } from "./_components/appointment-detail-drawer";

type ViewMode = "list" | "grid";

const previousDay = {
  income: 178000,
  total: 38,
  monthNew: 18,
  monthFollow: 14,
};

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

export default function AllAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [view, setView] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<AppointmentFilters>({
    search: "",
    type: "All",
    status: "All",
    specialty: "All",
    doctorId: "All",
    date: "",
  });
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);

  const visible = useMemo(
    () =>
      appointments.filter((a) => {
        const status = getEffectiveStatus(a);
        const q = filters.search.toLowerCase();
        return (
          (!q ||
            [
              a.id,
              a.patient.uhid,
              a.patient.firstName,
              a.patient.lastName,
              a.patient.mobile,
            ]
              .join(" ")
              .toLowerCase()
              .includes(q)) &&
          (filters.type === "All" || a.appointmentType === filters.type) &&
          (filters.status === "All" || status === filters.status) &&
          (filters.specialty === "All" || a.specialty === filters.specialty) &&
          (filters.doctorId === "All" || a.doctor.id === filters.doctorId) &&
          (!filters.date || a.appointmentDate === filters.date)
        );
      }),
    [appointments, filters],
  );

  const income = appointments.reduce(
    (sum, appointment) => sum + appointment.totalAmount,
    0,
  );

  const monthNew = appointments.filter(
    (a) => a.appointmentType === "New Registration",
  ).length;

  const monthFollow = appointments.filter(
    (a) => a.appointmentType === "Follow-up",
  ).length;

  function update<K extends keyof AppointmentFilters>(
    key: K,
    value: AppointmentFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function handleResetAll() {
    setFilters({
      search: "",
      type: "All",
      status: "All",
      specialty: "All",
      doctorId: "All",
      date: "",
    });
  }

  function reschedule(date: string, slot: Appointment["slot"]) {
    if (!rescheduling) return;
    setAppointments((previous) =>
      previous.map((a) =>
        a.id === rescheduling.id
          ? {
              ...a,
              rescheduledFrom: { date: a.appointmentDate, slot: a.slot.period },
              appointmentDate: date,
              slot,
              status: "Rescheduled",
            }
          : a,
      ),
    );
    toast.success("Appointment rescheduled successfully");
    setRescheduling(null);
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "All" ||
    filters.status !== "All" ||
    filters.specialty !== "All" ||
    filters.doctorId !== "All" ||
    filters.date !== "";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Income",
      value: `₹${income.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      accent: "blue",
      footer: "Collected",
      trend: buildTrend(income, previousDay.income),
    },
    {
      label: "Total OPD Patients",
      value: String(appointments.length),
      icon: Users,
      accent: "violet",
      footer: "Registered",
      trend: buildTrend(appointments.length, previousDay.total),
    },
    {
      label: "This Month New Registration",
      value: String(monthNew),
      icon: UserPlus,
      accent: "emerald",
      footer: "New patients",
      trend: buildTrend(monthNew, previousDay.monthNew),
    },
    {
      label: "This Month Follow Up",
      value: String(monthFollow),
      icon: CalendarDays,
      accent: "amber",
      footer: "Returning",
      trend: buildTrend(monthFollow, previousDay.monthFollow),
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
      header: "Date & Slot",
      cell: (a) => (
        <div>
          <span className="text-sm text-slate-600">{a.appointmentDate}</span>
          <p className="text-xs text-slate-400">
            {a.slot.period}: {a.slot.startTime}
          </p>
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
          <div className="flex justify-end">
            <OpsActionMenu
              items={[
                {
                  label: "View",
                  icon: Eye,
                  onClick: () => setDetail(a),
                },
                ...(status === "Booked" || status === "Waiting"
                  ? [
                      {
                        label: "Reschedule",
                        icon: RefreshCw,
                        onClick: () => setRescheduling(a),
                      } as const,
                    ]
                  : []),
              ]}
            />
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
          onClick: () => setDetail(a),
        }}
      >
        {canReschedule && (
          <Button
            variant="outline"
            className="mt-2 w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={() => setRescheduling(a)}
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
        title="All OPD Appointments"
        description="Manage patient registrations, consultations, bookings, and reschedules."
        actions={
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/admission/opd/book-appointments")}
          >
            <Plus className="h-4 w-4" /> Book Consultation
          </Button>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={filters.search}
            onSearch={(v) => update("search", v)}
            searchPlaceholder="Search name, UHID, mobile or appointment ID"
            canClear={hasActiveFilters}
            onClear={handleResetAll}
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
              if (key === "type") update("type", value as AppointmentFilters["type"]);
              if (key === "status") update("status", value as AppointmentFilters["status"]);
              if (key === "specialty") update("specialty", value);
            }}
            extra={
              <input
                type="date"
                value={filters.date}
                onChange={(e) => update("date", e.target.value)}
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
              />
            }
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={visible}
            rowKey={(a) => a.id}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={visible}
            rowKey={(a) => a.id}
            renderCard={renderCard}
            pageSize={6}
          />
        )}

        <AppointmentDetailDrawer
          appointment={detail}
          onClose={() => setDetail(null)}
        />
        <RescheduleAppointmentDrawer
          appointment={rescheduling}
          onClose={() => setRescheduling(null)}
          onConfirm={reschedule}
        />
      </main>
    </div>
  );
}


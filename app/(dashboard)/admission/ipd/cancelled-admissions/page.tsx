"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FileX,
  CalendarX,
  UserX,
  ShieldOff,
  MoreHorizontal,
} from "lucide-react";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import { CancelDetailPanel } from "./_components/cancel-detail-panel";
import { CancelStatusBadge } from "./_components/cancel-status-badge";

import {
  CANCELLED_ADMISSIONS,
  CANCEL_DEPARTMENTS,
  CANCEL_REASONS,
} from "@/lib/cancel-admission-data";
import type { CancelledAdmissionRecord } from "@/types/cancel-admission-types";
import { Button } from "@/components/ui/button";

const previousDay = {
  total: 28,
  today: 1,
  byPatient: 12,
  byStaff: 6,
  byOthers: 2,
};

export default function CancelAdmissionPage() {
  const [department, setDepartment] = useState("all");
  const [reason, setReason] = useState("all");
  const [cancelledBy, setCancelledBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<CancelledAdmissionRecord | null>(
    CANCELLED_ADMISSIONS[0],
  );

  const filtered = useMemo(() => {
    return CANCELLED_ADMISSIONS.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requestId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = department === "all" || r.department === department;
      const matchesReason = reason === "all" || r.reason === reason;
      const matchesCancelledBy =
        cancelledBy === "all" || r.cancelledBy === cancelledBy;
      return (
        matchesSearch && matchesDept && matchesReason && matchesCancelledBy
      );
    });
  }, [searchQuery, department, reason, cancelledBy]);

  const stats = useMemo(() => {
    const total = CANCELLED_ADMISSIONS.length;
    const byPatient = CANCELLED_ADMISSIONS.filter(
      (r) => r.cancelledBy === "Patient/Family",
    ).length;
    const byStaff = CANCELLED_ADMISSIONS.filter(
      (r) => r.cancelledBy === "Admission Desk",
    ).length;
    const byOthers = CANCELLED_ADMISSIONS.filter(
      (r) => r.cancelledBy === "Others",
    ).length;
    return {
      total,
      today: 3,
      byPatient,
      byPatientPct: ((byPatient / total) * 100).toFixed(2),
      byStaff,
      byStaffPct: ((byStaff / total) * 100).toFixed(2),
      byOthers,
      byOthersPct: ((byOthers / total) * 100).toFixed(2),
    };
  }, []);

  function handleExport() {
    console.log("Exporting", filtered.length, "cancelled admissions");
    toast.success("Exporting cancelled admissions...");
  }

  function handleResetFilters() {
    setSearchQuery("");
    setDepartment("all");
    setReason("all");
    setCancelledBy("all");
  }

  const hasActiveFilters =
    searchQuery !== "" ||
    department !== "all" ||
    reason !== "all" ||
    cancelledBy !== "all";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Cancelled",
      value: String(stats.total),
      icon: FileX,
      accent: "blue",
      footer: "All Time",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Cancelled Today",
      value: String(stats.today),
      icon: CalendarX,
      accent: "rose",
      footer: "20 May 2024",
      trend: buildTrend(stats.today, previousDay.today),
    },
    {
      label: "By Patient/Family",
      value: String(stats.byPatient),
      icon: UserX,
      accent: "amber",
      footer: `${stats.byPatientPct}%`,
      trend: buildTrend(stats.byPatient, previousDay.byPatient),
    },
    {
      label: "By Staff",
      value: String(stats.byStaff),
      icon: ShieldOff,
      accent: "violet",
      footer: `${stats.byStaffPct}%`,
      trend: buildTrend(stats.byStaff, previousDay.byStaff),
    },
    {
      label: "By Others",
      value: String(stats.byOthers),
      icon: MoreHorizontal,
      accent: "emerald",
      footer: `${stats.byOthersPct}%`,
      trend: buildTrend(stats.byOthers, previousDay.byOthers),
    },
  ];

  const cancelledByOptions = useMemo(() => {
    const set = new Set(CANCELLED_ADMISSIONS.map((r) => r.cancelledBy));
    return Array.from(set).sort();
  }, []);

  const columns: OpsColumn<CancelledAdmissionRecord>[] = [
    {
      key: "requestId",
      header: "Request ID",
      cell: (r) => (
        <div>
          <p className="text-sm font-semibold text-blue-600">{r.requestId}</p>
          <p className="text-xs text-slate-400">{r.uhid}</p>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Patient Details",
      cell: (r) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{r.patientName}</p>
          <p className="text-xs text-slate-400">
            {r.age} Y / {r.gender}
          </p>
          <p className="text-xs text-slate-400">{r.mobile}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (r) => <span className="text-sm text-slate-600">{r.department}</span>,
    },
    {
      key: "cancelledOn",
      header: "Cancelled On",
      cell: (r) => (
        <div>
          <p className="text-sm text-slate-700">
            {r.cancelledOnDateTime.split(",")[0]}
          </p>
          <p className="text-xs text-slate-400">
            {r.cancelledOnDateTime.split(",")[1]}
          </p>
        </div>
      ),
    },
    {
      key: "cancelledBy",
      header: "Cancelled By",
      cell: (r) => (
        <div>
          <p className="text-sm text-slate-700">{r.cancelledBy}</p>
          <p className="text-xs text-slate-400">{r.cancelledByName}</p>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      cell: (r) => <span className="text-sm text-slate-600">{r.reason}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <CancelStatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Cancelled Admissions"
        description="Overview of cancelled admissions, reasons, and responsible parties."
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search patient name, UHID, or request ID..."
            canClear={hasActiveFilters}
            onClear={handleResetFilters}
            filters={[
              {
                key: "department",
                label: "Department",
                placeholder: "All Departments",
                selected: department,
                options: [
                  { value: "all", label: "All Departments" },
                  ...CANCEL_DEPARTMENTS.map((d) => ({ value: d, label: d })),
                ],
              },
              {
                key: "reason",
                label: "Reason",
                placeholder: "All Reasons",
                selected: reason,
                options: [
                  { value: "all", label: "All Reasons" },
                  ...CANCEL_REASONS.map((r) => ({ value: r, label: r })),
                ],
              },
              {
                key: "cancelledBy",
                label: "Cancelled By",
                placeholder: "All",
                selected: cancelledBy,
                options: [
                  { value: "all", label: "All" },
                  ...cancelledByOptions.map((c) => ({ value: c, label: c })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "department") setDepartment(value);
              if (key === "reason") setReason(value);
              if (key === "cancelledBy") setCancelledBy(value);
            }}
            extra={
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                Export
              </Button>
            }
          />
        </div>

        {/* Master-detail layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          <OpsTable
            data={filtered}
            rowKey={(r) => r.requestId}
            columns={columns}
           
            onRowClick={(r) => setSelected(r)}
          />

          <CancelDetailPanel record={selected} />
        </div>
      </main>
    </div>
  );
}


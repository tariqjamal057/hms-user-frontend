"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BedDouble,
  CheckCircle2,
  Bed,
  Wrench,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import { AvailabilityOverviewChart } from "./_components/availability-overview-chart";
import { QuickInfoPanel } from "./_components/quick-info-panel";
import { AvailabilityStatusBadge, getAvailabilityStatus } from "./_components/availability-status-badge";
import { BED_AVAILABILITY, DEPARTMENT_ICONS } from "@/lib/bed-availability-data";
import type { DepartmentBedAvailability } from "@/types/bed-availability-types";

const previousDay = {
  totalBeds: 155,
  available: 42,
  occupied: 98,
  blocked: 15,
};

function progressBarColor(pct: number) {
  if (pct >= 20) return "bg-emerald-500";
  if (pct >= 10) return "bg-amber-500";
  return "bg-red-500";
}

export default function BedAvailabilityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [wardType, setWardType] = useState("all");
  const [floor, setFloor] = useState("all");
  const [bedType, setBedType] = useState("all");
  const [status, setStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const departments = useMemo(
    () => Array.from(new Set(BED_AVAILABILITY.map((r) => r.department))),
    [],
  );
  const wardTypes = useMemo(
    () => Array.from(new Set(BED_AVAILABILITY.map((r) => r.wardUnit))),
    [],
  );
  const floors = useMemo(
    () => Array.from(new Set(BED_AVAILABILITY.map((r) => r.floor))),
    [],
  );
  const bedTypes = useMemo(
    () => Array.from(new Set(BED_AVAILABILITY.map((r) => r.bedType))),
    [],
  );

  const filtered = useMemo(() => {
    return BED_AVAILABILITY.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.wardUnit.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = department === "all" || r.department === department;
      const matchesWard = wardType === "all" || r.wardUnit === wardType;
      const matchesFloor = floor === "all" || r.floor === floor;
      const matchesBedType = bedType === "all" || r.bedType === bedType;
      const pct = r.totalBeds ? (r.available / r.totalBeds) * 100 : 0;
      const matchesStatus =
        status === "all" || getAvailabilityStatus(pct) === status;
      return (
        matchesSearch &&
        matchesDept &&
        matchesWard &&
        matchesFloor &&
        matchesBedType &&
        matchesStatus
      );
    });
  }, [searchQuery, department, wardType, floor, bedType, status]);

  const totals = useMemo(() => {
    return BED_AVAILABILITY.reduce(
      (acc, r) => ({
        totalBeds: acc.totalBeds + r.totalBeds,
        occupied: acc.occupied + r.occupied,
        available: acc.available + r.available,
        blocked: acc.blocked + r.blocked,
      }),
      { totalBeds: 0, occupied: 0, available: 0, blocked: 0 },
    );
  }, []);

  const availablePct = totals.totalBeds
    ? (totals.available / totals.totalBeds) * 100
    : 0;
  const occupiedPct = totals.totalBeds
    ? (totals.occupied / totals.totalBeds) * 100
    : 0;
  const blockedPct = totals.totalBeds
    ? (totals.blocked / totals.totalBeds) * 100
    : 0;

  function handleRefresh() {
    setRefreshing(true);
    console.log("Refreshing bed availability data...");
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Bed availability data refreshed");
    }, 800);
  }

  function handleExportExcel() {
    console.log("Exporting", filtered.length, "bed availability rows to Excel");
    toast.success("Exporting bed availability to Excel...");
  }

  function handleResetFilters() {
    setSearchQuery("");
    setDepartment("all");
    setWardType("all");
    setFloor("all");
    setBedType("all");
    setStatus("all");
  }

  function handleViewDetails(r: DepartmentBedAvailability) {
    console.log("View bed details for:", r.department, r.wardUnit);
    toast.info(`Opening bed-level details for ${r.department} - ${r.wardUnit}`);
  }

  const hasActiveFilters =
    searchQuery !== "" ||
    department !== "all" ||
    wardType !== "all" ||
    floor !== "all" ||
    bedType !== "all" ||
    status !== "all";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Beds",
      value: String(totals.totalBeds),
      icon: BedDouble,
      accent: "violet",
      footer: "All Departments",
      trend: buildTrend(totals.totalBeds, previousDay.totalBeds),
    },
    {
      label: "Available Beds",
      value: String(totals.available),
      icon: CheckCircle2,
      accent: "emerald",
      footer: `${availablePct.toFixed(2)}% Available`,
      trend: buildTrend(totals.available, previousDay.available),
    },
    {
      label: "Occupied Beds",
      value: String(totals.occupied),
      icon: Bed,
      accent: "amber",
      footer: `${occupiedPct.toFixed(2)}% Occupied`,
      trend: buildTrend(totals.occupied, previousDay.occupied),
    },
    {
      label: "Blocked / Maintenance",
      value: String(totals.blocked),
      icon: Wrench,
      accent: "rose",
      footer: `${blockedPct.toFixed(2)}% Blocked`,
      trend: buildTrend(totals.blocked, previousDay.blocked),
    },
  ];

  const columns: OpsColumn<DepartmentBedAvailability>[] = [
    {
      key: "department",
      header: "Department",
      cell: (r) => (
        <span className="flex items-center gap-2 font-medium text-slate-800">
          <span className="text-base">
            {DEPARTMENT_ICONS[r.department] ?? "🏨"}
          </span>
          {r.department}
        </span>
      ),
    },
    {
      key: "wardUnit",
      header: "Ward / Unit",
      hideOn: "md",
      cell: (r) => (
        <span className="text-slate-500">{r.wardUnit}</span>
      ),
    },
    {
      key: "floor",
      header: "Floor",
      hideOn: "md",
      cell: (r) => (
        <span className="whitespace-nowrap text-slate-500">{r.floor}</span>
      ),
    },
    {
      key: "bedType",
      header: "Bed Type",
      hideOn: "md",
      cell: (r) => <span className="text-slate-500">{r.bedType}</span>,
    },
    {
      key: "totalBeds",
      header: "Total Beds",
      headerClassName: "text-right",
      className: "text-right font-medium text-slate-700",
      hideOn: "lg",
      cell: (r) => <span>{r.totalBeds}</span>,
    },
    {
      key: "occupied",
      header: "Occupied",
      headerClassName: "text-right",
      className: "text-right text-slate-700",
      cell: (r) => <span>{r.occupied}</span>,
    },
    {
      key: "available",
      header: "Available",
      headerClassName: "text-right",
      className: "text-right font-semibold text-emerald-600",
      cell: (r) => <span>{r.available}</span>,
    },
    {
      key: "blocked",
      header: "Blocked",
      headerClassName: "text-right",
      className: "text-right text-slate-500",
      cell: (r) => <span>{r.blocked}</span>,
    },
    {
      key: "availability",
      header: "Availability %",
      cell: (r) => {
        const pct = r.totalBeds
          ? (r.available / r.totalBeds) * 100
          : 0;
        return (
          <div className="flex items-center gap-2">
            <Progress
              value={pct}
              className="h-1.5 w-20"
              indicatorClassName={progressBarColor(pct)}
            />
            <span className="w-12 shrink-0 text-xs font-medium text-slate-600">
              {pct.toFixed(2)}%
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const pct = r.totalBeds
          ? (r.available / r.totalBeds) * 100
          : 0;
        return <AvailabilityStatusBadge status={getAvailabilityStatus(pct)} />;
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (r) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-blue-600"
          onClick={() => handleViewDetails(r)}
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Bed Availability"
        description="Real-time overview of bed availability across departments and wards."
        actions={
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportExcel}
            >
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search department or ward..."
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
                  ...departments.map((d) => ({ value: d, label: d })),
                ],
              },
              {
                key: "wardType",
                label: "Ward / Unit",
                placeholder: "All Wards",
                selected: wardType,
                options: [
                  { value: "all", label: "All Wards" },
                  ...wardTypes.map((w) => ({ value: w, label: w })),
                ],
              },
              {
                key: "floor",
                label: "Floor",
                placeholder: "All Floors",
                selected: floor,
                options: [
                  { value: "all", label: "All Floors" },
                  ...floors.map((f) => ({ value: f, label: f })),
                ],
              },
              {
                key: "bedType",
                label: "Bed Type",
                placeholder: "All Types",
                selected: bedType,
                options: [
                  { value: "all", label: "All Types" },
                  ...bedTypes.map((b) => ({ value: b, label: b })),
                ],
              },
              {
                key: "status",
                label: "Status",
                placeholder: "All Statuses",
                selected: status,
                options: [
                  { value: "all", label: "All Statuses" },
                  { value: "Available", label: "Available" },
                  { value: "Limited", label: "Limited" },
                  { value: "Full", label: "Full" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "department") setDepartment(value);
              if (key === "wardType") setWardType(value);
              if (key === "floor") setFloor(value);
              if (key === "bedType") setBedType(value);
              if (key === "status") setStatus(value);
            }}
          />
        </div>

        {/* Main content: table + sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
          <OpsTable
            data={filtered}
            rowKey={(r) => `${r.department}-${r.wardUnit}`}
            columns={columns}
            pageSize={10}
            showColumnToggle
          />
          </div>

          <div className="space-y-6">
            <AvailabilityOverviewChart
              available={totals.available}
              occupied={totals.occupied}
              blocked={totals.blocked}
            />
            <QuickInfoPanel
              records={BED_AVAILABILITY}
              lastUpdated="20 May 2024, 11:30 AM"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

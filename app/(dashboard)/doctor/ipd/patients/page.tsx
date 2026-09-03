// app/doctor/ipd/patients/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Users, HeartPulse, Activity, AlertCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShellHeader, StatsRow, FilterBar, OpsTable, OpsGrid, OpsGridCard, buildTrend } from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import {
  getAllWardPatients, STATUS_OPTIONS,
} from "@/lib/doctor/ipd/ward-round-data";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import { useRouter } from "next/navigation";

type ViewMode = "list" | "grid";
type StatusFilter = "all" | WardRoundPatient["status"];
type WardFilter = "all" | string;
type RoomFilter = "all" | string;

function parseWardRoomBed(wardRoomBed: string) {
  const parts = wardRoomBed.split("/").map((s) => s.trim());
  return { ward: parts[0] || "", room: parts[1] || "", bed: parts[2] || "" };
}

const STATUS_BADGES: Record<string, string> = {
  Stable: "bg-green-50 text-green-700 border-green-200",
  "Under Observation": "bg-amber-50 text-amber-700 border-amber-200",
  Critical: "bg-red-50 text-red-700 border-red-200",
};

export default function MyIPDPatientsPage() {
  const router = useRouter();
  const [patients] = useState<WardRoundPatient[]>(getAllWardPatients());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [wardFilter, setWardFilter] = useState<WardFilter>("all");
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const wardOptions = useMemo(() => {
    const wards = new Set<string>();
    patients.forEach((p) => {
      const { ward } = parseWardRoomBed(p.wardRoomBed);
      if (ward) wards.add(ward);
    });
    return Array.from(wards).sort();
  }, [patients]);

  const roomOptions = useMemo(() => {
    const rooms = new Set<string>();
    patients.forEach((p) => {
      const { ward, room } = parseWardRoomBed(p.wardRoomBed);
      if (wardFilter === "all" || ward === wardFilter) {
        if (room) rooms.add(room);
      }
    });
    return Array.from(rooms).sort();
  }, [patients, wardFilter]);

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => {
        const matchesSearch =
          p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.ipdId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        const { ward, room } = parseWardRoomBed(p.wardRoomBed);
        const matchesWard = wardFilter === "all" || ward === wardFilter;
        const matchesRoom = roomFilter === "all" || room === roomFilter;
        return matchesSearch && matchesStatus && matchesWard && matchesRoom;
      }),
    [patients, searchQuery, statusFilter, wardFilter, roomFilter]
  );

  const stats = {
    total: patients.length,
    stable: patients.filter((p) => p.status === "Stable").length,
    observation: patients.filter((p) => p.status === "Under Observation").length,
    critical: patients.filter((p) => p.status === "Critical").length,
  };

  function getStatusBadge(status: string) {
    return STATUS_BADGES[status] || STATUS_BADGES.Stable;
  }

  function handleClinicalOverview(uhid: string) {
    router.push(`/doctor/ipd/clinical-overview/${uhid}`);
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Patients", value: String(stats.total), icon: Users, accent: "blue", footer: "All admitted patients", trend: buildTrend(stats.total, 6) },
    { label: "Stable", value: String(stats.stable), icon: HeartPulse, accent: "emerald", footer: "Stable condition", trend: buildTrend(stats.stable, 3) },
    { label: "Under Observation", value: String(stats.observation), icon: Activity, accent: "amber", footer: "Being monitored", trend: buildTrend(stats.observation, 2) },
    { label: "Critical", value: String(stats.critical), icon: AlertCircle, accent: "rose", footer: "Require attention", trend: buildTrend(stats.critical, 1) },
  ];

  const columns: OpsColumn<WardRoundPatient>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-semibold text-white shadow-md">
            {p.patientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{p.patientName}</p>
            <p className="text-xs text-slate-500">{p.age} yrs • {p.gender} • {p.bloodGroup}</p>
          </div>
        </div>
      ),
    },
    {
      key: "ids",
      header: "UHID / IPD ID",
      cell: (p) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{p.uhid}</p>
          <p className="text-xs text-slate-500">{p.ipdId}</p>
        </div>
      ),
    },
    {
      key: "ward",
      header: "Ward / Bed",
      cell: (p) => <span className="block max-w-[180px] truncate text-sm text-slate-600">{p.wardRoomBed}</span>,
    },
    {
      key: "diagnosis",
      header: "Diagnosis",
      cell: (p) => (
        <div>
          <p className="text-sm text-slate-700">{p.currentDiagnosis}</p>
          <p className="text-xs text-slate-500">{p.diagnosisCode}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => <Badge className={getStatusBadge(p.status)}>{p.status}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (p) => (
        <Button
          size="sm"
          onClick={() => handleClinicalOverview(p.uhid)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
        >
          <Eye className="mr-1.5 h-4 w-4" />
          Clinical Overview
        </Button>
      ),
    },
  ];

  function renderCard(p: WardRoundPatient) {
    return (
      <OpsGridCard
        avatar={p.patientName.charAt(0).toUpperCase()}
        title={p.patientName}
        subtitle={`${p.age} yrs • ${p.gender}`}
        badge={<Badge className={getStatusBadge(p.status)}>{p.status}</Badge>}
        footerTags={
          <>
            <Badge variant="outline" className="border-slate-200 text-slate-600">UHID · {p.uhid}</Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-600">IPD · {p.ipdId}</Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-600">{p.wardRoomBed}</Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-600">{p.daysAdmitted}d</Badge>
          </>
        }
        action={{
          label: "Clinical Overview",
          icon: Eye,
          onClick: () => handleClinicalOverview(p.uhid),
        }}
      >
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">Diagnosis</p>
          <p className="text-sm font-semibold text-slate-800">{p.currentDiagnosis}</p>
          <p className="text-xs text-slate-400">{p.diagnosisCode}</p>
        </div>
      </OpsGridCard>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="My IPD Patients"
        description="Manage and review all admitted patients under your care"
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="mb-6 mt-6">
          <FilterBar
            search={searchQuery}
            searchPlaceholder="Search patient, UHID, or IPD ID..."
            onSearch={setSearchQuery}
            canClear={searchQuery !== ""}
            onClear={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setWardFilter("all");
              setRoomFilter("all");
            }}
            viewSupported
            viewMode={viewMode}
            onViewChange={setViewMode}
            filters={[
              {
                key: "status",
                label: "Filter by status",
                placeholder: "All Status",
                selected: statusFilter,
                options: [
                  { value: "all", label: "All Status" },
                  ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
                ],
              },
              {
                key: "ward",
                label: "Filter by ward",
                placeholder: "All Wards",
                selected: wardFilter,
                options: [{ value: "all", label: "All Wards" }, ...wardOptions.map((w) => ({ value: w, label: w }))],
              },
              {
                key: "room",
                label: "Filter by room",
                placeholder: "All Rooms",
                selected: roomFilter,
                options: [{ value: "all", label: "All Rooms" }, ...roomOptions.map((r) => ({ value: r, label: r }))],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "status") setStatusFilter(value as StatusFilter);
              if (key === "ward") {
                setWardFilter(value);
                setRoomFilter("all");
              }
              if (key === "room") setRoomFilter(value);
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
    </div>
  );
}

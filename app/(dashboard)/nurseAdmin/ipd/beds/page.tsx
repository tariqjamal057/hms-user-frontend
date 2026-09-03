// app/(dashboard)/nurse-admin/ipd/beds/page.tsx
"use client";
import { useMemo, useState } from "react";
import { BedDouble, CheckCircle2, Users, Wrench } from "lucide-react";
import { PageShellHeader, StatsRow, FilterBar, buildTrend } from "@/components/operations";
import { KpiCardProps } from "@/components/dashboard";
import type { WardPatientFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { ALL_WARDS, BEDS, WARD_PATIENTS_FULL } from "@/lib/nurse-admin/ipd/ward-detail-data";
import { BedLegend } from "./_components/bed-legend";
import { WardBedGroup } from "./_components/ward-bed-group";
import { PatientDetailDrawer } from "../all-ward-patients/_components/drawer/patient-detail-drawer";

const previousDay = { total: 48, available: 12, occupied: 30, maintenance: 6 };

export default function BedsPage() {
  const [patients, setPatients] = useState<WardPatientFull[]>(WARD_PATIENTS_FULL);
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingPatient, setViewingPatient] = useState<WardPatientFull | null>(null);

  const patientsByUhid = useMemo(() => new Map(patients.map((p) => [p.uhid, p])), [patients]);

  const availableRooms = useMemo(() => {
    if (wardFilter === "All") return Array.from(new Set(BEDS.map((b) => b.room)));
    return Array.from(new Set(BEDS.filter((b) => b.ward === wardFilter).map((b) => b.room)));
  }, [wardFilter]);

  const filteredBeds = useMemo(() => BEDS.filter((bed) => {
    const query = searchQuery.trim().toLowerCase();
    const patient = bed.patientUhid ? patientsByUhid.get(bed.patientUhid) : undefined;
    const matchesSearch = !query || [bed.bedLabel, patient?.patientName ?? ""].join(" ").toLowerCase().includes(query);
    const matchesWard = wardFilter === "All" || bed.ward === wardFilter;
    const matchesRoom = roomFilter === "All" || bed.room === roomFilter;
    const matchesStatus = statusFilter === "All" || bed.status === statusFilter;
    return matchesSearch && matchesWard && matchesRoom && matchesStatus;
  }), [searchQuery, wardFilter, roomFilter, statusFilter, patientsByUhid]);

  const stats = useMemo(() => ({
    total: BEDS.length,
    available: BEDS.filter((b) => b.status === "Available").length,
    occupied: BEDS.filter((b) => b.status === "Occupied").length,
    maintenance: BEDS.filter((b) => b.status === "Maintenance").length,
  }), []);

  function handlePatientUpdate(updated: WardPatientFull) {
    setPatients((previous) => previous.map((p) => p.uhid === updated.uhid ? updated : p));
    setViewingPatient(updated);
  }

  const infoCards: KpiCardProps[] = [
    { label: "Total Beds", value: String(stats.total), icon: BedDouble, accent: "blue", footer: "Across all wards", trend: buildTrend(stats.total, previousDay.total) },
    { label: "Available", value: String(stats.available), icon: CheckCircle2, accent: "emerald", footer: "Ready for new booking", trend: buildTrend(stats.available, previousDay.available) },
    { label: "Occupied", value: String(stats.occupied), icon: Users, accent: "amber", footer: "Currently in use", trend: buildTrend(stats.occupied, previousDay.occupied) },
    { label: "Maintenance", value: String(stats.maintenance), icon: Wrench, accent: "slate", footer: "Temporarily unavailable", trend: buildTrend(stats.maintenance, previousDay.maintenance) },
  ];

  const wardsToRender = wardFilter === "All" ? ALL_WARDS : [wardFilter];

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Bed Availability"
        description="Live occupancy map across all wards and rooms — hover a bed for patient info, click to view full details."
        meta={<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Ward & Room View</span>}
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            searchPlaceholder="Bed ID or patient name..."
            onSearch={setSearchQuery}
            canClear={searchQuery !== "" || wardFilter !== "All" || roomFilter !== "All" || statusFilter !== "All"}
            onClear={() => { setSearchQuery(""); setWardFilter("All"); setRoomFilter("All"); setStatusFilter("All"); }}
            filters={[
              {
                key: "ward",
                label: "Filter by ward",
                placeholder: "All Wards",
                selected: wardFilter,
                options: [{ value: "All", label: "All Wards" }, ...ALL_WARDS.map((w) => ({ value: w, label: w }))],
              },
              {
                key: "room",
                label: "Filter by room",
                placeholder: "All Rooms",
                selected: roomFilter,
                options: [{ value: "All", label: "All Rooms" }, ...availableRooms.map((r) => ({ value: r, label: r }))],
              },
              {
                key: "status",
                label: "Filter by status",
                placeholder: "All Statuses",
                selected: statusFilter,
                options: [
                  { value: "All", label: "All Statuses" },
                  { value: "Available", label: "Available" },
                  { value: "Occupied", label: "Occupied" },
                  { value: "Reserved", label: "Reserved" },
                  { value: "Maintenance", label: "Maintenance" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "ward") { setWardFilter(value); setRoomFilter("All"); }
              if (key === "room") setRoomFilter(value);
              if (key === "status") setStatusFilter(value);
            }}
          />
        </div>

        <BedLegend />

        <div className="mt-6 space-y-6">
          {wardsToRender.map((ward) => {
            const bedsInWard = filteredBeds.filter((b) => b.ward === ward);
            if (bedsInWard.length === 0) return null;
            return <WardBedGroup key={ward} ward={ward} beds={bedsInWard} patientsByUhid={patientsByUhid} onOpenPatient={setViewingPatient} />;
          })}
          {filteredBeds.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center text-sm text-slate-400">No beds match the selected filters.</div>
          )}
        </div>
      </main>

      <PatientDetailDrawer patient={viewingPatient} onClose={() => setViewingPatient(null)} onPatientUpdate={handlePatientUpdate} />
    </div>
  );
}


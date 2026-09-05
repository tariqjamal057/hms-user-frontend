// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-fluid-balance.tsx
"use client";
import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Calculator, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import type { FluidBalanceFull } from "@/types/nurse-admin/ipd/ward-detail-types";
import { DateFilterBar } from "./date-filter-bar";
import { SectionHeader } from "./section-header";

export function SectionFluidBalance({ entries }: { entries: FluidBalanceFull[] }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(() => date ? entries.filter((e) => e.date === date) : entries, [entries, date]);
  const totalIntake = filtered.filter((e) => e.direction === "Intake").reduce((sum, e) => sum + e.volumeMl, 0);
  const totalOutput = filtered.filter((e) => e.direction === "Output").reduce((sum, e) => sum + e.volumeMl, 0);
  const net = totalIntake - totalOutput;

  const columns: DataColumn<FluidBalanceFull>[] = [
    {
      key: "dateTime",
      label: "Date / Time",
      render: (e) => <span className="font-medium text-slate-700">{e.dateTime}</span>,
    },
    {
      key: "direction",
      label: "Direction",
      render: (e) => (
        <Badge variant="outline" className={e.direction === "Intake" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{e.direction}</Badge>
      ),
    },
    { key: "route", label: "Route", hideOnMobile: true },
    { key: "description", label: "Description" },
    {
      key: "volumeMl",
      label: "Volume",
      render: (e) => <span className="font-semibold text-slate-800">{e.volumeMl} ml</span>,
    },
    { key: "recordedBy", label: "Recorded By", hideOnMobile: true },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<Droplets className="h-5 w-5" />}
        title="Fluid Balance"
        subtitle="Intake and output chart with cumulative totals for the selected date range."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTileCard
          title="Total Intake"
          icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
          tone="blue"
          value={`${totalIntake} ml`}
          subtitle="All IV / oral / NG intake"
        />
        <InfoTileCard
          title="Total Output"
          icon={<ArrowUpFromLine className="h-3.5 w-3.5" />}
          tone="amber"
          value={`${totalOutput} ml`}
          subtitle="Urine, drains, vomitus & stool"
        />
        <InfoTileCard
          title="Net Balance"
          icon={<Calculator className="h-3.5 w-3.5" />}
          tone={net >= 0 ? "emerald" : "red"}
          value={`${net >= 0 ? "+" : ""}${net} ml`}
          subtitle="Intake minus output"
        />
      </div>

      <DateFilterBar value={date} onChange={setDate} />

      <DataTable
        card
        title="Fluid Balance Chart"
        titleIcon={<Droplets className="h-4 w-4" />}
        rows={filtered}
        columns={columns}
        rowKey={(e) => e.id}
        countLabel="entries"
        emptyText="No fluid balance entries found."
      />
    </div>
  );
}
// app/(dashboard)/nurse-admin/ipd/all-ward-patients/_components/drawer/section-medicines.tsx
"use client";
import { useMemo, useState } from "react";
import { PackageX, Pill, Truck } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { DateFilterBar } from "./date-filter-bar";
import { SectionHeader } from "./section-header";
import { DoseStatusBadge } from "../status-badges";
import type { MedicineDoseFull } from "@/types/nurse-admin/ipd/ward-detail-types";

export function SectionMedicines({ medicines }: { medicines: MedicineDoseFull[] }) {
  const [date, setDate] = useState("");
  const filtered = useMemo(() => date ? medicines.filter((m) => m.date === date) : medicines, [medicines, date]);
  const outOfStock = medicines.filter((m) => m.status === "Out of Stock");

  const columns: DataColumn<MedicineDoseFull>[] = [
    {
      key: "medicineName",
      label: "Medicine",
      render: (dose) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-800">{dose.medicineName}</p>
          <p className="text-xs text-slate-400">{dose.strength} · {dose.route} · {dose.slot} · Scheduled {dose.scheduledTime}</p>
        </div>
      ),
    },
    { key: "date", label: "Date", hideOnMobile: true },
    {
      key: "status",
      label: "Status",
      render: (dose) => <DoseStatusBadge status={dose.status} />,
    },
    {
      key: "deliveredFromPharmacyAt",
      label: "Pharmacy Delivery",
      render: (dose) =>
        dose.deliveredFromPharmacyAt ? (
          <span className="flex items-center gap-1 text-xs text-slate-600"><Truck className="h-3.5 w-3.5 text-cyan-600" />{dose.deliveredFromPharmacyAt}</span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
      hideOnMobile: true,
    },
    {
      key: "givenBy",
      label: "Given By",
      render: (dose) =>
        dose.givenBy ? (
          <span className="text-xs text-slate-600">{dose.givenBy}{dose.givenAt ? ` · ${dose.givenAt}` : ""}</span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
      hideOnMobile: true,
    },
    {
      key: "outOfStockRemark",
      label: "Remarks",
      render: (dose) =>
        dose.outOfStockRemark ? (
          <span className="text-xs font-medium text-red-600">{dose.outOfStockRemark}</span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={<Pill className="h-5 w-5" />}
        title="Orders & Medicine Administration"
        subtitle="Pharmacy delivery time, nurse administration time, out-of-stock alerts and status for every ordered medicine."
      />

      <DataTable
        card
        title="Medicine Log"
        titleIcon={<Pill className="h-4 w-4" />}
        rows={filtered}
        columns={columns}
        rowKey={(dose) => dose.id}
        countLabel="doses"
        emptyText="No medicine records found for this date."
      />

      <DateFilterBar value={date} onChange={setDate} label="Filter medicines by date" />

      {outOfStock.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<PackageX className="h-3.5 w-3.5" />}
          title={`${outOfStock.length} medicine(s) out of stock`}
          body={outOfStock.map((m) => `${m.medicineName} · ${m.date}`).join("\n")}
        />
      )}
    </div>
  );
}
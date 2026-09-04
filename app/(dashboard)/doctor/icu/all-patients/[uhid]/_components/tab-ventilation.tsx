// app/(dashboard)/doctor/icu/patients/[uhid]/_components/tab-ventilation.tsx
"use client";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import type {
  VentilatorObservation,
  VentilatorOrder,
  VentilatorAdministration,
} from "@/types/nurse/icu/ventilation-types";
import { formatVentilatorSettings } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/ventilator-mode-fields";
import { VentilatorOrderHistory } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/ventilator-order-history";

type Props = {
  patientName: string;
  activeOrder?: VentilatorOrder;
  orderHistory: VentilatorOrder[];
  administration?: VentilatorAdministration;
  observations: VentilatorObservation[];
  onCreateOrder: () => void;
};

const STATUS_TONE: Record<
  VentilatorObservation["patientStatus"],
  string
> = {
  Stable: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Needs Review": "border-amber-200 bg-amber-50 text-amber-700",
  Deteriorating: "border-red-200 bg-red-50 text-red-700",
};

export function TabVentilation({
  patientName,
  activeOrder,
  orderHistory,
  administration,
  observations,
  onCreateOrder,
}: Props) {
  // Helper to read a ventilator parameter from the observation record.
  const getVentParam = (
    obs: VentilatorObservation,
    key: string,
    defaultValue: string = "—",
  ) => String(obs.ventilatorParameters?.[key] ?? defaultValue);

  // Build a flat list of parameter {key, value} pairs from the active order.
  const settingEntries = activeOrder
    ? Object.entries(activeOrder.prescribedSettings).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    : [];

  const observationColumns: DataColumn<VentilatorObservation>[] = [
    {
      key: "recordedAt",
      label: "Time",
      render: (o) => (
        <span className="text-xs font-semibold text-slate-600">{o.recordedAt}</span>
      ),
    },
    {
      key: "rr",
      label: "RR",
      unit: "/min",
      render: (o) => o.respiratoryRate ?? "—",
    },
    {
      key: "vt",
      label: "VT",
      unit: "mL",
      render: (o) => getVentParam(o, "tidalVolume"),
    },
    {
      key: "peep",
      label: "PEEP",
      unit: "cmH₂O",
      render: (o) => getVentParam(o, "peep"),
    },
    {
      key: "fio2",
      label: "FiO₂",
      unit: "%",
      render: (o) => getVentParam(o, "fiO2"),
    },
    {
      key: "spo2",
      label: "SpO₂",
      unit: "%",
      render: (o) => o.spo2 ?? "—",
    },
    {
      key: "bp",
      label: "BP",
      unit: "mmHg",
      render: (o) =>
        o.bloodPressureSystolic && o.bloodPressureDiastolic
          ? `${o.bloodPressureSystolic}/${o.bloodPressureDiastolic}`
          : "—",
    },
    {
      key: "status",
      label: "Patient Status",
      render: (o) => (
        <Badge variant="outline" className={STATUS_TONE[o.patientStatus]}>
          {o.patientStatus}
        </Badge>
      ),
    },
    {
      key: "flags",
      label: "Flags",
      render: (o) => {
        if (o.hasDifference) {
          return (
            <Badge
              variant="outline"
              className={
                o.doctorNotified
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              {o.doctorNotified ? "Notified" : "Review"}
            </Badge>
          );
        }
        return <span className="text-slate-400">—</span>;
      },
    },
    {
      key: "recordedBy",
      label: "Recorded By",
      render: (o) => (
        <span className="text-xs text-slate-500">{o.recordedBy}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Wind className="h-5 w-5 text-cyan-600" />
            Mechanical Ventilation
          </p>
          <p className="text-sm text-slate-500">{patientName}</p>
        </div>
        <PillButton icon={Wind} onClick={onCreateOrder} className="self-start sm:self-auto">
          {activeOrder ? "Modify Order" : "Create Ventilator Order"}
        </PillButton>
      </div>

      {/* Active Order — unified `InfoTileCard` with prescribed-settings grid */}
      {activeOrder ? (
        <InfoTileCard
          title={`Active Ventilator Order — ${activeOrder.ventilationType}`}
          icon={<Wind className="h-3.5 w-3.5" />}
          tone="cyan"
          hint={`${activeOrder.mode} · ${activeOrder.orderedAt}`}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Active
              </Badge>
              <Badge variant="outline" className="border-cyan-200 bg-white text-cyan-700">
                {activeOrder.airwayType}
              </Badge>
              <span className="text-xs text-slate-500">
                Ordered by {activeOrder.orderedBy} ({activeOrder.orderedByRole})
              </span>
            </div>

            {settingEntries.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {settingEntries.map(({ key, value }) => (
                  <div
                    key={key}
                    className="rounded-lg border border-cyan-100 bg-white p-2.5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {key}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {formatVentilatorSettings(
              activeOrder.mode,
              activeOrder.prescribedSettings,
            ) && (
              <p className="text-xs text-slate-600">
                {formatVentilatorSettings(
                  activeOrder.mode,
                  activeOrder.prescribedSettings,
                )}
              </p>
            )}

            {(activeOrder.oxygenationTarget || activeOrder.ventilationTarget) && (
              <div className="flex flex-wrap gap-2">
                {activeOrder.oxygenationTarget && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    O₂ Target: {activeOrder.oxygenationTarget}
                  </Badge>
                )}
                {activeOrder.ventilationTarget && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    Vent Target: {activeOrder.ventilationTarget}
                  </Badge>
                )}
              </div>
            )}

            {activeOrder.specialInstructions && (
              <div className="rounded-lg border border-cyan-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                  Special Instructions
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {activeOrder.specialInstructions}
                </p>
              </div>
            )}

            {activeOrder.weaningPlan && (
              <div className="rounded-lg border border-cyan-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                  Weaning Plan
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {activeOrder.weaningPlan}
                  {activeOrder.weaningPlanOther && `: ${activeOrder.weaningPlanOther}`}
                </p>
              </div>
            )}
          </div>
        </InfoTileCard>
      ) : (
        <InfoAlertCard
          tone="slate"
          icon={<Wind className="h-3.5 w-3.5" />}
          title="No Active Ventilator Order"
          body={`Click "Create Ventilator Order" to initiate mechanical ventilation for ${patientName}.`}
        />
      )}

      {/* Administration Status — unified `InfoAlertCard` */}
      {administration && (
        <InfoAlertCard
          tone="emerald"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          title="Ventilator Setup Confirmed"
          body={`Confirmed by ${administration.confirmedBy} at ${administration.confirmedAt}`}
        />
      )}

      {/* Observations — unified `DataTable` */}
      {observations.length > 0 && (
        <DataTable
          card
          title="Ventilation Observations"
          titleIcon={<Clock className="h-4 w-4" />}
          rows={observations}
          columns={observationColumns}
          rowKey={(o) => o.id}
          countLabel="observations"
          emptyText="No ventilation observations recorded."
        />
      )}

      {/* Order History — existing component (also unified) */}
      {orderHistory.length > 0 && <VentilatorOrderHistory orders={orderHistory} />}
    </div>
  );
}

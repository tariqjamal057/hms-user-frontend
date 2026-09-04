// app/(dashboard)/doctor/icu/patients/[uhid]/_components/tab-oxygen-therapy.tsx
"use client";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Settings2,
  Target,
  Timer,
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
  OxygenAdministration,
  OxygenObservation,
  OxygenOrder,
} from "@/types/nurse/icu/oxygen-therapy-types";
import { formatDeviceSettings } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/oxygen-device-fields";
import { OxygenOrderHistory } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/oxygen-order-history";

type Props = {
  patientName: string;
  activeOrder?: OxygenOrder;
  orderHistory: OxygenOrder[];
  administration?: OxygenAdministration;
  observations: OxygenObservation[];
  onCreateOrder: () => void;
  onModifyOrder?: () => void;
};

const CONDITION_TONE: Record<OxygenObservation["patientCondition"], string> = {
  Comfortable: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Mild distress": "border-amber-200 bg-amber-50 text-amber-700",
  "Moderate distress": "border-orange-200 bg-orange-50 text-orange-700",
  "Severe distress": "border-red-200 bg-red-50 text-red-700",
};

const RESPONSE_TONE: Record<OxygenObservation["oxygenResponse"], string> = {
  Stable: "border-slate-200 bg-slate-50 text-slate-600",
  Improving: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Deteriorating: "border-red-200 bg-red-50 text-red-700",
};

export function TabOxygenTherapy({
  patientName,
  activeOrder,
  orderHistory,
  administration,
  observations,
  onCreateOrder,
  onModifyOrder,
}: Props) {
  const observationColumns: DataColumn<OxygenObservation>[] = [
    {
      key: "recordedAt",
      label: "Time",
      render: (o) => (
        <span className="text-xs font-semibold text-slate-600">{o.recordedAt}</span>
      ),
    },
    {
      key: "spo2",
      label: "SpO₂",
      unit: "%",
      render: (o) => (
        <span className="font-semibold text-slate-800">{o.spo2}</span>
      ),
    },
    {
      key: "rr",
      label: "RR",
      unit: "/min",
      render: (o) => o.respiratoryRate,
    },
    {
      key: "hr",
      label: "HR",
      unit: "/min",
      render: (o) => o.heartRate,
    },
    {
      key: "condition",
      label: "Condition",
      render: (o) => (
        <Badge variant="outline" className={CONDITION_TONE[o.patientCondition]}>
          {o.patientCondition}
        </Badge>
      ),
    },
    {
      key: "response",
      label: "Response",
      render: (o) => (
        <Badge variant="outline" className={RESPONSE_TONE[o.oxygenResponse]}>
          {o.oxygenResponse}
        </Badge>
      ),
    },
    {
      key: "flags",
      label: "Flags",
      render: (o) =>
        o.belowTarget ? (
          <Badge
            variant="outline"
            className={
              o.doctorNotified
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-red-200 bg-red-50 text-red-700"
            }
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            {o.doctorNotified ? "Notified" : "Escalate"}
          </Badge>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: "remarks",
      label: "Remarks",
      render: (o) =>
        o.remarks ? (
          <span className="text-xs italic text-slate-600">{o.remarks}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
      hideOnMobile: true,
    },
    {
      key: "recordedBy",
      label: "Recorded By",
      render: (o) => (
        <span className="text-xs text-slate-500">{o.recordedBy}</span>
      ),
      hideOnMobile: true,
    },
  ];

  const handlePrimaryAction = () => {
    if (activeOrder) {
      onModifyOrder?.();
    } else {
      onCreateOrder();
    }
  };

  // Quick stat derivations
  const lastObservation = observations[0];
  const escalateCount = observations.filter(
    (o) => o.belowTarget && !o.doctorNotified,
  ).length;
  const notifiedCount = observations.filter(
    (o) => o.belowTarget && o.doctorNotified,
  ).length;

  return (
    <div className="space-y-5">
      {/* Header — page title + primary action */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <Wind className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Oxygen Therapy
            </p>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{patientName}</span>
              {activeOrder ? (
                <>
                  {" · "}
                  <span className="text-amber-700">
                    {activeOrder.settings.device} · {formatDeviceSettings(activeOrder.settings)}
                  </span>
                </>
              ) : (
                <> · No active order</>
              )}
            </p>
          </div>
        </div>
        <PillButton
          icon={activeOrder ? Settings2 : Wind}
          onClick={handlePrimaryAction}
          className="self-start sm:self-auto"
        >
          {activeOrder ? "Modify Order" : "Create Oxygen Order"}
        </PillButton>
      </div>

      {/* Active Order — unified InfoTileCard with quick stats grid */}
      {activeOrder ? (
        <div className="space-y-4">
          <InfoTileCard
            title={`Active Oxygen Order — ${activeOrder.settings.device}`}
            icon={<Wind className="h-3.5 w-3.5" />}
            tone="amber"
            hint={`Ordered ${activeOrder.orderedAt} by ${activeOrder.orderedBy} (${activeOrder.orderedByRole})`}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-emerald-500 text-white shadow-sm hover:bg-emerald-500">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Active
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-white text-amber-700"
                >
                  For: {activeOrder.indication}
                  {activeOrder.indicationOther
                    ? ` — ${activeOrder.indicationOther}`
                    : ""}
                </Badge>
                {activeOrder.targetSpo2Min && activeOrder.targetSpo2Max && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    Target SpO₂ {activeOrder.targetSpo2Min}–{activeOrder.targetSpo2Max}%
                  </Badge>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-800">
                {formatDeviceSettings(activeOrder.settings)}
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-amber-100 bg-white p-2.5">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Target className="h-3 w-3" /> Target SpO₂ Min
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-800">
                    {activeOrder.targetSpo2Min}
                    <span className="ml-0.5 text-xs font-medium text-slate-400">%</span>
                  </p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-white p-2.5">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Target className="h-3 w-3" /> Target SpO₂ Max
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-800">
                    {activeOrder.targetSpo2Max}
                    <span className="ml-0.5 text-xs font-medium text-slate-400">%</span>
                  </p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-white p-2.5">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Clock className="h-3 w-3" /> Monitoring
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">
                    {activeOrder.monitoringFrequency}
                  </p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-white p-2.5">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Timer className="h-3 w-3" /> Duration
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">
                    {activeOrder.durationType}
                    {activeOrder.durationValue
                      ? ` · ${activeOrder.durationValue}`
                      : ""}
                  </p>
                </div>
              </div>

              {activeOrder.specialInstructions && (
                <div className="rounded-lg border border-amber-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Special Instructions
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {activeOrder.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </InfoTileCard>

          {/* Quick-stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTileCard
              title="Latest SpO₂"
              icon={<Activity className="h-3.5 w-3.5" />}
              tone={
                lastObservation
                  ? lastObservation.spo2 < (activeOrder.targetSpo2Min ?? 90)
                    ? "red"
                    : "emerald"
                  : "slate"
              }
              value={lastObservation ? `${lastObservation.spo2}%` : "—"}
              subtitle={lastObservation?.recordedAt}
            />
            <InfoTileCard
              title="Latest RR"
              icon={<Activity className="h-3.5 w-3.5" />}
              tone="slate"
              value={
                lastObservation ? `${lastObservation.respiratoryRate} /min` : "—"
              }
              subtitle={lastObservation?.recordedAt}
            />
            <InfoTileCard
              title="Escalations"
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              tone={escalateCount > 0 ? "red" : "emerald"}
              value={String(escalateCount)}
              subtitle="Below target"
            />
            <InfoTileCard
              title="Doctor Notified"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              tone="blue"
              value={String(notifiedCount)}
              subtitle="Acknowledged"
            />
          </div>
        </div>
      ) : (
        <InfoAlertCard
          tone="slate"
          icon={<Wind className="h-3.5 w-3.5" />}
          title="No Active Oxygen Order"
          body={`Click "Create Oxygen Order" to initiate oxygen therapy for ${patientName}.`}
        />
      )}

      {/* Administration Status — unified InfoAlertCard */}
      {administration && (
        <InfoAlertCard
          tone="emerald"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          title="Oxygen Therapy Started"
          body={`Started by ${administration.startedBy} at ${administration.startedAt}`}
        />
      )}

      {/* Observations — unified DataTable */}
      {observations.length > 0 && (
        <DataTable
          card
          title="Oxygen Therapy Observations"
          titleIcon={<Clock className="h-4 w-4" />}
          rows={observations}
          columns={observationColumns}
          rowKey={(o) => o.id}
          countLabel="observations"
          emptyText="No oxygen observations recorded."
        />
      )}

      {/* Order History — existing component */}
      {orderHistory.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-bold text-slate-800">Order History</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {orderHistory.length}
            </span>
          </div>
          <OxygenOrderHistory orders={orderHistory} />
        </div>
      )}
    </div>
  );
}

// app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-oxygen-therapy.tsx
"use client";
import { useState } from "react";
import { Activity, Plus, Wind } from "lucide-react";
import type { OxygenAdministration, OxygenObservation, OxygenOrder } from "@/types/nurse/icu/oxygen-therapy-types";
import { PillButton } from "@/components/forms/pill-button";
import { OxygenActiveOrderCard } from "./oxygen-active-order-card";
import { OxygenObservationForm } from "./oxygen-observation-form";
import { OxygenMonitoringTimeline } from "./oxygen-monitoring-timeline";
import { OxygenOrderHistory } from "./oxygen-order-history";

export function TabOxygenTherapy({
  patientName, nurseName, activeOrder, orderHistory, administration, observations,
  onStartOxygen, onSaveObservation,
}: {
  patientName: string;
  nurseName: string;
  activeOrder?: OxygenOrder;
  orderHistory: OxygenOrder[];
  administration?: OxygenAdministration;
  observations: OxygenObservation[];
  onStartOxygen: (administration: OxygenAdministration) => void;
  onSaveObservation: (observation: OxygenObservation) => void;
}) {
  const [addingObservation, setAddingObservation] = useState(false);

  if (!activeOrder) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <Wind className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-4 text-sm font-semibold text-slate-600">No active oxygen therapy order</p>
        <p className="mt-1 text-xs text-slate-400">Doctor/RMO has not placed an oxygen order for this patient yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OxygenActiveOrderCard order={activeOrder} administration={administration} nurseName={nurseName} onStartOxygen={onStartOxygen} />

      {administration?.isActive && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Activity className="h-4 w-4 text-cyan-600" />
              Oxygen Monitoring
            </p>
            <p className="text-xs text-slate-500">Record patient observations as per monitoring schedule.</p>
          </div>
          <PillButton icon={Plus} onClick={() => setAddingObservation(true)} className="self-start sm:self-auto">
            Add Oxygen Observation
          </PillButton>
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-bold text-slate-800">Monitoring Timeline</p>
        <OxygenMonitoringTimeline observations={observations} orders={orderHistory} />
      </div>

      {orderHistory.length > 1 && <OxygenOrderHistory orders={orderHistory} />}

      {administration && (
        <OxygenObservationForm
          open={addingObservation}
          onOpenChange={setAddingObservation}
          order={activeOrder}
          administration={administration}
          patientName={patientName}
          nurseName={nurseName}
          onSave={onSaveObservation}
        />
      )}
    </div>
  );
}
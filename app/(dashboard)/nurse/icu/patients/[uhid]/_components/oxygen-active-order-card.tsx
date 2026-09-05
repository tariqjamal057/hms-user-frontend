// app/(dashboard)/nurse/icu/patients/[uhid]/_components/oxygen-active-order-card.tsx
"use client";
import { toast } from "sonner";
import { CheckCircle2, Play, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import type { OxygenAdministration, OxygenOrder } from "@/types/nurse/icu/oxygen-therapy-types";
import { formatDeviceSettings } from "./oxygen-device-fields";


export function OxygenActiveOrderCard({
  order, administration, nurseName, onStartOxygen,
}: {
  order: OxygenOrder;
  administration?: OxygenAdministration;
  nurseName: string;
  onStartOxygen: (administration: OxygenAdministration) => void;
}) {
  function handleStart() {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const admin: OxygenAdministration = {
      id: `OXA-${Date.now()}`,
      orderId: order.id,
      uhid: order.uhid,
      actualSettings: order.settings,
      startedBy: nurseName,
      startedAt: stamp,
      isActive: true,
    };
    onStartOxygen(admin);
    toast.success("Oxygen therapy started and confirmed.");
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-blue-900"><Wind className="h-4 w-4" />🔵 Oxygen Order</p>
        <Badge variant="outline" className="border-blue-300 bg-white text-blue-700">{order.status}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Device" value={order.settings.device} />
        <Field label="Ordered Setting" value={formatDeviceSettings(order.settings).replace(`${order.settings.device} · `, "")} />
        <Field label="Target SpO₂" value={`${order.targetSpo2Min}–${order.targetSpo2Max}%`} />
        <Field label="Start" value={order.startDateTime.split(",")[1]?.trim() ?? order.startDateTime} />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2">
        <p className="text-xs text-slate-500">Ordered By <span className="font-semibold text-slate-700">{order.orderedBy}</span> ({order.orderedByRole})</p>
        {administration?.isActive ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" />Started by {administration.startedBy}</span>
        ) : (
          <PillButton icon={Play} onClick={handleStart}>
            Start Oxygen
          </PillButton>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 p-2.5">
      <p className="text-[10px] uppercase text-blue-500">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
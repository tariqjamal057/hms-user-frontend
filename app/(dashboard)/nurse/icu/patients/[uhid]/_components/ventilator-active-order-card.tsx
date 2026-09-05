// app/(dashboard)/nurse/icu/patients/[uhid]/_components/ventilator-active-order-card.tsx
"use client";
import { toast } from "sonner";
import { CheckCircle2, Play, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import type { VentilatorAdministration, VentilatorOrder } from "@/types/nurse/icu/ventilation-types";
import { formatVentilatorSettings } from "./ventilator-mode-fields";

export function VentilatorActiveOrderCard({
  order, administration, nurseName, onConfirmSetup,
}: {
  order: VentilatorOrder;
  administration?: VentilatorAdministration;
  nurseName: string;
  onConfirmSetup: (administration: VentilatorAdministration) => void;
}) {
  function handleConfirm() {
    const stamp = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const admin: VentilatorAdministration = {
      id: `VA-${Date.now()}`,
      orderId: order.id,
      uhid: order.uhid,
      actualSettings: order.prescribedSettings,
      confirmedBy: nurseName,
      confirmedAt: stamp,
      isActive: true,
    };
    onConfirmSetup(admin);
    toast.success("Ventilator setup confirmed.");
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-blue-900"><Wind className="h-4 w-4" />🔵 Mechanical Ventilation</p>
        <Badge variant="outline" className="border-blue-300 bg-white text-blue-700">{order.status}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Type" value={order.ventilationType} />
        <Field label="Mode" value={order.mode} />
        <Field label="Settings" value={formatVentilatorSettings(order.mode, order.prescribedSettings)} />
        <Field label="Start" value={order.orderedAt.split(",")[1]?.trim() ?? order.orderedAt} />
      </div>

      {order.airwayType && order.airwayType !== "None" && (
        <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-600">
          Airway: <span className="font-semibold">{order.airwayType}</span> {order.airwayDetails && `· ${order.airwayDetails}`}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2">
        <p className="text-xs text-slate-500">Ordered By <span className="font-semibold text-slate-700">{order.orderedBy}</span> ({order.orderedByRole})</p>
        {administration?.isActive ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" />Confirmed by {administration.confirmedBy}</span>
        ) : (
          <PillButton icon={Play} onClick={handleConfirm}>
            Confirm Setup
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
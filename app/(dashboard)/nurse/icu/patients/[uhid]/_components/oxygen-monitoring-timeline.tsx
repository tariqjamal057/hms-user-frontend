// app/(dashboard)/nurse/icu/patients/[uhid]/_components/oxygen-monitoring-timeline.tsx
"use client";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Droplets, HeartPulse, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import type { OxygenObservation } from "@/types/nurse/icu/oxygen-therapy-types";
import { formatDeviceSettings } from "./oxygen-device-fields";
import type { OxygenOrder } from "@/types/nurse/icu/oxygen-therapy-types";

export function OxygenMonitoringTimeline({ observations, orders }: { observations: OxygenObservation[]; orders: OxygenOrder[] }) {
  function orderFor(orderId: string) {
    return orders.find((o) => o.id === orderId);
  }

  const columns: DataColumn<OxygenObservation>[] = [
    {
      key: "recordedAt",
      label: "Date & Time",
      render: (obs) => <span className="text-slate-600">{obs.recordedAt}</span>,
    },
    {
      key: "device",
      label: "Device / Setting",
      render: (obs) => (
        <span className="text-slate-700">{orderFor(obs.orderId) ? formatDeviceSettings(orderFor(obs.orderId)!.settings) : "—"}</span>
      ),
    },
    {
      key: "spo2",
      label: "SpO₂",
      icon: <Droplets className="h-3 w-3" />,
      color: "text-cyan-600",
      render: (obs) => (
        <span className={`font-bold ${obs.belowTarget ? "text-red-600" : "text-emerald-600"}`}>{obs.spo2}%</span>
      ),
    },
    {
      key: "rr",
      label: "RR",
      render: (obs) => <span className="text-slate-600">{obs.respiratoryRate}/min</span>,
    },
    {
      key: "hr",
      label: "HR",
      icon: <HeartPulse className="h-3 w-3" />,
      color: "text-pink-600",
      render: (obs) => <span className="text-slate-600">{obs.heartRate} bpm</span>,
    },
    {
      key: "condition",
      label: "Condition",
      render: (obs) => <span className="text-slate-600">{obs.patientCondition}</span>,
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "Status",
      render: (obs) =>
        obs.belowTarget ? (
          <Badge variant="outline" className="gap-1 border-red-300 bg-red-50 text-red-700"><AlertTriangle className="h-3 w-3" />Watch</Badge>
        ) : obs.oxygenResponse === "Improving" ? (
          <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"><TrendingUp className="h-3 w-3" />Improving</Badge>
        ) : obs.oxygenResponse === "Deteriorating" ? (
          <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700"><TrendingDown className="h-3 w-3" />Deteriorating</Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700"><CheckCircle2 className="h-3 w-3" />Stable</Badge>
        ),
    },
    {
      key: "recordedBy",
      label: "Recorded By",
      render: (obs) => <span className="text-slate-600">{obs.recordedBy}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <DataTable
      className="rounded-2xl border border-slate-200 bg-white"
      rows={observations}
      columns={columns}
      rowKey={(obs) => obs.id}
      emptyText="No oxygen observations recorded yet."
    />
  );
}
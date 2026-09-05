// app/(dashboard)/nurse/icu/patients/[uhid]/_components/ventilator-monitoring-timeline.tsx
"use client";
import { Activity, AlertTriangle, CheckCircle2, Droplets, HeartPulse, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import type { VentilatorObservation, VentilatorOrder } from "@/types/nurse/icu/ventilation-types";
import { formatVentilatorSettings } from "./ventilator-mode-fields";

export function VentilatorMonitoringTimeline({ observations, orders }: { observations: VentilatorObservation[]; orders: VentilatorOrder[] }) {
  function orderFor(orderId: string) {
    return orders.find((o) => o.id === orderId);
  }

  const columns: DataColumn<VentilatorObservation>[] = [
    {
      key: "recordedAt",
      label: "Date & Time",
      render: (obs) => <span className="text-slate-600">{obs.recordedAt}</span>,
    },
    {
      key: "mode",
      label: "Mode / Settings",
      icon: <Activity className="h-3 w-3" />,
      color: "text-blue-600",
      render: (obs) => {
        const order = orderFor(obs.orderId);
        return <span className="text-slate-700">{order ? `${order.mode} · ${formatVentilatorSettings(order.mode, obs.ventilatorParameters)}` : "—"}</span>;
      },
    },
    {
      key: "spo2",
      label: "SpO₂",
      icon: <Droplets className="h-3 w-3" />,
      color: "text-cyan-600",
      render: (obs) => (
        <span className={`font-bold text-slate-700 ${obs.spo2 && obs.spo2 < 94 ? "text-red-600" : "text-emerald-600"}`}>{obs.spo2 ?? "—"}%</span>
      ),
    },
    {
      key: "rr",
      label: "RR",
      render: (obs) => <span className="text-slate-600">{obs.respiratoryRate ?? "—"}/min</span>,
    },
    {
      key: "hr",
      label: "HR",
      icon: <HeartPulse className="h-3 w-3" />,
      color: "text-pink-600",
      render: (obs) => <span className="text-slate-600">{obs.heartRate ?? "—"} bpm</span>,
    },
    {
      key: "bp",
      label: "BP",
      render: (obs) => (
        <span className="text-slate-600">{obs.bloodPressureSystolic && obs.bloodPressureDiastolic ? `${obs.bloodPressureSystolic}/${obs.bloodPressureDiastolic}` : "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "Status",
      render: (obs) =>
        obs.hasDifference ? (
          <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700"><AlertTriangle className="h-3 w-3" />Difference</Badge>
        ) : obs.patientStatus === "Stable" ? (
          <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3 w-3" />Stable</Badge>
        ) : obs.patientStatus === "Needs Review" ? (
          <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700"><TrendingUp className="h-3 w-3" />Needs Review</Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700"><TrendingDown className="h-3 w-3" />Deteriorating</Badge>
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
      emptyText="No ventilator observations recorded yet."
    />
  );
}
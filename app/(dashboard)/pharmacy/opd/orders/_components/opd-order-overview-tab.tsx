// app/(dashboard)/pharmacy/opd/orders/_components/opd-order-overview-tab.tsx
"use client";
import {
  CalendarClock,
  ClipboardPen,
  Phone,
  Pill,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type {
  PharmacyOPDOrder,
  PharmacyPaymentMethod,
  PharmacyOrderStatus,
} from "@/types/pharmacy/opd/pharmacy-opd-types";
import { OpdOrderDispenseWorkspace } from "./opd-order-dispense-workspace";

interface Props {
  order: PharmacyOPDOrder;
  onDelivered: (orderId: string, paymentMethod: PharmacyPaymentMethod) => void;
}

const STATUS_STYLES: Record<PharmacyOrderStatus, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Paid: "border-blue-200 bg-blue-50 text-blue-700",
  Delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function OpdOrderOverviewTab({ order, onDelivered }: Props) {
  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-base font-bold text-white shadow-sm">
            {order.patient.name.charAt(0)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold tracking-tight text-slate-800">
                {order.patient.name}
              </p>
              <Badge className={STATUS_STYLES[order.status]}>{order.status}</Badge>
            </div>
            <p className="text-xs text-slate-500">
              {order.patient.age} yrs · {order.patient.gender} ·{" "}
              <span className="font-mono text-slate-700">{order.patient.uhid}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 text-xs text-slate-500 sm:items-end">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" /> {order.orderDateTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Pill className="h-3.5 w-3.5" /> Order {order.id}
          </span>
          <span>Appointment {order.appointmentId}</span>
        </div>
      </div>

      {/* Patient + Doctor tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTileCard
          title="Patient"
          icon={<UserRound className="h-3.5 w-3.5" />}
          tone="blue"
          value={order.patient.name}
          subtitle={`${order.patient.age} yrs · ${order.patient.gender} · ${order.patient.uhid}`}
          multiline
        />
        <InfoTileCard
          title="Prescriber"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          tone="purple"
          value={order.doctor.name}
          subtitle={`${order.doctor.specialty}${order.doctor.registrationNumber ? ` · Reg. ${order.doctor.registrationNumber}` : ""}`}
          multiline
        />
        {order.patient.mobile && (
          <InfoTileCard
            title="Mobile"
            icon={<Phone className="h-3.5 w-3.5" />}
            tone="cyan"
            value={order.patient.mobile}
          />
        )}
        <InfoTileCard
          title="Order Status"
          tone={
            order.status === "Delivered"
              ? "emerald"
              : order.status === "Paid"
                ? "blue"
                : "amber"
          }
          value={order.status}
        />
      </div>

      {/* Diagnosis */}
      {order.patient.diagnosis && (
        <InfoAlertCard
          tone="blue"
          icon={<ClipboardPen className="h-3.5 w-3.5" />}
          title="Diagnosis / Clinical Note"
          body={order.patient.diagnosis}
        />
      )}

      {/* Allergies */}
      {order.patient.allergies.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<UserRound className="h-3.5 w-3.5" />}
          title="Known Allergies"
          body={order.patient.allergies.join(" · ")}
        />
      )}

      <OpdOrderDispenseWorkspace order={order} onDelivered={onDelivered} />
    </div>
  );
}

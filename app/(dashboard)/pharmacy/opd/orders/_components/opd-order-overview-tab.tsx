// app/(dashboard)/pharmacy/opd/orders/_components/opd-order-overview-tab.tsx
"use client";
import { CalendarClock, ClipboardPen, Phone, Stethoscope, UserRound, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PharmacyOPDOrder, PharmacyPaymentMethod, PharmacyOrderStatus } from "@/types/pharmacy/opd/pharmacy-opd-types";
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

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-sm ${highlight ? "font-bold text-blue-600" : "font-semibold text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}

export function OpdOrderOverviewTab({ order, onDelivered }: Props) {
  return (
    <div className="space-y-5 rounded-b-2xl border border-t-0 border-slate-200 bg-slate-50/60 p-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Section icon={<UserRound className="h-5 w-5 text-blue-600" />} title="Patient Details">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-base font-bold text-white shadow-md">
              {order.patient.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-800">{order.patient.name}</p>
              <p className="text-xs text-slate-500">
                {order.patient.age} years · {order.patient.gender} · {order.patient.uhid}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
            <FieldRow label="UHID" value={order.patient.uhid} />
            {order.patient.mobile && <FieldRow label="Mobile" value={order.patient.mobile} />}
            <FieldRow label="Age" value={`${order.patient.age} years`} />
            <FieldRow label="Gender" value={order.patient.gender} />
          </div>
          {order.patient.allergies.length > 0 && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-rose-500">Allergies</p>
              <p className="mt-1 text-sm font-semibold text-rose-700">{order.patient.allergies.join(", ")}</p>
            </div>
          )}
        </Section>

        <Section icon={<Stethoscope className="h-5 w-5 text-blue-600" />} title="Prescriber Details">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4">
            <FieldRow label="Doctor" value={order.doctor.name} />
            <FieldRow label="Specialty" value={order.doctor.specialty} />
            {order.doctor.registrationNumber && (
              <FieldRow label="Reg. No." value={order.doctor.registrationNumber} />
            )}
          </div>
        </Section>

        <Section icon={<ClipboardPen className="h-5 w-5 text-blue-600" />} title="Diagnosis / Clinical Note">
          <p className={`text-sm ${order.patient.diagnosis ? "font-semibold text-slate-800" : "text-slate-400"}`}>
            {order.patient.diagnosis ?? "No diagnosis recorded"}
          </p>
        </Section>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge className={STATUS_STYLES[order.status]}>{order.status}</Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarClock className="h-4 w-4" />
          {order.orderDateTime}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Order {order.id}</span> · Appointment {order.appointmentId}
          <Phone className="h-3.5 w-3.5" />
        </span>
      </div>

      <OpdOrderDispenseWorkspace order={order} onDelivered={onDelivered} />
    </div>
  );
}
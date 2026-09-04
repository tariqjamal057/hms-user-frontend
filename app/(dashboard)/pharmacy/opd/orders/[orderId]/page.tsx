// app/(dashboard)/pharmacy/opd/orders/[orderId]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import type { PharmacyPaymentMethod } from "@/types/pharmacy/opd/pharmacy-opd-types";
import { PHARMACY_OPD_ORDERS } from "@/lib/pharmacy/opd/pharmacy-opd-orders-data";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import { OpdOrderOverviewTab } from "../_components/opd-order-overview-tab";

export default function PharmacyOpdOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const sourceOrder = PHARMACY_OPD_ORDERS.find((o) => o.id === params.orderId);
  const [order, setOrder] = useState(() => sourceOrder ?? PHARMACY_OPD_ORDERS[0]);

  if (!sourceOrder) return notFound();

  function handleDelivered(orderId: string, paymentMethod: PharmacyPaymentMethod) {
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrder((previous) =>
      previous.id === orderId
        ? { ...previous, status: "Delivered", paymentMethod, deliveredAt: timestamp }
        : previous,
    );
    toast.success(`Medicines dispatched and delivered to ${order.patient.name} successfully.`);
  }

  const infoFields: { label: string; value: string; highlight?: boolean }[] = [];
  if (order.doctor?.name) infoFields.push({ label: "Doctor", value: order.doctor.name });
  if (order.doctor?.specialty) infoFields.push({ label: "Specialty", value: order.doctor.specialty });
  if (order.patient.diagnosis) infoFields.push({ label: "Diagnosis", value: order.patient.diagnosis, highlight: true });
  if (order.orderDateTime) infoFields.push({ label: "Ordered On", value: order.orderDateTime });
  if (order.patient.mobile) infoFields.push({ label: "Mobile", value: order.patient.mobile });
  if (order.paymentMethod) infoFields.push({ label: "Payment", value: order.paymentMethod });
  infoFields.push({ label: "Order Status", value: order.status });

  const detail: PatientDetailData = {
    uhid: order.patient.uhid,
    name: order.patient.name,
    age: order.patient.age,
    gender: order.patient.gender,
    bloodGroup: "",
    allergies: order.patient.allergies ?? [],
    moduleId: order.id,
    moduleIdLabel: "Order No",
    metaLine: order.appointmentId,
    fallbackInfoFields: infoFields,
  };

  const patientList: PatientListItem[] = PHARMACY_OPD_ORDERS.map((o) => ({
    uhid: o.patient.uhid,
    name: o.patient.name,
    subtitle: `${o.id} · ${o.appointmentId}`,
  }));

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: <OpdOrderOverviewTab order={order} onDelivered={handleDelivered} />,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        <PatientDetailShell
          patient={detail}
          patientList={patientList}
          patientsPath="/pharmacy/opd/orders"
          tabs={tabs}
          defaultTab="overview"
          hideSingleTab
        />
      </div>
    </div>
  );
}
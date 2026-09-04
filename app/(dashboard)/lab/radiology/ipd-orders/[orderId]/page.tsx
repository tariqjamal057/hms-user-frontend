// app/(dashboard)/lab/radiology/ipd-orders/[orderId]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import type {
  RadiologyIpdOrder,
  RadiologyIpdTestItem,
} from "@/types/lab/radiology/radiology-ipd-types";
import type { RadiologyPaymentMethod } from "@/types/lab/radiology/radiology-opd-types";
import { RADIOLOGY_IPD_ORDERS } from "@/lib/lab/radiology/radiology-ipd-orders-data";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import { RadiologyIpdOrderDetailDrawer } from "../_components/radiology-ipd-order-detail-drawer";

export default function RadiologyIpdOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const sourceOrder = RADIOLOGY_IPD_ORDERS.find((o) => o.id === params.orderId);
  const [order, setOrder] = useState<RadiologyIpdOrder>(() => sourceOrder ?? RADIOLOGY_IPD_ORDERS[0]);

  if (!sourceOrder) return notFound();

  function updateTest(orderId: string, updatedTest: RadiologyIpdTestItem) {
    setOrder((previous) =>
      previous.id === orderId
        ? {
            ...previous,
            tests: previous.tests.map((test) =>
              test.id === updatedTest.id ? updatedTest : test,
            ),
          }
        : previous,
    );
    toast.success(
      updatedTest.status === "Report Ready"
        ? `${updatedTest.testName} report finalized and locked.`
        : `${updatedTest.testName} status updated to ${updatedTest.status}.`,
    );
  }

  function collectPayment(orderId: string, method: RadiologyPaymentMethod) {
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrder((previous) =>
      previous.id === orderId
        ? { ...previous, paymentStatus: "Paid", paymentMethod: method, paidAt: timestamp }
        : previous,
    );
    toast.success(`Payment collected successfully from ${order.patient.name}.`);
  }

  function sendToBillingDept(orderId: string) {
    const timestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrder((previous) =>
      previous.id === orderId
        ? { ...previous, billSentToBillingDeptAt: timestamp }
        : previous,
    );
    toast.success(`Bill sent to Billing Department for ${order.patient.name}.`);
  }

  const allergies = order.patient.allergies ?? [];
  const locationParts = [order.patient.ward, order.patient.room, order.patient.bed].filter(Boolean);

  const infoFields: { label: string; value: string; highlight?: boolean }[] = [];
  if (order.patient.diagnosis) infoFields.push({ label: "Diagnosis", value: order.patient.diagnosis, highlight: true });
  if (order.doctor.specialty) infoFields.push({ label: "Specialty", value: order.doctor.specialty });
  if (order.doctor.name) infoFields.push({ label: "Doctor", value: order.doctor.name });
  infoFields.push({ label: "Tests", value: `${order.tests.length} ordered` });
  infoFields.push({ label: "Payment", value: order.paymentStatus });
  if (order.orderedAt) infoFields.push({ label: "Ordered At", value: order.orderedAt });

  const detail: PatientDetailData = {
    uhid: order.patient.uhid,
    name: order.patient.name,
    age: order.patient.age,
    gender: order.patient.gender,
    bloodGroup: "",
    allergies,
    moduleId: order.id,
    moduleIdLabel: "Order No",
    locationParts,
    metaLine: order.ipdId,
    fallbackInfoFields: infoFields,
  };

  const patientList: PatientListItem[] = RADIOLOGY_IPD_ORDERS.map((o) => ({
    uhid: o.patient.uhid,
    name: o.patient.name,
    subtitle: `${o.id} · ${o.patient.ward} / ${o.patient.bed}`,
  }));

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <RadiologyIpdOrderDetailDrawer
          order={order}
          onClose={() => undefined}
          onUpdateTest={updateTest}
          onCollectPayment={collectPayment}
          onSendToBillingDept={sendToBillingDept}
          inline
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        <PatientDetailShell
          patient={detail}
          patientList={patientList}
          patientsPath="/lab/radiology/ipd-orders"
          tabs={tabs}
          defaultTab="overview"
          hideSingleTab
        />
      </div>
    </div>
  );
}
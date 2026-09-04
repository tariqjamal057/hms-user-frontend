// app/(dashboard)/lab/pathology/ipd-orders/[orderId]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import type {
  PathologyIpdOrder,
  PathologyIpdTestItem,
} from "@/types/lab/pathology/pathology-ipd-types";
import type { PathologyPaymentMethod } from "@/types/lab/pathology/pathology-opd-types";
import {
  PATHOLOGY_IPD_ORDERS,
} from "@/lib/lab/pathology/pathology-ipd-orders-data";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import { PathologyIpdOrderDetailDrawer } from "../_components/pathology-ipd-order-detail-drawer";

export default function PathologyIpdOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const sourceOrder = PATHOLOGY_IPD_ORDERS.find((o) => o.id === params.orderId);
  const [order, setOrder] = useState<PathologyIpdOrder>(() => sourceOrder ?? PATHOLOGY_IPD_ORDERS[0]);

  if (!sourceOrder) return notFound();

  function updateTest(orderId: string, updatedTest: PathologyIpdTestItem) {
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

  function collectPayment(orderId: string, method: PathologyPaymentMethod) {
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
    locationParts: [order.patient.ward, order.patient.room, order.patient.bed].filter(Boolean),
    metaLine: order.ipdId,
    fallbackInfoFields: infoFields,
  };

  const patientList: PatientListItem[] = PATHOLOGY_IPD_ORDERS.map((o) => ({
    uhid: o.patient.uhid,
    name: o.patient.name,
    subtitle: `${o.id} · ${o.patient.ward} / ${o.patient.bed}`,
  }));

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <PathologyIpdOrderDetailDrawer
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
          patientsPath="/lab/pathology/ipd-orders"
          tabs={tabs}
          defaultTab="overview"
          hideSingleTab
        />
      </div>
    </div>
  );
}
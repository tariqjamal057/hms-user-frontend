// app/(dashboard)/lab/pathology/opd-orders/[orderId]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import type {
  PathologyOPDOrder,
  PathologyPaymentMethod,
  PathologyTestItem,
} from "@/types/lab/pathology/pathology-opd-types";
import { PATHOLOGY_OPD_ORDERS } from "@/lib/lab/pathology/pathology-opd-orders-data";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import { PathologyOrderDetailDrawer } from "../_components/pathology-order-detail-drawer";

export default function PathologyOpdOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const sourceOrder = PATHOLOGY_OPD_ORDERS.find((o) => o.id === params.orderId);
  const [order, setOrder] = useState<PathologyOPDOrder>(() => sourceOrder ?? PATHOLOGY_OPD_ORDERS[0]);

  if (!sourceOrder) return notFound();

  function updateTest(orderId: string, updatedTest: PathologyTestItem) {
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
    allergies: order.patient.allergies ?? [],
    moduleId: order.id,
    moduleIdLabel: "Order No",
    metaLine: order.appointmentId,
    contact: order.patient.mobile,
    fallbackInfoFields: infoFields,
  };

  const patientList: PatientListItem[] = PATHOLOGY_OPD_ORDERS.map((o) => ({
    uhid: o.patient.uhid,
    name: o.patient.name,
    subtitle: `${o.id} · ${o.appointmentId}`,
  }));

  const tabs: PatientTab[] = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <PathologyOrderDetailDrawer
          order={order}
          onClose={() => undefined}
          onUpdateTest={updateTest}
          onCollectPayment={collectPayment}
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
          patientsPath="/lab/pathology/opd-orders"
          tabs={tabs}
          defaultTab="overview"
          hideSingleTab
        />
      </div>
    </div>
  );
}
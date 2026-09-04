// app/(dashboard)/pharmacy/ipd/orders/[orderId]/page.tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import type {
  DailyDoseLog,
  PharmacyIpdMedicineItem,
  PharmacyIpdOrder,
  PharmacyPaymentMethod,
} from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";
import {
  CURRENT_PHARMACY_STAFF,
  PHARMACY_IPD_ORDERS,
  getAdmittedDays,
  getBalanceDueValue,
  getDefaultBatch,
} from "@/lib/pharmacy/ipd/pharmacy-ipd-order-data";
import { PatientDetailShell, type PatientDetailData, type PatientListItem, type PatientTab } from "@/components/patient-detail/patient-detail-shell";
import { TabTodaysOrders } from "../_components/tab-todays-orders";
import { TabPreviousDays } from "../_components/tab-previous-days";
import { TabReturns } from "../_components/tab-returns";
import { TabBilling } from "../_components/tab-billing";
import { TabAudit } from "../_components/tab-audit";

export default function PharmacyIpdOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const sourceOrder = PHARMACY_IPD_ORDERS.find((o) => o.id === params.orderId);
  const [order, setOrder] = useState<PharmacyIpdOrder>(() => sourceOrder ?? PHARMACY_IPD_ORDERS[0]);

  if (!sourceOrder) return notFound();

  function update(patch: Partial<PharmacyIpdOrder>) {
    setOrder((previous) => ({ ...previous, ...patch }));
  }

  function handleSelectBatch(medicine: PharmacyIpdMedicineItem, batchId: string) {
    update({
      medicines: order.medicines.map((item) =>
        item.id === medicine.id ? { ...item, selectedBatchId: batchId } : item,
      ),
    });
  }

  function handleDeliverDose(medicine: PharmacyIpdMedicineItem, log: DailyDoseLog, qty: number) {
    const activeBatch =
      medicine.batches.find((batch) => batch.id === medicine.selectedBatchId) ??
      getDefaultBatch(medicine);
    if (!activeBatch || activeBatch.availableQuantity <= 0) return;

    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const isFull = qty >= log.orderedQtyForDose;

    setOrder((previous) => ({
      ...previous,
      medicines: previous.medicines.map((item) => {
        if (item.id !== medicine.id) return item;
        const updatedBatches = item.batches.map((batch) =>
          batch.id === activeBatch.id
            ? { ...batch, availableQuantity: Math.max(0, batch.availableQuantity - qty) }
            : batch,
        );
        const updatedLogs = item.dailyLogs.map((entry) =>
          entry.id === log.id
            ? {
                ...entry,
                status: (isFull ? "Delivered" : "Partially Delivered") as DailyDoseLog["status"],
                deliveredQtyForDose: qty,
                batchNumberUsed: activeBatch.batchNumber,
                unitPriceUsed: activeBatch.unitPrice,
                amount: qty * activeBatch.unitPrice,
                deliveredBy: CURRENT_PHARMACY_STAFF.name,
                deliveredAt: stamp,
                wardReceivedAt: stamp,
              }
            : entry,
        );
        return { ...item, batches: updatedBatches, dailyLogs: updatedLogs };
      }),
    }));
    toast.success(`${medicine.medicineName} (${log.slot}) marked delivered and sent to ward.`);
  }

  function handleNotifyDoctor(medicine: PharmacyIpdMedicineItem, log: DailyDoseLog) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrder((previous) => ({
      ...previous,
      medicines: previous.medicines.map((item) =>
        item.id === medicine.id
          ? {
              ...item,
              dailyLogs: item.dailyLogs.map((entry) =>
                entry.id === log.id ? { ...entry, doctorNotified: true, doctorNotifiedAt: stamp } : entry,
              ),
            }
          : item,
      ),
    }));
    toast.success(`Doctor and nurse notified: ${medicine.medicineName} is out of stock.`);
  }

  function handleAddPayments(lines: Array<{ method: PharmacyPaymentMethod; amount: number }>) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrder((previous) => {
      const newPayments = lines.map((line, index) => ({
        id: `PAY-${Date.now()}-${index}`,
        method: line.method,
        amount: line.amount,
        receivedOn: stamp,
        receivedBy: CURRENT_PHARMACY_STAFF.name,
      }));
      const updatedOrder: PharmacyIpdOrder = {
        ...previous,
        payments: [...previous.payments, ...newPayments],
      };
      const balance = getBalanceDueValue(updatedOrder);
      return {
        ...updatedOrder,
        paymentStatus: balance <= 0 ? "Paid" : "Partially Paid",
        status: balance <= 0 ? "Payment Received" : "Partially Paid",
      };
    });
    toast.success("Payment recorded successfully.");
  }

  function handleAddDiscount(percentage: number, amount: number, reason: string) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    update({
      discounts: [
        ...order.discounts,
        {
          id: `DIS-${Date.now()}`,
          percentage,
          amount,
          reason,
          givenBy: CURRENT_PHARMACY_STAFF.name,
          givenByRole: CURRENT_PHARMACY_STAFF.role,
          givenOn: stamp,
        },
      ],
    });
    toast.success(`${percentage}% discount (₹${amount.toFixed(2)}) applied by ${CURRENT_PHARMACY_STAFF.name}.`);
  }

  function handleSendToBillingDept() {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    update({ billSentToBillingDeptAt: stamp, status: "Billed to Department" });
    toast.success(`Bill sent to IPD Billing Department for ${order.patientName}.`);
  }

  const allergies = order.allergy ? [order.allergy] : [];

  const todayIso = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();
  function dateToIso(value: string) {
    const dateText = value.split(",")[0]?.trim();
    if (!dateText) return "";
    const date = new Date(`${dateText} 12:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  const todaysRows = order.medicines.flatMap((medicine) =>
    medicine.dailyLogs.filter((log) => dateToIso(log.date) === todayIso),
  );
  const orderedToday = todaysRows.length;
  const pendingToday = todaysRows.filter((log) => log.status === "Pending").length;
  const balanceDue = getBalanceDueValue(order);

  const infoFields: { label: string; value: string; highlight?: boolean }[] = [];
  if (order.diagnosis) infoFields.push({ label: "Diagnosis", value: order.diagnosis, highlight: true });
  if (order.department) infoFields.push({ label: "Department", value: order.department });
  if (order.orderingDoctor) infoFields.push({ label: "Doctor", value: order.orderingDoctor });
  if (order.admissionDate) infoFields.push({ label: "Admitted On", value: `${order.admissionDate} (${getAdmittedDays(order.admissionDate)} day(s))` });
  if (order.orderDateTime) infoFields.push({ label: "Ordered On", value: order.orderDateTime });
  infoFields.push({ label: "Order Status", value: order.status });
  infoFields.push({ label: "Today's Medicines", value: `${orderedToday} ordered · ${pendingToday} pending` });
  infoFields.push({ label: "Billing", value: `₹${balanceDue.toFixed(2)} due`, highlight: balanceDue > 0 });

  const detail: PatientDetailData = {
    uhid: order.uhid,
    name: order.patientName,
    age: order.age,
    gender: order.gender,
    bloodGroup: "",
    allergies,
    moduleId: order.id,
    moduleIdLabel: "Order No",
    locationParts: [order.ward, order.room, order.bed].filter(Boolean),
    metaLine: order.ipdId,
    fallbackInfoFields: infoFields,
  };

  const patientList: PatientListItem[] = PHARMACY_IPD_ORDERS.map((o) => ({
    uhid: o.uhid,
    name: o.patientName,
    subtitle: `${o.id} · ${o.ward} / ${o.bed}`,
  }));

  const tabs: PatientTab[] = [
    {
      value: "today",
      label: "Today's Orders",
      content: (
        <TabTodaysOrders
          order={order}
          onSelectBatch={(medicine, batchId) => handleSelectBatch(medicine, batchId)}
          onDeliverDose={(medicine, log, qty) => handleDeliverDose(medicine, log, qty)}
          onNotifyDoctor={(medicine, log) => handleNotifyDoctor(medicine, log)}
        />
      ),
    },
    { value: "previous", label: "Previous Days", content: <TabPreviousDays order={order} /> },
    { value: "returns", label: "Returns", content: <TabReturns order={order} /> },
    {
      value: "billing",
      label: "Billing",
      content: (
        <TabBilling
          order={order}
          onAddPayments={handleAddPayments}
          onAddDiscount={handleAddDiscount}
          onSendToBillingDept={handleSendToBillingDept}
        />
      ),
    },
    { value: "audit", label: "Audit", content: <TabAudit order={order} /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath="/pharmacy/ipd/orders"
      tabs={tabs}
      defaultTab="today"
    />
  );
}
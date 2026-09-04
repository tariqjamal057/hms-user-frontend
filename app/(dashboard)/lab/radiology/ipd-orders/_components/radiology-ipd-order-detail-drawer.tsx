// app/(dashboard)/lab/radiology/ipd-orders/_components/radiology-ipd-order-detail-drawer.tsx
"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  BedDouble,
  CheckCircle2,
  CreditCard,
  FileImage,
  IndianRupee,
  Landmark,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RadiologyIpdOrder,
  RadiologyIpdTestItem,
} from "@/types/lab/radiology/radiology-ipd-types";
import type {
  RadiologyOrderStatus,
  RadiologyPaymentMethod,
} from "@/types/lab/radiology/radiology-opd-types";
import {
  getTotalRadiologyIpdValue,
  RADIOLOGY_IPD_DIRECT_PAYMENT_ENABLED,
} from "@/lib/lab/radiology/radiology-ipd-orders-data";
import { RadiologyTestStatusBadge } from "../../opd-orders/_components/radiology-status-badges";
import {
  RadiologyBillSentBadge,
  RadiologyIpdPaymentBadge,
  RadiologyUrgencyBadge,
} from "./radiology-ipd-badges";

interface Props {
  order: RadiologyIpdOrder | null;
  onClose: () => void;
  onUpdateTest: (orderId: string, test: RadiologyIpdTestItem) => void;
  onCollectPayment: (orderId: string, method: RadiologyPaymentMethod) => void;
  onSendToBillingDept: (orderId: string) => void;
  inline?: boolean;
}
const statusFlow: RadiologyOrderStatus[] = [
  "Ordered",
  "Processing",
  "Report Ready",
];

export function RadiologyIpdOrderDetailDrawer({
  order,
  onClose,
  onUpdateTest,
  onCollectPayment,
  onSendToBillingDept,
  inline = false,
}: Props) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState<RadiologyPaymentMethod>("Cash");
  useEffect(() => {
    setPaymentOpen(false);
  }, [order]);
  if (!order) return null;
  const selectedOrder = order;

  function updateStatus(
    test: RadiologyIpdTestItem,
    status: RadiologyOrderStatus,
  ) {
    if (test.status === "Report Ready") return;
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    onUpdateTest(selectedOrder.id, {
      ...test,
      status,
      processingStartedAt:
        status === "Processing" ? stamp : test.processingStartedAt,
    });
  }

  function finalizeReport(
    test: RadiologyIpdTestItem,
    image?: File,
    remarks?: string,
  ) {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    onUpdateTest(selectedOrder.id, {
      ...test,
      status: "Report Ready",
      reportImageName: image?.name ?? test.reportImageName,
      reportRemarks: remarks || test.reportRemarks,
      reportReadyAt: stamp,
    });
  }

  const allReportsReady = selectedOrder.tests.every(
    (test) => test.status === "Report Ready",
  );
  const billSent = Boolean(selectedOrder.billSentToBillingDeptAt);

  const content = (
    <>
      <main className={inline ? "space-y-5" : "space-y-5 p-5"}>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Info
              title="Patient Details"
              icon={<UserRound className="h-4 w-4 text-sky-600" />}
              lines={[
                selectedOrder.patient.name,
                `${selectedOrder.patient.age} years · ${selectedOrder.patient.gender} · ${selectedOrder.patient.uhid}`,
              ]}
            />
            <Info
              title="Ward / Bed"
              icon={<BedDouble className="h-4 w-4 text-emerald-600" />}
              lines={[
                selectedOrder.patient.ward,
                `${selectedOrder.patient.room} · ${selectedOrder.patient.bed}`,
              ]}
            />
          </section>
          <Info
            title="Ordering Doctor"
            icon={<Stethoscope className="h-4 w-4 text-violet-600" />}
            lines={[
              selectedOrder.doctor.name,
              selectedOrder.doctor.specialty,
              `Reg. No. ${selectedOrder.doctor.registrationNumber}`,
            ]}
          />
          {selectedOrder.patient.diagnosis && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-xs font-semibold text-violet-700">
                Diagnosis / Clinical Indication
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {selectedOrder.patient.diagnosis}
              </p>
            </div>
          )}
          {selectedOrder.patient.allergies.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-red-800">
                <AlertTriangle className="h-4 w-4" />
                Known Allergies
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedOrder.patient.allergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    className="border-red-200 bg-white text-red-700"
                  >
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <section>
            <div className="mb-3">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <ScanLine className="h-5 w-5 text-sky-600" />
                Ordered Radiology Tests
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Workflow: Ordered → Processing → Report Ready. Report-ready
                imaging is locked.
              </p>
            </div>
            <div className="space-y-3">
              {selectedOrder.tests.map((test, index) => (
                <RadiologyTestCard
                  key={test.id}
                  test={test}
                  index={index}
                  onStatusChange={updateStatus}
                  onFinalize={finalizeReport}
                />
              ))}
            </div>
          </section>
        </main>
        <footer className={inline ? "mt-5 border-t border-slate-200 bg-white p-5" : "sticky bottom-0 border-t border-slate-200 bg-white p-5"}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Total radiology test value
              </p>
              <p className="text-2xl font-bold text-slate-800">
                ₹{getTotalRadiologyIpdValue(selectedOrder)}
              </p>
            </div>
            {selectedOrder.paymentStatus === "Paid" ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Payment collected via {selectedOrder.paymentMethod}
              </div>
            ) : billSent ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                <CheckCircle2 className="h-5 w-5" />
                Bill sent to Billing Department
              </div>
            ) : RADIOLOGY_IPD_DIRECT_PAYMENT_ENABLED ? (
              <Button
                disabled={!allReportsReady}
                className="gap-2 bg-sky-600 hover:bg-sky-700"
                onClick={() => setPaymentOpen(true)}
              >
                <CreditCard className="h-4 w-4" />
                Continue Payment
              </Button>
            ) : (
              <Button
                disabled={!allReportsReady}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
                onClick={() => onSendToBillingDept(selectedOrder.id)}
              >
                <PackageCheck className="h-4 w-4" />
                Order Delivered & Send Bill to Billing Dept.
              </Button>
            )}
          </div>
          {!allReportsReady && (
            <p className="mt-2 text-xs text-slate-400">
              Complete all radiology reports before proceeding with billing.
            </p>
          )}
        </footer>
        {paymentOpen && (
          <PaymentDialog
            total={getTotalRadiologyIpdValue(selectedOrder)}
            method={payment}
            setMethod={setPayment}
            onCancel={() => setPaymentOpen(false)}
            onConfirm={() => {
              onCollectPayment(selectedOrder.id, payment);
              setPaymentOpen(false);
            }}
          />
        )}
      </>
    );

    if (inline) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-5 py-3">
            <h2 className="text-lg font-bold text-slate-800">Radiology IPD Order</h2>
            <RadiologyIpdPaymentBadge status={selectedOrder.paymentStatus} />
            {billSent && <RadiologyBillSentBadge />}
            <span className="text-xs text-slate-500">{selectedOrder.id} · {selectedOrder.ipdId}</span>
          </div>
          <div className="p-5">{content}</div>
        </div>
      );
    }

    return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Radiology IPD Order</h2>
              <RadiologyIpdPaymentBadge status={selectedOrder.paymentStatus} />
              {billSent && <RadiologyBillSentBadge />}
            </div>
            <p className="mt-1 text-xs text-slate-500">{selectedOrder.id} · {selectedOrder.ipdId}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </header>
        {content}
      </aside>
    </div>
  );
}

function RadiologyTestCard({
  test,
  index,
  onStatusChange,
  onFinalize,
}: {
  test: RadiologyIpdTestItem;
  index: number;
  onStatusChange: (
    test: RadiologyIpdTestItem,
    status: RadiologyOrderStatus,
  ) => void;
  onFinalize: (
    test: RadiologyIpdTestItem,
    image?: File,
    remarks?: string,
  ) => void;
}) {
  const [image, setImage] = useState<File | undefined>();
  const [remarks, setRemarks] = useState(test.reportRemarks ?? "");
  const locked = test.status === "Report Ready";
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-slate-800">
              {index + 1}. {test.testName}
            </p>
            <RadiologyUrgencyBadge urgency={test.urgency} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {test.category} · {test.modality}
            {test.bodyPart ? ` · ${test.bodyPart}` : ""} · ₹{test.price}
          </p>
          {test.instructions && (
            <p className="mt-2 text-xs text-slate-500">
              Instructions: {test.instructions}
            </p>
          )}
        </div>
        <RadiologyTestStatusBadge status={test.status} />
      </div>
      {!locked && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-1 text-xs font-medium text-slate-500">
            Update Imaging Status
          </p>
          <Select
            value={test.status}
            onValueChange={(value) =>
              onStatusChange(test, value as RadiologyOrderStatus)
            }
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFlow
                .slice(statusFlow.indexOf(test.status))
                .map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {test.status === "Processing" && !locked && (
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
          <p className="text-sm font-bold text-slate-800">
            Upload Radiology Report
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Upload the imaging report or scan image. No numerical test result or
            reference range is required.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-slate-500">Report Image / PDF</p>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => setImage(event.target.files?.[0])}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">
                Radiologist Remarks (Optional)
              </p>
              <Textarea
                rows={2}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Enter radiology impression or report remarks..."
              />
            </div>
          </div>
          <Button
            disabled={!image && !test.reportImageName}
            className="mt-3 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onFinalize(test, image, remarks)}
          >
            Upload & Mark Report Ready
          </Button>
        </div>
      )}
      {locked && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-emerald-800">
            <FileImage className="h-4 w-4" />
            Radiology Report Uploaded
          </p>
          {test.reportImageName && (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {test.reportImageName}
            </p>
          )}
          {test.reportRemarks && (
            <p className="mt-2 text-sm text-emerald-800">
              Impression: {test.reportRemarks}
            </p>
          )}
          <p className="mt-2 text-xs text-emerald-700">
            Report ready at {test.reportReadyAt}. Status is locked and cannot be
            changed.
          </p>
        </div>
      )}
    </div>
  );
}

function PaymentDialog({
  total,
  method,
  setMethod,
  onCancel,
  onConfirm,
}: {
  total: number;
  method: RadiologyPaymentMethod;
  setMethod: (method: RadiologyPaymentMethod) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const options: Array<{
    value: RadiologyPaymentMethod;
    label: string;
    icon: React.ElementType;
    tone: string;
    selected: string;
  }> = [
    {
      value: "Cash",
      label: "Cash",
      icon: Banknote,
      tone: "bg-emerald-100 text-emerald-600",
      selected: "border-emerald-500 bg-emerald-50",
    },
    {
      value: "UPI",
      label: "UPI",
      icon: Smartphone,
      tone: "bg-violet-100 text-violet-600",
      selected: "border-violet-500 bg-violet-50",
    },
    {
      value: "Card",
      label: "Card",
      icon: CreditCard,
      tone: "bg-blue-100 text-blue-600",
      selected: "border-blue-500 bg-blue-50",
    },
    {
      value: "Net Banking",
      label: "Net Banking",
      icon: Landmark,
      tone: "bg-amber-100 text-amber-600",
      selected: "border-amber-500 bg-amber-50",
    },
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-cyan-50 to-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Collect Radiology Payment
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Select the payment method used by the patient or attendant.
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Total Imaging Value
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-800">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = method === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setMethod(option.value)}
                  className={`relative flex items-center gap-3 rounded-xl border p-3 text-left ${isSelected ? option.selected : "border-slate-200 hover:border-sky-200"}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${option.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {option.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-sky-600" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-5 text-emerald-800">
              Confirming payment will mark the radiology order as paid and
              record the selected method in the billing audit trail.
            </p>
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 p-5">
          <Button
            variant="outline"
            className="flex-1 bg-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={onConfirm}
          >
            Collect ₹{total.toLocaleString("en-IN")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Info({
  title,
  icon,
  lines,
}: {
  title: string;
  icon: React.ReactNode;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
        {icon}
        {title}
      </p>
      {lines.map((line, index) => (
        <p
          key={index}
          className={`mt-${index === 0 ? "3" : "1"} text-sm ${index === 0 ? "font-semibold text-slate-700" : "text-slate-500"}`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

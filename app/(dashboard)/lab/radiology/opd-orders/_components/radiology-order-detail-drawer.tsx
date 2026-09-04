// app/(dashboard)/lab/radiology/opd-orders/_components/radiology-order-detail-drawer.tsx
"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
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
  Upload,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import { FormButton } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { RadioGroup } from "@/components/forms/radio-group";
import { PillButton } from "@/components/forms/pill-button";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type {
  RadiologyOPDOrder,
  RadiologyOrderStatus,
  RadiologyPaymentMethod,
  RadiologyTestItem,
} from "@/types/lab/radiology/radiology-opd-types";
import { getTotalRadiologyValue } from "@/lib/lab/radiology/radiology-opd-orders-data";
import {
  RadiologyPaymentStatusBadge,
  RadiologyTestStatusBadge,
} from "./radiology-status-badges";

interface Props {
  order: RadiologyOPDOrder | null;
  onClose: () => void;
  onUpdateTest: (orderId: string, test: RadiologyTestItem) => void;
  onCollectPayment: (orderId: string, method: RadiologyPaymentMethod) => void;
  inline?: boolean;
}

const statusFlow: RadiologyOrderStatus[] = [
  "Ordered",
  "Processing",
  "Report Ready",
];

const STATUS_TONE: Record<RadiologyOrderStatus, string> = {
  Ordered: "border-slate-200 bg-slate-50 text-slate-700",
  Processing: "border-cyan-200 bg-cyan-50 text-cyan-700",
  "Report Ready": "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function RadiologyOrderDetailDrawer({
  order,
  onClose,
  onUpdateTest,
  onCollectPayment,
  inline = false,
}: Props) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState<RadiologyPaymentMethod>("Cash");
  useEffect(() => {
    setPaymentOpen(false);
  }, [order]);
  if (!order) return null;
  const selectedOrder = order;

  function updateStatus(test: RadiologyTestItem, status: RadiologyOrderStatus) {
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
    test: RadiologyTestItem,
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

  const totalValue = getTotalRadiologyValue(selectedOrder);

  const content = (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-sm">
            <ScanLine className="h-6 w-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold tracking-tight text-slate-800">
                Radiology OPD Order
              </p>
              <RadiologyPaymentStatusBadge status={selectedOrder.paymentStatus} />
            </div>
            <p className="text-xs text-slate-500">
              {selectedOrder.id} · {selectedOrder.appointmentId}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTileCard
          title="Patient Details"
          icon={<UserRound className="h-3.5 w-3.5" />}
          tone="blue"
          value={selectedOrder.patient.name}
          subtitle={`${selectedOrder.patient.age} yrs · ${selectedOrder.patient.gender} · ${selectedOrder.patient.uhid}`}
          multiline
        />
        <InfoTileCard
          title="Ordering Doctor"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          tone="purple"
          value={selectedOrder.doctor.name}
          subtitle={`${selectedOrder.doctor.specialty} · Reg. No. ${selectedOrder.doctor.registrationNumber}`}
          multiline
        />
        <InfoTileCard
          title="Mobile"
          tone="cyan"
          value={selectedOrder.patient.mobile}
        />
        <InfoTileCard
          title="Total Test Value"
          icon={<IndianRupee className="h-3.5 w-3.5" />}
          tone="emerald"
          value={`₹${totalValue.toLocaleString("en-IN")}`}
          subtitle={`${selectedOrder.tests.length} tests`}
        />
      </div>

      {selectedOrder.patient.diagnosis && (
        <InfoAlertCard
          tone="blue"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          title="Diagnosis / Clinical Indication"
          body={selectedOrder.patient.diagnosis}
        />
      )}

      {selectedOrder.patient.allergies.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          title="Known Allergies"
          body={selectedOrder.patient.allergies.join(" · ")}
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-sm">
            <PackageCheck className="h-4 w-4" />
          </span>
          <p className="text-sm font-bold text-slate-800">Ordered Radiology Tests</p>
          <Badge variant="outline" className={STATUS_TONE[selectedOrder.tests[0]?.status ?? "Ordered"]}>
            {selectedOrder.tests[0]?.status ?? "—"}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          Workflow: Ordered → Processing → Report Ready. Report-ready imaging is locked.
        </p>
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
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Total radiology test value</p>
          <p className="text-2xl font-bold text-slate-800">
            ₹{totalValue.toLocaleString("en-IN")}
          </p>
        </div>
        {selectedOrder.paymentStatus === "Paid" ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            Payment collected via {selectedOrder.paymentMethod}
          </div>
        ) : (
          <PillButton icon={CreditCard} onClick={() => setPaymentOpen(true)}>
            Continue Payment
          </PillButton>
        )}
      </div>
    </div>
  );

  if (inline) {
    return <div className="space-y-5">{content}</div>;
  }

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
        <aside className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
          <div className="p-5">{content}</div>
        </aside>
      </div>
      {paymentOpen && (
        <PaymentDrawer
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          total={totalValue}
          method={payment}
          setMethod={setPayment}
          onConfirm={() => {
            onCollectPayment(selectedOrder.id, payment);
            setPaymentOpen(false);
          }}
        />
      )}
    </>
  );
}

function RadiologyTestCard({
  test,
  index,
  onStatusChange,
  onFinalize,
}: {
  test: RadiologyTestItem;
  index: number;
  onStatusChange: (
    test: RadiologyTestItem,
    status: RadiologyOrderStatus,
  ) => void;
  onFinalize: (test: RadiologyTestItem, image?: File, remarks?: string) => void;
}) {
  const [image, setImage] = useState<File | undefined>();
  const [remarks, setRemarks] = useState(test.reportRemarks ?? "");
  const locked = test.status === "Report Ready";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-bold text-slate-800">
            {index + 1}. {test.testName}
          </p>
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
          <SingleSelect
            label="Update Imaging Status"
            value={test.status}
            onChange={(v) => onStatusChange(test, v as RadiologyOrderStatus)}
            options={statusFlow
              .slice(statusFlow.indexOf(test.status))
              .map((s) => ({ value: s, label: s }))}
          />
        </div>
      )}
      {test.status === "Processing" && !locked && (
        <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
          <p className="text-sm font-bold text-slate-800">Upload Radiology Report</p>
          <p className="mt-1 text-xs text-slate-500">
            Upload the imaging report/image. No numerical result or reference range is required for radiology.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Report Image / PDF</p>
              <label className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-500 transition hover:border-cyan-300">
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate">
                  {image ? image.name : "Choose file…"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(event) => setImage(event.target.files?.[0])}
                />
              </label>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">
                Report Remarks (Optional)
              </p>
              <textarea
                rows={2}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Enter radiologist remarks or impression…"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <PillButton
              icon={CheckCircle2}
              disabled={!image && !test.reportImageName}
              onClick={() => onFinalize(test, image, remarks)}
            >
              Upload &amp; Mark Report Ready
            </PillButton>
          </div>
        </div>
      )}
      {locked && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
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
            Report ready at {test.reportReadyAt}. Status is locked and cannot be changed.
          </p>
        </div>
      )}
    </div>
  );
}

function PaymentDrawer({
  open,
  onOpenChange,
  total,
  method,
  setMethod,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  method: RadiologyPaymentMethod;
  setMethod: (method: RadiologyPaymentMethod) => void;
  onConfirm: () => void;
}) {
  const options: Array<{
    value: RadiologyPaymentMethod;
    label: string;
    description: string;
    icon: React.ElementType;
  }> = [
    { value: "Cash", label: "Cash", description: "Collect cash at counter", icon: Banknote },
    { value: "UPI", label: "UPI", description: "QR or UPI application", icon: Smartphone },
    { value: "Card", label: "Card", description: "Debit or credit card", icon: CreditCard },
    { value: "Net Banking", label: "Net Banking", description: "Bank account transfer", icon: Landmark },
  ];
  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={onOpenChange}
      icon={<ScanLine className="h-5 w-5" />}
      title="Collect Radiology Payment"
      description="Select the payment method used by the patient."
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={onConfirm}>
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Collect ₹{total.toLocaleString("en-IN")}
          </FormButton>
        </div>
      }
    >
      <div className="flex items-center justify-between rounded-xl border border-cyan-200 bg-cyan-50/70 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Total Imaging Value
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      </div>

      <DrawerSection
        title="Payment Method"
        caption="Choose one option"
        icon={<CreditCard className="h-4 w-4" />}
      >
        <RadioGroup
          name="radiology-opd-payment-method"
          options={options.map((o) => ({ value: o.value, label: o.label }))}
          value={method}
          onChange={(v) => setMethod(v as RadiologyPaymentMethod)}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = method === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMethod(option.value)}
                className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-2.5 text-left transition ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-cyan-200"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">{option.label}</p>
                <p className="text-[10px] leading-tight text-slate-500">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </DrawerSection>

      <InfoAlertCard
        tone="emerald"
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        title="Audit Trail"
        body="Confirming collection will mark this radiology order as paid and record the selected payment method in the billing audit trail."
      />
    </ConsultationDrawer>
  );
}

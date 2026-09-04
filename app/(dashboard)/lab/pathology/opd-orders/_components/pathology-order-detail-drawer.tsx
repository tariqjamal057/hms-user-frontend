// app/(dashboard)/lab/pathology/opd-orders/_components/pathology-order-detail-drawer.tsx
"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  BedDouble,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileImage,
  FlaskConical,
  IndianRupee,
  Landmark,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  TestTube,
  Upload,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import { FormButton, SuffixedInput } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { RadioGroup } from "@/components/forms/radio-group";
import { PillButton } from "@/components/forms/pill-button";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type {
  PathologyOPDOrder,
  PathologyOrderStatus,
  PathologyPaymentMethod,
  PathologyTestItem,
} from "@/types/lab/pathology/pathology-opd-types";
import { getResultFlag, getTotalTestValue } from "@/lib/lab/pathology/pathology-opd-orders-data";
import {
  PaymentStatusBadge,
  ResultFlagBadge,
  TestStatusBadge,
} from "./pathology-status-badges";

interface Props {
  order: PathologyOPDOrder | null;
  onClose: () => void;
  onUpdateTest: (orderId: string, test: PathologyTestItem) => void;
  onCollectPayment: (orderId: string, method: PathologyPaymentMethod) => void;
  inline?: boolean;
}

const statusFlow: PathologyOrderStatus[] = [
  "Ordered",
  "Sample Collected",
  "Processing",
  "Report Ready",
];

const STATUS_TONE: Record<PathologyOrderStatus, string> = {
  Ordered: "border-slate-200 bg-slate-50 text-slate-700",
  "Sample Collected": "border-cyan-200 bg-cyan-50 text-cyan-700",
  Processing: "border-violet-200 bg-violet-50 text-violet-700",
  "Report Ready": "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function PathologyOrderDetailDrawer({
  order,
  onClose,
  onUpdateTest,
  onCollectPayment,
  inline = false,
}: Props) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState<PathologyPaymentMethod>("Cash");

  useEffect(() => {
    setPaymentOpen(false);
  }, [order]);

  if (!order) return null;
  const selectedOrder = order;

  function updateStatus(test: PathologyTestItem, status: PathologyOrderStatus) {
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
      sampleCollectedAt:
        status === "Sample Collected" ? stamp : test.sampleCollectedAt,
      processingStartedAt:
        status === "Processing" ? stamp : test.processingStartedAt,
    });
  }

  function saveResult(test: PathologyTestItem, value: string, image?: File) {
    const flag = getResultFlag(value, test.referenceRange);
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
      resultValue: value,
      resultFlag: flag,
      reportImageName: image?.name ?? test.reportImageName,
      reportReadyAt: stamp,
    });
  }

  const totalValue = getTotalTestValue(selectedOrder);

  const content = (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-purple-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-sm">
            <FlaskConical className="h-6 w-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold tracking-tight text-slate-800">
                Pathology OPD Order
              </p>
              <PaymentStatusBadge status={selectedOrder.paymentStatus} />
            </div>
            <p className="text-xs text-slate-500">
              {selectedOrder.id} · {selectedOrder.appointmentId}
            </p>
          </div>
        </div>
      </div>

      {/* Patient + Doctor tiles */}
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

      {/* Diagnosis */}
      {selectedOrder.patient.diagnosis && (
        <InfoAlertCard
          tone="blue"
          icon={<Stethoscope className="h-3.5 w-3.5" />}
          title="Diagnosis / Clinical Indication"
          body={selectedOrder.patient.diagnosis}
        />
      )}

      {/* Allergies */}
      {selectedOrder.patient.allergies.length > 0 && (
        <InfoAlertCard
          tone="red"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          title="Known Allergies"
          body={selectedOrder.patient.allergies.join(" · ")}
        />
      )}

      {/* Test workflow */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
            <PackageCheck className="h-4 w-4" />
          </span>
          <p className="text-sm font-bold text-slate-800">Ordered Pathology Tests</p>
          <Badge variant="outline" className={STATUS_TONE[selectedOrder.tests[0]?.status ?? "Ordered"]}>
            {selectedOrder.tests[0]?.status ?? "—"}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          Update the laboratory workflow. A report-ready test is locked from further status changes.
        </p>
        <div className="space-y-3">
          {selectedOrder.tests.map((test, index) => (
            <TestWorkflowCard
              key={test.id}
              test={test}
              index={index}
              onStatusChange={updateStatus}
              onSaveResult={saveResult}
            />
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Total pathology test value</p>
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

function TestWorkflowCard({
  test,
  index,
  onStatusChange,
  onSaveResult,
}: {
  test: PathologyTestItem;
  index: number;
  onStatusChange: (
    test: PathologyTestItem,
    status: PathologyOrderStatus,
  ) => void;
  onSaveResult: (test: PathologyTestItem, value: string, image?: File) => void;
}) {
  const [value, setValue] = useState(test.resultValue ?? "");
  const [image, setImage] = useState<File | undefined>();
  const locked = test.status === "Report Ready";
  const flag = getResultFlag(value, test.referenceRange);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-bold text-slate-800">
            {index + 1}. {test.testName}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {test.category} · Sample: {test.sampleType} · ₹{test.price}
          </p>
        </div>
        <TestStatusBadge status={test.status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 md:grid-cols-3">
        <InfoTileCard title="Normal Range" icon={<TestTube className="h-3.5 w-3.5" />} tone="slate" value={test.referenceRange.normalText} />
        <InfoTileCard title="Unit" tone="slate" value={test.referenceRange.unit} />
        <InfoTileCard title="Current Status" tone="blue" value={test.status} />
      </div>

      {!locked && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <SingleSelect
            label="Update Test Status"
            value={test.status}
            onChange={(v) => onStatusChange(test, v as PathologyOrderStatus)}
            options={statusFlow
              .slice(statusFlow.indexOf(test.status))
              .map((s) => ({ value: s, label: s }))}
          />
          {test.status === "Processing" && (
            <div className="mt-3 flex justify-end">
              <PillButton
                icon={CheckCircle2}
                variant="gradient"
                onClick={() => onStatusChange(test, "Report Ready")}
              >
                Enter Result &amp; Finalize Report
              </PillButton>
            </div>
          )}
        </div>
      )}

      {test.status === "Processing" && !locked && (
        <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
          <p className="text-sm font-bold text-slate-800">Report Result Entry</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <SuffixedInput
              label="Result Value"
              suffix={test.referenceRange.unit}
              value={value}
              onChange={setValue}
              placeholder={`Enter value in ${test.referenceRange.unit}`}
            />
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Auto Interpretation
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {flag ?? "Enter result"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Upload Report Image</p>
              <label className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-500 transition hover:border-violet-300">
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
          </div>
          <div className="mt-3 flex justify-end">
            <PillButton
              icon={CheckCircle2}
              disabled={!value}
              onClick={() => onSaveResult(test, value, image)}
            >
              Save Result &amp; Mark Report Ready
            </PillButton>
          </div>
        </div>
      )}

      {locked && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-emerald-800">
              Final Result: {test.resultValue} {test.referenceRange.unit}
            </p>
            {test.resultFlag && <ResultFlagBadge flag={test.resultFlag} />}
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Report ready at {test.reportReadyAt}
          </p>
          {test.reportImageName && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700">
              <FileImage className="h-3.5 w-3.5" />
              {test.reportImageName}
            </p>
          )}
          <p className="mt-2 text-[11px] text-emerald-700">
            Report finalized and locked. Status cannot be changed further.
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
  method: PathologyPaymentMethod;
  setMethod: (method: PathologyPaymentMethod) => void;
  onConfirm: () => void;
}) {
  const options: Array<{
    value: PathologyPaymentMethod;
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
      icon={<IndianRupee className="h-5 w-5" />}
      title="Collect Pathology Payment"
      description="Select the payment method used by the patient."
      accent="violet"
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
      <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50/70 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Total Test Value
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
          name="pathology-opd-payment-method"
          options={options.map((o) => ({ value: o.value, label: o.label }))}
          value={method}
          onChange={(v) => setMethod(v as PathologyPaymentMethod)}
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
                    ? "border-violet-500 bg-violet-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-violet-200"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-violet-600 text-white"
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
        body="Confirming collection will mark this pathology order as paid and record the selected payment method in the billing audit trail."
      />
    </ConsultationDrawer>
  );
}

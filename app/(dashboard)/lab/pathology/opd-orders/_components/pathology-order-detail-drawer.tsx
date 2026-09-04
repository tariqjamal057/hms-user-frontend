// app/(dashboard)/lab/pathology/opd-orders/_components/pathology-order-detail-drawer.tsx
"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  FileImage,
  FlaskConical,
  IndianRupee,
  Landmark,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  PathologyOPDOrder,
  PathologyOrderStatus,
  PathologyPaymentMethod,
  PathologyTestItem,
} from "@/types/lab/pathology/pathology-opd-types";
import {
  getResultFlag,
  getTotalTestValue,
} from "@/lib/lab/pathology/pathology-opd-orders-data";
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
    const updated: PathologyTestItem = {
      ...test,
      status,
      sampleCollectedAt:
        status === "Sample Collected" ? stamp : test.sampleCollectedAt,
      processingStartedAt:
        status === "Processing" ? stamp : test.processingStartedAt,
    };
    onUpdateTest(selectedOrder.id, updated);
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
  const content = (
    <>
      <main className={inline ? "space-y-5" : "space-y-5 p-5"}>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Info
              title="Patient Details"
              icon={<UserRound className="h-4 w-4 text-blue-600" />}
              lines={[
                selectedOrder.patient.name,
                `${selectedOrder.patient.age} years · ${selectedOrder.patient.gender} · ${selectedOrder.patient.uhid}`,
                selectedOrder.patient.mobile,
              ]}
            />
            <Info
              title="Ordering Doctor"
              icon={<Stethoscope className="h-4 w-4 text-violet-600" />}
              lines={[
                selectedOrder.doctor.name,
                selectedOrder.doctor.specialty,
                `Reg. No. ${selectedOrder.doctor.registrationNumber}`,
              ]}
            />
          </section>
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
                <FlaskConical className="h-5 w-5 text-violet-600" />
                Ordered Pathology Tests
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Update the laboratory workflow. A report-ready test is locked
                from further status changes.
              </p>
            </div>
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
          </section>
        </main>
        <footer className={inline ? "mt-5 border-t border-slate-200 bg-white p-5" : "sticky bottom-0 border-t border-slate-200 bg-white p-5"}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Total pathology test value
              </p>
              <p className="text-2xl font-bold text-slate-800">
                ₹{getTotalTestValue(selectedOrder)}
              </p>
            </div>
            {selectedOrder.paymentStatus === "Paid" ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Payment collected via {selectedOrder.paymentMethod}
              </div>
            ) : (
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => setPaymentOpen(true)}
              >
                <CreditCard className="h-4 w-4" />
                Continue Payment
              </Button>
            )}
          </div>
        </footer>
        {paymentOpen && (
          <PaymentDialog
            total={getTotalTestValue(selectedOrder)}
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
            <h2 className="text-lg font-bold text-slate-800">Pathology OPD Order</h2>
            <PaymentStatusBadge status={selectedOrder.paymentStatus} />
            <span className="text-xs text-slate-500">{selectedOrder.id} · {selectedOrder.appointmentId}</span>
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
              <h2 className="text-lg font-bold text-slate-800">Pathology OPD Order</h2>
              <PaymentStatusBadge status={selectedOrder.paymentStatus} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{selectedOrder.id} · {selectedOrder.appointmentId}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </header>
        {content}
      </aside>
    </div>
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
    <div className="rounded-xl border border-slate-200 p-4">
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
        <Mini label="Normal Range" value={test.referenceRange.normalText} />
        <Mini label="Unit" value={test.referenceRange.unit} />
        <Mini label="Current Status" value={test.status} />
      </div>
      {!locked && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              Update Test Status
            </p>
            <Select
              value={test.status}
              onValueChange={(value) =>
                onStatusChange(test, value as PathologyOrderStatus)
              }
            >
              <SelectTrigger>
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
          {test.status === "Processing" && (
            <div className="flex items-end">
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={() => onStatusChange(test, "Report Ready")}
              >
                Enter Result & Finalize Report
              </Button>
            </div>
          )}
        </div>
      )}
      {test.status === "Processing" && !locked && (
        <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <p className="text-sm font-bold text-slate-800">
            Report Result Entry
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-slate-500">Result Value</p>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter value in ${test.referenceRange.unit}`}
              />
            </div>
            <Mini label="Auto Interpretation" value={flag ?? "Enter result"} />
            <div>
              <p className="mb-1 text-xs text-slate-500">Upload Report Image</p>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setImage(e.target.files?.[0])}
              />
            </div>
          </div>
          <Button
            disabled={!value}
            className="mt-3 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onSaveResult(test, value, image)}
          >
            Save Result & Mark Report Ready
          </Button>
        </div>
      )}
      {locked && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
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

function PaymentDialog({
  total,
  method,
  setMethod,
  onCancel,
  onConfirm,
}: {
  total: number;
  method: PathologyPaymentMethod;
  setMethod: (method: PathologyPaymentMethod) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const paymentOptions: Array<{
    value: PathologyPaymentMethod;
    label: string;
    description: string;
    icon: React.ElementType;
    iconClassName: string;
    selectedClassName: string;
  }> = [
    {
      value: "Cash",
      label: "Cash",
      description: "Collect cash at counter",
      icon: Banknote,
      iconClassName: "bg-emerald-100 text-emerald-600",
      selectedClassName: "border-emerald-500 bg-emerald-50",
    },
    {
      value: "UPI",
      label: "UPI",
      description: "QR or UPI application",
      icon: Smartphone,
      iconClassName: "bg-violet-100 text-violet-600",
      selectedClassName: "border-violet-500 bg-violet-50",
    },
    {
      value: "Card",
      label: "Card",
      description: "Debit or credit card",
      icon: CreditCard,
      iconClassName: "bg-blue-100 text-blue-600",
      selectedClassName: "border-blue-500 bg-blue-50",
    },
    {
      value: "Net Banking",
      label: "Net Banking",
      description: "Bank account transfer",
      icon: Landmark,
      iconClassName: "bg-amber-100 text-amber-600",
      selectedClassName: "border-amber-500 bg-amber-50",
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-cyan-50 to-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <ScanLine className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Collect Radiology Payment
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select the payment method used by the patient.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Total payment card */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Total Imaging Value
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
                  ₹{total.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Payment options */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">
                Payment Method
              </p>

              <span className="text-xs text-slate-400">
                Choose one option
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = method === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMethod(option.value)}
                    className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? `${option.selectedClassName} shadow-sm`
                        : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${option.iconClassName}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {option.label}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {option.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected method */}
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
            <CreditCard className="h-4 w-4 text-sky-600" />

            <p className="text-xs text-slate-600">
              Selected payment method:{" "}
              <span className="font-bold text-slate-800">{method}</span>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

            <p className="text-xs leading-5 text-emerald-800">
              Confirming collection will mark this radiology order as paid and
              record the selected payment method in the billing audit trail.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 p-5">
          <Button
            variant="outline"
            className="flex-1 border-slate-200 bg-white"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={onConfirm}
          >
            <CheckCircle2 className="h-4 w-4" />
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
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

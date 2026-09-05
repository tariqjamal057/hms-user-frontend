// app/(dashboard)/pharmacy/opd/orders/_components/opd-order-dispense-workspace.tsx
"use client";
import { useMemo, useState } from "react";
import {
  Banknote,
  Check,
  CreditCard,
  IndianRupee,
  Landmark,
  PackageCheck,
  Pill,
  ShieldCheck,
  Smartphone,
  Trash2,
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
  DispenseMedicineState,
  PharmacyOPDOrder,
  PharmacyPaymentMethod,
} from "@/types/pharmacy/opd/pharmacy-opd-types";
import {
  getDefaultBatch,
  getMedicineStockStatus,
} from "@/lib/pharmacy/opd/pharmacy-opd-orders-data";
import { StockBadge } from "./pharmacy-order-table";

interface Props {
  order: PharmacyOPDOrder;
  onDelivered: (orderId: string, paymentMethod: PharmacyPaymentMethod) => void;
}

export function OpdOrderDispenseWorkspace({ order, onDelivered }: Props) {
  const [states, setStates] = useState<DispenseMedicineState[]>(() =>
    order.medicines.map((medicine) => {
      const batch = getDefaultBatch(medicine);
      const available = batch?.availableQuantity ?? 0;
      return {
        medicineId: medicine.id,
        selectedBatchId: batch?.id ?? null,
        dispenseQuantity: Math.min(medicine.prescribedQuantity, available),
        status:
          available === 0
            ? "Out of Stock"
            : available < medicine.prescribedQuantity
              ? "Partial"
              : "Available",
        included: available > 0,
      };
    }),
  );
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState<PharmacyPaymentMethod>("Cash");

  const total = useMemo(() => {
    return order.medicines.reduce((sum, medicine) => {
      const state = states.find((row) => row.medicineId === medicine.id);
      const batch = medicine.batches.find(
        (row) => row.id === state?.selectedBatchId,
      );
      return !state?.included || !batch
        ? sum
        : sum + state.dispenseQuantity * batch.unitPrice;
    }, 0);
  }, [order, states]);

  const removedCount = states.filter((s) => !s.included).length;
  const partialCount = states.filter((s) => s.status === "Partial").length;
  const availableCount = states.filter((s) => s.status === "Available").length;
  const outOfStockCount = states.filter((s) => s.status === "Out of Stock").length;

  function update(id: string, patch: Partial<DispenseMedicineState>) {
    setStates((previous) =>
      previous.map((row) =>
        row.medicineId === id ? { ...row, ...patch } : row,
      ),
    );
  }

  function selectBatch(medicineId: string, batchId: string) {
    const medicine = order.medicines.find((row) => row.id === medicineId);
    const batch = medicine?.batches.find((row) => row.id === batchId);
    if (!medicine || !batch) return;
    update(medicineId, {
      selectedBatchId: batchId,
      dispenseQuantity: Math.min(
        medicine.prescribedQuantity,
        batch.availableQuantity,
      ),
      status:
        batch.availableQuantity === 0
          ? "Out of Stock"
          : batch.availableQuantity < medicine.prescribedQuantity
            ? "Partial"
            : "Available",
      included: batch.availableQuantity > 0,
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <Pill className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Medicines to Dispense
            </p>
            <p className="text-xs text-slate-500">
              Nearest-expiry available batch is selected by default (FEFO).
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          {order.medicines.length} items
        </span>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Total Items"
          icon={<Pill className="h-3.5 w-3.5" />}
          tone="blue"
          value={String(order.medicines.length)}
          subtitle="Prescribed"
        />
        <InfoTileCard
          title="Available"
          tone="emerald"
          value={String(availableCount)}
          subtitle="Full stock"
        />
        <InfoTileCard
          title="Partial"
          tone="amber"
          value={String(partialCount)}
          subtitle="Short stock"
        />
        <InfoTileCard
          title="Out of Stock"
          tone="red"
          value={String(outOfStockCount)}
          subtitle={`${removedCount} removed from bill`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {order.medicines.map((medicine, index) => {
            const state = states.find((row) => row.medicineId === medicine.id);
            const selectedBatch = medicine.batches.find(
              (batch) => batch.id === state?.selectedBatchId,
            );
            const removed = !state?.included;
            const partial = state?.status === "Partial";
            return (
              <div
                key={medicine.id}
                className={`rounded-2xl border p-4 transition ${
                  removed
                    ? "border-slate-200 bg-slate-50 opacity-60"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{index + 1}.</span>
                      <p
                        className={`font-bold ${
                          removed ? "line-through text-slate-500" : "text-slate-800"
                        }`}
                      >
                        {medicine.medicineName}
                      </p>
                      <StockBadge status={getMedicineStockStatus(medicine)} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {medicine.dosage} · {medicine.frequency} · {medicine.duration} · Prescribed: {medicine.prescribedQuantity} units
                    </p>
                  </div>
                  <PillButton
                    icon={Trash2}
                    size="sm"
                    variant={removed ? "outline" : "danger"}
                    onClick={() =>
                      update(medicine.id, { included: !state?.included })
                    }
                  >
                    {removed ? "Restore" : "Remove"}
                  </PillButton>
                </div>
                {!removed && (
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <SingleSelect
                        label="Select Batch (FEFO)"
                        value={state?.selectedBatchId ?? ""}
                        onChange={(value) => selectBatch(medicine.id, value)}
                        options={medicine.batches.map((batch) => ({
                          value: batch.id,
                          label:
                            batch.availableQuantity === 0
                              ? `Batch ${batch.batchNumber} · OUT OF STOCK`
                              : `Batch ${batch.batchNumber} · Stock ${batch.availableQuantity} · Exp ${batch.expiryDate}`,
                        }))}
                      />
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Rack / Shelf
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">
                        {selectedBatch
                          ? `${selectedBatch.rackNumber} / ${selectedBatch.shelfNumber}`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Expiry
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">
                        {selectedBatch?.expiryDate ?? "—"}
                      </p>
                    </div>
                    <SuffixedInput
                      label="Dispense Quantity"
                      suffix="units"
                      type="number"
                      value={String(state?.dispenseQuantity ?? 0)}
                      onChange={(v) =>
                        update(medicine.id, {
                          dispenseQuantity: Math.min(
                            Math.max(0, Number(v)),
                            selectedBatch?.availableQuantity ?? 0,
                          ),
                        })
                      }
                    />
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Unit Price
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">
                        {selectedBatch ? `₹${selectedBatch.unitPrice}` : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Line Total
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">
                        ₹
                        {selectedBatch
                          ? (
                              (state?.dispenseQuantity ?? 0) *
                              selectedBatch.unitPrice
                            ).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                    <div className="flex items-end">
                      <Badge
                        className={
                          partial
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }
                      >
                        {partial
                          ? `Partial: ${state?.dispenseQuantity}/${medicine.prescribedQuantity}`
                          : "Full quantity available"}
                      </Badge>
                    </div>
                  </div>
                )}
                {removed && (
                  <p className="mt-3 text-xs font-medium text-red-600">
                    Removed from billing. This medicine remains visible for audit.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action footer */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Payable for selected medicines</p>
          <p className="text-2xl font-bold text-slate-800">₹{total.toFixed(2)}</p>
        </div>
        {order.status === "Delivered" ? (
          <InfoAlertCard
            tone="emerald"
            icon={<Check className="h-3.5 w-3.5" />}
            title="Delivered"
            body={`Order delivered on ${order.deliveredAt}.`}
          />
        ) : (
          <PillButton
            icon={CreditCard}
            disabled={total <= 0}
            onClick={() => setPaymentOpen(true)}
          >
            Continue to Payment
          </PillButton>
        )}
      </div>

      <PaymentDrawer
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={total}
        payment={payment}
        setPayment={setPayment}
        onConfirm={() => {
          onDelivered(order.id, payment);
          setPaymentOpen(false);
        }}
      />
    </div>
  );
}

function PaymentDrawer({
  open,
  onOpenChange,
  total,
  payment,
  setPayment,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  payment: PharmacyPaymentMethod;
  setPayment: (payment: PharmacyPaymentMethod) => void;
  onConfirm: () => void;
}) {
  const options: Array<{
    value: PharmacyPaymentMethod;
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
      icon={<PackageCheck className="h-5 w-5" />}
      title="Collect Pharmacy Payment"
      description="Select the patient's payment method to dispatch medicines."
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={onConfirm} disabled={total <= 0}>
            <Check className="mr-1 h-4 w-4" />
            Collect &amp; Deliver
          </FormButton>
        </div>
      }
    >
      <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Total Medicine Value
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
            ₹{total.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Includes selected medicines and approved partial quantities.
          </p>
        </div>
        <IndianRupee className="h-8 w-8 text-emerald-500" />
      </div>

      <DrawerSection
        title="Payment Method"
        caption="Select one option"
        icon={<CreditCard className="h-4 w-4" />}
      >
        <RadioGroup
          name="opd-payment-method"
          options={options.map((o) => ({ value: o.value, label: o.label }))}
          value={payment}
          onChange={(v) => setPayment(v as PharmacyPaymentMethod)}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = payment === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPayment(option.value)}
                className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-2.5 text-left transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-blue-600 text-white"
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
        body="Confirming payment will mark the order as paid, record the payment method, and mark all selected medicines as dispatched and delivered to the patient."
      />
    </ConsultationDrawer>
  );
}

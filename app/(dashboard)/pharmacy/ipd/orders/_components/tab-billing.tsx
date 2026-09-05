// app/(dashboard)/pharmacy/ipd/orders/_components/tab-billing.tsx
"use client";
import { useState } from "react";
import {
  Banknote,
  BadgePercent,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Landmark,
  PackageCheck,
  Pill,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { PillButton } from "@/components/forms/pill-button";
import type {
  PharmacyIpdOrder,
  PharmacyPaymentMethod,
} from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";
import {
  PHARMACY_IPD_DIRECT_PAYMENT_ENABLED,
  getBalanceDueValue,
  getDiscountTotalValue,
  getMedicinesGrossValue,
  getNetPayableValue,
  getReturnsTotalValue,
  getTotalPaidValue,
} from "@/lib/pharmacy/ipd/pharmacy-ipd-order-data";
import { BillSentBadge, PaymentBadge } from "./pharmacy-ipd-badges";
import { PharmacyPaymentDialog } from "./pharmacy-payment-dialog";
import { PharmacyDiscountDialog } from "./pharmacy-discount-dialog";

const methodIcon: Record<PharmacyPaymentMethod, React.ElementType> = {
  Cash: Banknote,
  UPI: Smartphone,
  Card: CreditCard,
  "Net Banking": Landmark,
};

interface Props {
  order: PharmacyIpdOrder;
  onAddPayments: (lines: Array<{ method: PharmacyPaymentMethod; amount: number }>) => void;
  onAddDiscount: (percentage: number, amount: number, reason: string) => void;
  onSendToBillingDept: () => void;
}

export function TabBilling({
  order,
  onAddPayments,
  onAddDiscount,
  onSendToBillingDept,
}: Props) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);

  const gross = getMedicinesGrossValue(order);
  const returns = getReturnsTotalValue(order);
  const discount = getDiscountTotalValue(order);
  const netPayable = getNetPayableValue(order);
  const totalPaid = getTotalPaidValue(order);
  const balanceDue = getBalanceDueValue(order);
  const billSent = Boolean(order.billSentToBillingDeptAt);
  const grossAfterReturns = gross - returns;

  const discountColumns: DataColumn<typeof order.discounts[number]>[] = [
    {
      key: "reason",
      label: "Reason",
      render: (d) => (
        <span className="line-clamp-2 max-w-[360px] text-sm text-slate-700">
          {d.reason}
        </span>
      ),
    },
    {
      key: "percentage",
      label: "Discount %",
      align: "center",
      render: (d) => (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
          <BadgePercent className="h-3 w-3" />
          {d.percentage}%
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (d) => (
        <span className="font-bold text-amber-700">
          − ₹{d.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "givenBy",
      label: "Given By",
      render: (d) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{d.givenBy}</p>
          <p className="text-[10px] text-slate-400">
            {d.givenByRole} · {d.givenOn}
          </p>
        </div>
      ),
    },
  ];

  const paymentColumns: DataColumn<typeof order.payments[number]>[] = [
    {
      key: "method",
      label: "Method",
      render: (p) => {
        const Icon = methodIcon[p.method];
        return (
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800">
              {p.method}
              {p.reference ? ` · ${p.reference}` : ""}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (p) => (
        <span className="font-bold text-emerald-700">₹{p.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "receivedBy",
      label: "Received By",
      render: (p) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{p.receivedBy}</p>
          <p className="text-[10px] text-slate-400">{p.receivedOn}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Pharmacy Billing
            </p>
            <p className="text-xs text-slate-500">
              {order.patientName} ·{" "}
              <span className="font-mono text-slate-700">{order.id}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PaymentBadge status={order.paymentStatus} />
          {billSent && <BillSentBadge />}
          {!PHARMACY_IPD_DIRECT_PAYMENT_ENABLED && (
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 text-slate-500"
            >
              Direct payment disabled
            </Badge>
          )}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoTileCard
          title="Medicines Gross"
          icon={<Pill className="h-3.5 w-3.5" />}
          tone="blue"
          value={`₹${gross.toFixed(2)}`}
          subtitle="Before adjustments"
        />
        <InfoTileCard
          title="Returns"
          tone="amber"
          value={`− ₹${returns.toFixed(2)}`}
          subtitle="Returned to stock"
        />
        <InfoTileCard
          title="Discount"
          icon={<BadgePercent className="h-3.5 w-3.5" />}
          tone="rose"
          value={`− ₹${discount.toFixed(2)}`}
          subtitle={`${order.discounts.length} applied`}
        />
        <InfoTileCard
          title="Net Payable"
          icon={<IndianRupee className="h-3.5 w-3.5" />}
          tone="purple"
          value={`₹${netPayable.toFixed(2)}`}
          subtitle="After all adjustments"
        />
        <InfoTileCard
          title="Total Paid"
          tone="emerald"
          value={`₹${totalPaid.toFixed(2)}`}
          subtitle={`${order.payments.length} payments`}
        />
        <InfoTileCard
          title="Balance Due"
          icon={<CreditCard className="h-3.5 w-3.5" />}
          tone={balanceDue > 0 ? "red" : "emerald"}
          value={`₹${balanceDue.toFixed(2)}`}
          subtitle={balanceDue > 0 ? "Outstanding" : "Fully settled"}
        />
      </div>

      {/* Discounts section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200">
              <BadgePercent className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-bold text-slate-800">Discounts</p>
          </div>
          {PHARMACY_IPD_DIRECT_PAYMENT_ENABLED && balanceDue > 0 && (
            <PillButton
              icon={BadgePercent}
              size="sm"
              variant="outline"
              onClick={() => setDiscountOpen(true)}
            >
              Add Discount
            </PillButton>
          )}
        </div>
        {order.discounts.length === 0 ? (
          <InfoAlertCard
            tone="slate"
            icon={<BadgePercent className="h-3.5 w-3.5" />}
            title="No discounts applied"
            body="No discounts have been applied to this order yet."
          />
        ) : (
          <DataTable
            rows={order.discounts}
            columns={discountColumns}
            rowKey={(d) => d.id}
            countLabel="discounts"
            emptyText="No discounts applied to this order."
          />
        )}
      </div>

      {/* Payments section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200">
              <IndianRupee className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-bold text-slate-800">Payment History</p>
          </div>
          {PHARMACY_IPD_DIRECT_PAYMENT_ENABLED && balanceDue > 0 && !billSent && (
            <PillButton
              icon={IndianRupee}
              size="sm"
              onClick={() => setPaymentOpen(true)}
            >
              Collect Payment
            </PillButton>
          )}
        </div>
        {order.payments.length === 0 ? (
          <InfoAlertCard
            tone="slate"
            icon={<Wallet className="h-3.5 w-3.5" />}
            title="No payments received"
            body="No payments have been received yet for this order."
          />
        ) : (
          <DataTable
            rows={order.payments}
            columns={paymentColumns}
            rowKey={(p) => p.id}
            countLabel="payments"
            emptyText="No payments received yet."
          />
        )}
      </div>

      {/* Send to billing dept */}
      {!PHARMACY_IPD_DIRECT_PAYMENT_ENABLED && !billSent && (
        <InfoAlertCard
          tone="blue"
          icon={<PackageCheck className="h-3.5 w-3.5" />}
          title="Direct payment disabled hospital-wide"
          body="Deliver the medicines and forward the full bill to the IPD Billing Department."
          action={
            <PillButton
              icon={PackageCheck}
              disabled={netPayable <= 0}
              onClick={onSendToBillingDept}
            >
              Send Bill to Billing Dept. (₹{netPayable.toFixed(2)})
            </PillButton>
          }
        />
      )}

      {billSent && (
        <InfoAlertCard
          tone="blue"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          title="Bill forwarded"
          body={`Bill of ₹${netPayable.toFixed(2)} sent to IPD Billing Department on ${order.billSentToBillingDeptAt}.`}
        />
      )}

      {order.paymentStatus === "Paid" && (
        <InfoAlertCard
          tone="emerald"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          title="Fully paid"
          body={`Full payment of ₹${netPayable.toFixed(2)} has been collected.`}
        />
      )}

      <PharmacyPaymentDialog
        open={paymentOpen}
        balanceDue={balanceDue}
        onCancel={() => setPaymentOpen(false)}
        onConfirm={(lines) => {
          onAddPayments(lines);
          setPaymentOpen(false);
        }}
      />
      <PharmacyDiscountDialog
        open={discountOpen}
        netPayableBeforeDiscount={grossAfterReturns}
        onCancel={() => setDiscountOpen(false)}
        onConfirm={(percentage, amount, reason) => {
          onAddDiscount(percentage, amount, reason);
          setDiscountOpen(false);
        }}
      />
    </div>
  );
}

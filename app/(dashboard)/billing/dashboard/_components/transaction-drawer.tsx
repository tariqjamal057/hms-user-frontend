// app/(dashboard)/billing/dashboard/_components/transaction-drawer.tsx
"use client";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  Banknote,
  Check,
  FileMinus,
  PiggyBank,
  RefreshCcw,
  X,
} from "lucide-react";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import { FormButton, SuffixedInput } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import type {
  DepositRecord,
  DiscountEntry,
  PaymentMethod,
  PaymentRecord,
  RefundRecord,
} from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

export type TxnKind = "Payment" | "Deposit" | "Refund" | "Adjustment" | "Write-Off";

export type TransactionResult =
  | { kind: "Payment"; payment: PaymentRecord }
  | { kind: "Deposit"; deposit: DepositRecord }
  | { kind: "Refund"; refund: RefundRecord }
  | { kind: "Discount"; discount: DiscountEntry };

const TXN_KINDS: { value: TxnKind; label: string; icon: typeof Banknote }[] = [
  { value: "Payment", label: "Patient Payment", icon: Banknote },
  { value: "Deposit", label: "Advance Deposit", icon: PiggyBank },
  { value: "Refund", label: "Refund", icon: RefreshCcw },
  { value: "Adjustment", label: "Adjustment", icon: ArrowLeftRight },
  { value: "Write-Off", label: "Write-off", icon: FileMinus },
];

const METHODS: PaymentMethod[] = ["Cash", "Card", "UPI", "Net Banking"];

const REQUIRES_METHOD: TxnKind[] = ["Payment", "Deposit", "Refund"];

interface Props {
  open: boolean;
  dueAmount: number;
  onCancel: () => void;
  onSubmit: (result: TransactionResult) => void;
}

export function TransactionDrawer({ open, dueAmount, onCancel, onSubmit }: Props) {
  const [kind, setKind] = useState<TxnKind>("Payment");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [party, setParty] = useState("");
  const [reason, setReason] = useState("");
  const [actor, setActor] = useState("Billing Desk");

  function reset() {
    setKind("Payment");
    setAmount("");
    setMethod("Cash");
    setParty("");
    setReason("");
    setActor("Billing Desk");
  }

  function handleOpenChange(next: boolean) {
    if (next && !open) reset();
    onCancel();
    void next;
  }

  const amountNumber = Number(amount) || 0;
  const needsMethod = REQUIRES_METHOD.includes(kind);
  const isCashIn = kind === "Payment" || kind === "Deposit";
  const valid =
    amountNumber > 0 &&
    (!needsMethod || Boolean(method)) &&
    (!isCashIn || Boolean(party.trim()));

  function handleSubmit() {
    if (!valid) return;
    const stamp = new Date();
    const dateIso = stamp.toISOString().slice(0, 10);
    const dateTime = stamp.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (kind === "Payment") {
      onSubmit({
        kind: "Payment",
        payment: {
          id: `P-${Date.now()}`,
          date: dateIso,
          dateTime,
          partyName: party.trim(),
          relationToPatient: "Self",
          totalAmount: amountNumber,
          methods: [{ method, amount: amountNumber }],
          collectedBy: actor,
        },
      });
      return;
    }
    if (kind === "Deposit") {
      onSubmit({
        kind: "Deposit",
        deposit: {
          id: `DP-${Date.now()}`,
          date: dateIso,
          dateTime,
          amount: amountNumber,
          method,
          source: "Advance",
          collectedBy: actor,
          reference: reason.trim() || "Advance against final bill",
        },
      });
      return;
    }
    if (kind === "Refund") {
      onSubmit({
        kind: "Refund",
        refund: {
          id: `RF-${Date.now()}`,
          date: dateIso,
          amount: amountNumber,
          reason: reason.trim() || "Refund requested",
          method,
          status: "Pending",
          refundedTo: party.trim() || "Patient",
          processedBy: actor,
        },
      });
      return;
    }
    onSubmit({
      kind: "Discount",
      discount: {
        id: `D-${Date.now()}`,
        date: dateIso,
        percentage: 0,
        amountDeducted: amountNumber,
        givenBy: actor,
        reason:
          kind === "Write-Off"
            ? reason.trim() || "Write-off adjustment"
            : reason.trim() || "Manual adjustment",
      },
    });
  }

  const selectedMeta = useMemo(
    () => TXN_KINDS.find((t) => t.value === kind),
    [kind],
  );

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Banknote className="h-5 w-5" />}
      title="New Transaction"
      description="Post a controlled financial transaction"
      accent="violet"
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={handleSubmit} disabled={!valid}>
            <Check className="mr-1 h-4 w-4" />
            Post {formatCurrency(amountNumber)}
          </FormButton>
        </div>
      }
    >
      <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            Outstanding Due
          </p>
          <p className="mt-0.5 text-2xl font-bold text-indigo-800">
            {formatCurrency(dueAmount)}
          </p>
        </div>
        {selectedMeta && <selectedMeta.icon className="h-8 w-8 text-indigo-300" />}
      </div>

      <DrawerSection
        title="Transaction Details"
        caption="Type, amount and settlement channel"
        icon={<ArrowLeftRight className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-3">
          <SingleSelect
            label="Transaction Type"
            value={kind}
            onChange={(v) => setKind(v as TxnKind)}
            options={TXN_KINDS.map((t) => ({ value: t.value, label: t.label }))}
          />
          <SuffixedInput
            label="Amount"
            type="number"
            suffix="₹"
            value={amount}
            onChange={setAmount}
            placeholder="0"
          />
          {needsMethod && (
            <SingleSelect
              label="Payment Method"
              value={method}
              onChange={(v) => setMethod(v as PaymentMethod)}
              options={METHODS.map((m) => ({ value: m, label: m }))}
            />
          )}
          {isCashIn && (
            <SuffixedInput
              label={kind === "Deposit" ? "Deposited By" : "Paid By (Party Name)"}
              value={party}
              onChange={setParty}
              placeholder={kind === "Deposit" ? "e.g. Manoj Yadav" : "e.g. Suresh Sharma"}
            />
          )}
          {kind === "Refund" && (
            <SuffixedInput
              label="Refund To"
              value={party}
              onChange={setParty}
              placeholder="e.g. Sunita Sharma"
            />
          )}
        </div>
      </DrawerSection>

      <DrawerSection
        title="Reference & Remarks"
        caption="Reasons recorded in the audit trail"
        icon={<PiggyBank className="h-4 w-4" />}
      >
        <SuffixedInput
          label="Reason / Remarks"
          value={reason}
          onChange={setReason}
          placeholder="e.g. Final settlement, advance deposit, co-pay reversal"
        />
        <div className="mt-3">
          <SuffixedInput
            label="Processed By"
            value={actor}
            onChange={setActor}
            placeholder="e.g. Billing Desk"
          />
        </div>
      </DrawerSection>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        High-value refunds, discounts and write-offs trigger the approval
        workflow before they are finalized.
      </div>
    </ConsultationDrawer>
  );
}
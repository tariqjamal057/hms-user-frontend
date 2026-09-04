// app/(dashboard)/billing/ipd/_components/drawer/collect-payment-modal.tsx
"use client";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  Check,
  Plus,
  Receipt,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import {
  FormButton,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { PillButton } from "@/components/forms/pill-button";
import type {
  PaymentMethod,
  PaymentMethodSplit,
  PaymentRecord,
} from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

const METHODS: PaymentMethod[] = ["Cash", "Card", "UPI", "Net Banking"];
const RELATIONS = [
  "Self",
  "Spouse",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Father",
  "Mother",
  "Other Relative",
];

const METHOD_TONE: Record<PaymentMethod, string> = {
  Cash: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Card: "border-blue-200 bg-blue-50 text-blue-700",
  UPI: "border-purple-200 bg-purple-50 text-purple-700",
  "Net Banking": "border-amber-200 bg-amber-50 text-amber-700",
};

interface Props {
  open: boolean;
  dueAmount: number;
  onCancel: () => void;
  onCollect: (payment: PaymentRecord) => void;
}

interface DraftSplit {
  id: string;
  method: PaymentMethod;
  amount: string;
}

export function CollectPaymentModal({
  open,
  dueAmount,
  onCancel,
  onCollect,
}: Props) {
  const [partyName, setPartyName] = useState("");
  const [relation, setRelation] = useState("Self");
  const [collectedBy, setCollectedBy] = useState("Billing Desk");
  const [splits, setSplits] = useState<DraftSplit[]>([
    { id: "s1", method: "Cash", amount: "" },
  ]);

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setPartyName("");
      setRelation("Self");
      setCollectedBy("Billing Desk");
      setSplits([{ id: "s1", method: "Cash", amount: "" }]);
    }
    onCancel();
    void next;
  }

  const totalEntered = useMemo(
    () => splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0),
    [splits],
  );
  const remainingAfter = Math.max(0, dueAmount - totalEntered);
  const exceedsDue = totalEntered > dueAmount;
  const valid =
    partyName.trim() &&
    totalEntered > 0 &&
    !exceedsDue &&
    splits.every((s) => s.method && Number(s.amount) >= 0);

  function addSplit() {
    const usedMethods = splits.map((s) => s.method);
    const nextMethod = METHODS.find((m) => !usedMethods.includes(m)) ?? "Cash";
    setSplits((previous) => [
      ...previous,
      { id: `s${Date.now()}`, method: nextMethod, amount: "" },
    ]);
  }
  function updateSplit(id: string, patch: Partial<DraftSplit>) {
    setSplits((previous) =>
      previous.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }
  function removeSplit(id: string) {
    setSplits((previous) =>
      previous.length > 1 ? previous.filter((s) => s.id !== id) : previous,
    );
  }

  function handleCollect() {
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
    const methods: PaymentMethodSplit[] = splits
      .filter((s) => Number(s.amount) > 0)
      .map((s) => ({ method: s.method, amount: Number(s.amount) }));
    onCollect({
      id: `P-${Date.now()}`,
      date: dateIso,
      dateTime,
      partyName: partyName.trim(),
      relationToPatient: relation,
      totalAmount: totalEntered,
      methods,
      collectedBy,
    });
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Banknote className="h-5 w-5" />}
      title="Collect Payment"
      description="Record a payment against the patient's outstanding bill"
      accent="violet"
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton
            variant="outline"
            className="flex-1"
            onClick={() => onCancel()}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton
            className="flex-1"
            onClick={handleCollect}
            disabled={!valid}
          >
            <Check className="mr-1 h-4 w-4" />
            Collect {formatCurrency(totalEntered)}
          </FormButton>
        </div>
      }
    >
      {/* Due amount banner */}
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Outstanding Due
          </p>
          <p className="mt-0.5 text-2xl font-bold text-red-700">
            {formatCurrency(dueAmount)}
          </p>
        </div>
        <Wallet className="h-8 w-8 text-red-300" />
      </div>

      {/* Payer details */}
      <DrawerSection
        title="Payer Details"
        caption="Who is making this payment?"
        icon={<User className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SuffixedInput
            label="Paid By (Party Name) *"
            value={partyName}
            onChange={setPartyName}
            placeholder="e.g. Suresh Sharma"
          />
          <SingleSelect
            label="Relation to Patient"
            value={relation}
            onChange={setRelation}
            options={RELATIONS.map((r) => ({ value: r, label: r }))}
          />
        </div>
        <SuffixedInput
          label="Collected By"
          value={collectedBy}
          onChange={setCollectedBy}
          placeholder="e.g. Billing Desk"
        />
      </DrawerSection>

      {/* Payment splits */}
      <DrawerSection
        title="Payment Split by Method"
        caption="Split the payment across multiple methods if needed"
        icon={<Receipt className="h-4 w-4" />}
        action={
          <PillButton
            icon={Plus}
            size="sm"
            onClick={addSplit}
            disabled={splits.length >= METHODS.length}
          >
            Add Method
          </PillButton>
        }
      >
        <div className="space-y-2.5">
          {splits.map((split, idx) => (
            <div
              key={split.id}
              className="flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5"
            >
              <div className="w-32 shrink-0">
                <SingleSelect
                  label={idx === 0 ? "Method" : ""}
                  value={split.method}
                  onChange={(v) =>
                    updateSplit(split.id, { method: v as PaymentMethod })
                  }
                  options={METHODS.map((m) => ({ value: m, label: m }))}
                />
              </div>
              <div className="flex-1">
                <SuffixedInput
                  label={idx === 0 ? "Amount" : ""}
                  type="number"
                  suffix="₹"
                  value={split.amount}
                  onChange={(v) => updateSplit(split.id, { amount: v })}
                  placeholder="0"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSplit(split.id)}
                disabled={splits.length === 1}
                className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Remove split"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Live summary */}
        <div className="mt-2 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Total Entered</span>
            <span className="font-bold text-slate-800">
              {formatCurrency(totalEntered)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Remaining Due After This Payment</span>
            <span
              className={`font-bold ${remainingAfter > 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              {formatCurrency(remainingAfter)}
            </span>
          </div>
        </div>

        {exceedsDue && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Entered amount exceeds the due amount. Please adjust the split.
          </div>
        )}

        {/* Selected method summary */}
        {splits.some((s) => Number(s.amount) > 0) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {splits
              .filter((s) => Number(s.amount) > 0)
              .map((s) => (
                <Badge
                  key={s.id}
                  variant="outline"
                  className={METHOD_TONE[s.method]}
                >
                  {s.method}: {formatCurrency(Number(s.amount))}
                </Badge>
              ))}
          </div>
        )}
      </DrawerSection>
    </ConsultationDrawer>
  );
}

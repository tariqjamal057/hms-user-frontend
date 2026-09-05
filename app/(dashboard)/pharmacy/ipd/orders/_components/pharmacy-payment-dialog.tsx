// app/(dashboard)/pharmacy/ipd/orders/_components/pharmacy-payment-dialog.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  Check,
  CreditCard,
  IndianRupee,
  Landmark,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
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
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { PharmacyPaymentMethod } from "@/types/pharmacy/ipd/pharmacy-ipd-order-types";

interface SplitLine {
  id: string;
  method: PharmacyPaymentMethod;
  amount: string;
}

interface Props {
  open: boolean;
  balanceDue: number;
  onCancel: () => void;
  onConfirm: (lines: Array<{ method: PharmacyPaymentMethod; amount: number }>) => void;
}

const METHODS: PharmacyPaymentMethod[] = ["Cash", "UPI", "Card", "Net Banking"];

const methodMeta: Record<PharmacyPaymentMethod, { icon: React.ElementType; tone: string }> = {
  Cash: { icon: Banknote, tone: "bg-emerald-100 text-emerald-600" },
  UPI: { icon: Smartphone, tone: "bg-violet-100 text-violet-600" },
  Card: { icon: CreditCard, tone: "bg-blue-100 text-blue-600" },
  "Net Banking": { icon: Landmark, tone: "bg-amber-100 text-amber-600" },
};

export function PharmacyPaymentDialog({
  open,
  balanceDue,
  onCancel,
  onConfirm,
}: Props) {
  const [lines, setLines] = useState<SplitLine[]>([
    { id: "L1", method: "Cash", amount: "" },
  ]);

  useEffect(() => {
    if (open) {
      setLines([{ id: "L1", method: "Cash", amount: "" }]);
    }
  }, [open]);

  const totalEntered = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [lines],
  );
  const remaining = Math.max(0, balanceDue - totalEntered);
  const overpaid = totalEntered > balanceDue;

  function addLine() {
    setLines((previous) => [
      ...previous,
      {
        id: `L${previous.length + 1}-${Date.now()}`,
        method: "Cash",
        amount: "",
      },
    ]);
  }

  function removeLine(id: string) {
    setLines((previous) => previous.filter((line) => line.id !== id));
  }

  function updateLine(id: string, patch: Partial<SplitLine>) {
    setLines((previous) =>
      previous.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  }

  function fillRemaining() {
    setLines((previous) =>
      previous.map((line, index) =>
        index === previous.length - 1
          ? { ...line, amount: String(remaining + (Number(line.amount) || 0)) }
          : line,
      ),
    );
  }

  function handleConfirm() {
    const validLines = lines
      .map((line) => ({ method: line.method, amount: Number(line.amount) || 0 }))
      .filter((line) => line.amount > 0);
    if (validLines.length === 0) return;
    onConfirm(validLines);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      icon={<IndianRupee className="h-5 w-5" />}
      title="Collect Pharmacy Payment"
      description="Split the amount across cash, UPI, card or net banking as the patient party pays."
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton
            className="flex-1"
            disabled={totalEntered <= 0 || overpaid}
            onClick={handleConfirm}
          >
            <Check className="mr-1 h-4 w-4" />
            Confirm Payment{totalEntered > 0 ? ` (₹${totalEntered.toFixed(2)})` : ""}
          </FormButton>
        </div>
      }
    >
      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Balance Due
          </p>
          <p className="mt-1 text-base font-bold text-slate-800">
            ₹{balanceDue.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Entered Now
          </p>
          <p className="mt-1 text-base font-bold text-slate-800">
            ₹{totalEntered.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            {overpaid ? "Excess" : "Remaining"}
          </p>
          <p
            className={`mt-1 text-base font-bold ${
              overpaid ? "text-red-600" : "text-amber-600"
            }`}
          >
            ₹
            {overpaid
              ? (totalEntered - balanceDue).toFixed(2)
              : remaining.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Splits */}
      <DrawerSection
        title="Payment Split"
        caption="Add one line per payment method"
        icon={<CreditCard className="h-4 w-4" />}
        action={
          <PillButton
            icon={Plus}
            size="sm"
            onClick={addLine}
            variant="outline"
          >
            Add Method
          </PillButton>
        }
      >
        <div className="space-y-2.5">
          {lines.map((line, idx) => {
            const Icon = methodMeta[line.method].icon;
            return (
              <div
                key={line.id}
                className="flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg ${methodMeta[line.method].tone}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="w-32 shrink-0">
                  <SingleSelect
                    label={idx === 0 ? "Method" : ""}
                    value={line.method}
                    onChange={(v) =>
                      updateLine(line.id, { method: v as PharmacyPaymentMethod })
                    }
                    options={METHODS.map((m) => ({ value: m, label: m }))}
                  />
                </div>
                <div className="flex-1">
                  <SuffixedInput
                    label={idx === 0 ? "Amount" : ""}
                    suffix="₹"
                    type="number"
                    value={line.amount}
                    onChange={(v) => updateLine(line.id, { amount: v })}
                    placeholder="0"
                  />
                </div>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove split"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <PillButton
          icon={Plus}
          variant="outline"
          size="sm"
          onClick={fillRemaining}
          disabled={remaining <= 0}
        >
          Fill remaining ₹{remaining.toFixed(2)}
        </PillButton>
      </DrawerSection>

      {overpaid && (
        <InfoAlertCard
          tone="red"
          icon={<AlertCircle className="h-3.5 w-3.5" />}
          title="Entered amount exceeds balance"
          body="Reduce one of the split amounts before confirming."
        />
      )}
      {!overpaid && remaining > 0 && totalEntered > 0 && (
        <InfoAlertCard
          tone="amber"
          icon={<AlertCircle className="h-3.5 w-3.5" />}
          title="Partial payment"
          body={`₹${remaining.toFixed(2)} will remain due — the patient party can pay this on a future date.`}
        />
      )}

      <InfoAlertCard
        tone="emerald"
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        title="Audit Trail"
        body="Each entry is recorded separately in the payment ledger with method, amount, date, and the receiving staff member."
      />
    </ConsultationDrawer>
  );
}

// app/(dashboard)/pharmacy/ipd/orders/_components/pharmacy-discount-dialog.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Check, ShieldCheck, X } from "lucide-react";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import {
  FormButton,
  FormTextarea,
  SuffixedInput,
} from "@/components/forms/form-controls";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import { PillButton } from "@/components/forms/pill-button";
import { CURRENT_PHARMACY_STAFF } from "@/lib/pharmacy/ipd/pharmacy-ipd-order-data";

interface Props {
  open: boolean;
  netPayableBeforeDiscount: number;
  onCancel: () => void;
  onConfirm: (percentage: number, amount: number, reason: string) => void;
}

export function PharmacyDiscountDialog({
  open,
  netPayableBeforeDiscount,
  onCancel,
  onConfirm,
}: Props) {
  const [percentage, setPercentage] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setPercentage("");
      setReason("");
    }
  }, [open]);

  const numericPercentage = Number(percentage) || 0;
  const calculatedAmount = useMemo(
    () =>
      Math.round((netPayableBeforeDiscount * numericPercentage) / 100 * 100) /
      100,
    [netPayableBeforeDiscount, numericPercentage],
  );
  const invalid = numericPercentage <= 0 || numericPercentage > 100;
  const netAfter = Math.max(0, netPayableBeforeDiscount - calculatedAmount);

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      icon={<BadgePercent className="h-5 w-5" />}
      title="Apply Discount"
      description="Enter a discount percentage — the amount is calculated automatically."
      accent="violet"
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton variant="outline" className="flex-1" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton
            className="flex-1"
            disabled={invalid || !reason.trim()}
            onClick={() => onConfirm(numericPercentage, calculatedAmount, reason.trim())}
          >
            <Check className="mr-1 h-4 w-4" />
            Apply {numericPercentage || 0}% Discount
          </FormButton>
        </div>
      }
    >
      {/* Eligible banner */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Amount Eligible for Discount
        </p>
        <p className="text-lg font-bold text-slate-800">
          ₹{netPayableBeforeDiscount.toFixed(2)}
        </p>
      </div>

      {/* Discount input */}
      <DrawerSection
        title="Discount Percentage"
        caption="Enter a value between 1 and 100"
        icon={<BadgePercent className="h-4 w-4" />}
      >
        <SuffixedInput
          label="Discount %"
          suffix="%"
          type="number"
          value={percentage}
          onChange={setPercentage}
          placeholder="e.g. 5"
        />
      </DrawerSection>

      {/* Live calculation */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Calculated Discount
          </p>
          <p className="text-2xl font-bold text-amber-700">
            − ₹{calculatedAmount.toFixed(2)}
          </p>
        </div>
        <p className="mt-1 text-xs text-amber-700">
          Net payable after discount: ₹{netAfter.toFixed(2)}
        </p>
      </div>

      {/* Reason */}
      <DrawerSection
        title="Reason for Discount"
        caption="Explain the rationale for the audit trail"
        icon={<ShieldCheck className="h-4 w-4" />}
      >
        <FormTextarea
          label="Reason *"
          value={reason}
          onChange={setReason}
          rows={3}
          maxLength={500}
          placeholder="e.g. Senior citizen discount, long-stay concession…"
        />
      </DrawerSection>

      {/* Authorised by */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Discount Authorized By
        </p>
        <p className="mt-1 text-sm font-bold text-slate-800">
          {CURRENT_PHARMACY_STAFF.name}
        </p>
        <p className="text-xs text-slate-500">
          {CURRENT_PHARMACY_STAFF.role} · {CURRENT_PHARMACY_STAFF.staffId}
        </p>
        <p className="mt-1 text-[10px] text-slate-400">
          Automatically filled from your staff profile.
        </p>
      </div>

      <InfoAlertCard
        tone="emerald"
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        title="Audit Trail"
        body="This discount will be recorded permanently in the billing audit trail along with your name, role, and the percentage applied."
      />
    </ConsultationDrawer>
  );
}

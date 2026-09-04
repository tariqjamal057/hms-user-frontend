"use client";

import { ShieldAlert } from "lucide-react";
import { AlertModal } from "@/components/forms/alert-modal";
import { PillButton } from "@/components/forms/pill-button";

interface AllergyAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allergies: string[];
  patientName: string;
}

export function AllergyAlertDialog({ open, onOpenChange, allergies, patientName }: AllergyAlertDialogProps) {
  return (
    <AlertModal
      open={open}
      onOpenChange={onOpenChange}
      icon={ShieldAlert}
      title="Allergy Safety Review"
      tone="danger"
      description={`Clinical decision support requires acknowledgement for ${patientName}.`}
      footer={
        <PillButton onClick={() => onOpenChange(false)}>
          Acknowledge & Close
        </PillButton>
      }
    >
      {allergies.length > 0 ? (
        <div className="space-y-3">
          {allergies.map((allergy, idx) => (
            <div key={idx} className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">{allergy}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-sm font-medium text-green-800">No known allergies recorded</p>
        </div>
      )}
    </AlertModal>
  );
}
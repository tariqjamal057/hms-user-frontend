//app/doctor/ipd/medicine-orders/_components/clear-all-medicines-dialog.tsx
"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PillButton } from "@/components/forms/pill-button";
import { AlertTriangle } from "lucide-react";

interface ClearAllMedicinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ClearAllMedicinesDialog({ open, onOpenChange, onConfirm }: ClearAllMedicinesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete all medicines?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          Do you want to delete all medicines from the list? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <PillButton variant="outline" onClick={() => onOpenChange(false)}>No</PillButton>
          <PillButton
            variant="danger"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Yes, Delete All
          </PillButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
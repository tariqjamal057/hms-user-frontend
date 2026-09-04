"use client";

import { type ComponentType, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AlertTone = "danger" | "success" | "info";

export type AlertModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: string;
  tone?: AlertTone;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

const ICON_STYLES: Record<AlertTone, string> = {
  danger: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-600",
};

export function AlertModal({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  tone = "info",
  children,
  footer,
  className,
}: AlertModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("!w-[96vw] !max-w-[520px] rounded-2xl", className)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ICON_STYLES[tone])}>
              <Icon aria-hidden className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-0.5 text-sm text-slate-500">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {children && <div className="py-1">{children}</div>}

        {footer && <div className="flex justify-end pt-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
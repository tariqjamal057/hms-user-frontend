"use client";

import { type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PillVariant = "gradient" | "outline" | "danger";

export type PillButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: PillVariant;
  size?: "default" | "sm";
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  disabled?: boolean;
  className?: string;
};

const STYLES: Record<PillVariant, string> = {
  gradient:
    "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/30 hover:text-white hover:from-blue-700 hover:to-cyan-600 active:scale-[0.98]",
  outline:
    "border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 hover:shadow-sm active:translate-y-0",
  danger:
    "border-red-200 bg-white text-red-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-sm active:translate-y-0",
};

export function PillButton({
  children,
  onClick,
  variant = "gradient",
  size = "default",
  icon: Icon,
  disabled = false,
  className,
}: PillButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      size={size}
      variant="ghost"
      disabled={disabled}
      className={cn(
        "transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 hover:scale-105",
        STYLES[variant],
        className,
      )}
    >
      {Icon && <Icon aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover/button:scale-110" />}
      {children}
    </Button>
  );
}
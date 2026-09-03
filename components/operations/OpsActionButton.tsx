"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpsActionButtonProps {
  label?: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "ghost" | "outline" | "default";
  className?: string;
  title?: string;
}

export default function OpsActionButton({
  label = "View",
  icon: Icon,
  onClick,
  variant = "outline",
  className,
  title,
}: OpsActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={label ? "sm" : "icon"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title ?? label}
      className={cn(
        "h-8 gap-1.5 text-xs font-semibold transition-all duration-150 border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
        !label && "w-8 p-0",
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0 group-hover:text-blue-600" />}
      {label && <span>{label}</span>}
    </Button>
  );
}

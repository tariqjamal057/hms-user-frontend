"use client";

import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawerSectionProps = {
  title?: string;
  caption?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

// Card-like grouping block used inside drawer bodies to structure form fields.
export function DrawerSection({
  title,
  caption,
  icon,
  action,
  children,
  className,
}: DrawerSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
              {caption && <p className="mt-0.5 text-[11px] text-slate-400">{caption}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className={cn(title || action ? "pt-3" : "", "space-y-4")}>{children}</div>
    </section>
  );
}

export type ConsultationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accent?: "blue" | "violet";
  meta?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
  widthClass?: string;
};

const ACCENTS: Record<string, { chip: string; icon: string }> = {
  blue: { chip: "bg-gradient-to-br from-blue-600 to-cyan-600 text-white", icon: "" },
  violet: { chip: "bg-gradient-to-br from-violet-600 to-purple-600 text-white", icon: "" },
};

// Unified slide-over drawer used by every "add ..." flow in the consultation
// workspace: icon chip + title on one row with an inline close button, a
// scrollable body, and an optional pinned footer for actions.
export function ConsultationDrawer({
  open,
  onOpenChange,
  title,
  description,
  icon,
  accent = "blue",
  meta,
  children,
  footer,
  bodyClassName,
  widthClass = "md:w-[600px]",
}: ConsultationDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        className={cn("rounded-l-none", widthClass)}
        style={{ width: "min(100vw, 600px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
                  ACCENTS[accent]?.chip ?? ACCENTS.blue.chip,
                )}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800">
                <span className="truncate">{title}</span>
                {meta}
              </h2>
              {description && (
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>

          <DrawerClose
            aria-label="Close drawer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </DrawerClose>
        </div>

        {/* Scrollable body */}
        <div className={cn("flex-1 overflow-y-auto px-5 py-6", bodyClassName)}>{children}</div>

        {/* Sticky footer */}
        {footer && (
          <DrawerFooter className="border-t border-slate-200 bg-white px-5 py-4 shadow-sm">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
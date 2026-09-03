"use client";

import React from "react";
import { MoreVertical, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface OpsActionItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface OpsActionMenuProps {
  items: OpsActionItem[];
  label?: string;
  align?: "end" | "start" | "center";
  className?: string;
}

export default function OpsActionMenu({
  items,
  align = "end",
  className,
}: OpsActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "h-8 w-8 rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800",
            className
          )}
          title="Actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-48 overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-sm"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={idx}
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                item.destructive
                  ? "text-red-600 focus:bg-red-50 focus:text-red-700"
                  : "text-slate-700 focus:bg-blue-50 focus:text-blue-700"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

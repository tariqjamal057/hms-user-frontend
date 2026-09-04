// app/(dashboard)/rmo/ipd/all-patients/_components/drawer/section-fluid-balance.tsx
"use client";
import { Droplets } from "lucide-react";
import type { FluidBalanceEntry } from "@/types/rmo/ipd/rmo-types";
import { CURRENT_RMO } from "@/lib/rmo/ipd/rmo-data";
import { FluidBalanceSection } from "@/components/patient-detail/fluid-balance-section";

export function SectionFluidBalance({ entries, onAddEntry }: { entries: FluidBalanceEntry[]; onAddEntry: (entry: FluidBalanceEntry) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
          <Droplets className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">Fluid Balance</p>
          <p className="text-xs text-slate-500">
            Intake / output chart with unified entry drawer.
          </p>
        </div>
      </div>
      <FluidBalanceSection
        entries={entries}
        onAddEntry={onAddEntry}
        authorName={CURRENT_RMO.name}
        title="Fluid Balance Chart"
      />
    </div>
  );
}
// components/patient-detail/fluid-balance-section.tsx
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Clock,
  Droplets,
  Plus,
  Scale,
  Wind,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ConsultationDrawer,
  DrawerSection,
} from "@/components/consultation/drawer";
import { FormButton, SuffixedInput } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { RadioGroup } from "@/components/forms/radio-group";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { PillButton } from "@/components/forms/pill-button";

// Superset shape accepted by both the RMO (`types/rmo/ipd/rmo-types.ts`) and
// the ICU/nurse (`types/nurse/ipd/nurse-ipd-types.ts`) FluidBalanceEntry
// models. RMO entries additionally carry a `date`.
export type FluidEntryBase = {
  id: string;
  date?: string;
  dateTime: string;
  direction: "Intake" | "Output";
  route: string;
  description: string;
  volumeMl: number;
  recordedBy: string;
};

export type FluidBalanceSectionProps<T extends FluidEntryBase> = {
  entries: T[];
  onAddEntry: (entry: T) => void;
  authorName: string;
  authorShift?: string;
  title?: string;
  description?: string;
};

const INTAKE_ROUTES = ["IV", "Oral", "NG Tube"];
const OUTPUT_ROUTES = ["Urine", "Drain", "Vomitus", "Stool"];

const ROUTE_OPTIONS = [
  { value: "IV", label: "IV" },
  { value: "Oral", label: "Oral" },
  { value: "NG Tube", label: "NG Tube" },
  { value: "Urine", label: "Urine" },
  { value: "Drain", label: "Drain" },
  { value: "Vomitus", label: "Vomitus" },
  { value: "Stool", label: "Stool" },
];

export function FluidBalanceSection<T extends FluidEntryBase>({
  entries,
  onAddEntry,
  authorName,
  authorShift,
  title = "Fluid Balance",
  description = `${entries.length} entries`,
}: FluidBalanceSectionProps<T>) {
  const [open, setOpen] = useState(false);

  const { totalIntake, totalOutput } = useMemo(
    () => ({
      totalIntake: entries
        .filter((e) => e.direction === "Intake")
        .reduce((sum, e) => sum + e.volumeMl, 0),
      totalOutput: entries
        .filter((e) => e.direction === "Output")
        .reduce((sum, e) => sum + e.volumeMl, 0),
    }),
    [entries],
  );
  const netBalance = totalIntake - totalOutput;
  const latestEntry = entries[0];

  const columns: DataColumn<FluidEntryBase>[] = [
    {
      key: "dateTime",
      label: "Date / Time",
      render: (e) => (
        <span className="text-xs font-semibold text-slate-600">{e.dateTime}</span>
      ),
    },
    {
      key: "direction",
      label: "Direction",
      render: (e) => (
        <Badge
          variant="outline"
          className={
            e.direction === "Intake"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }
        >
          {e.direction === "Intake" ? (
            <ArrowDownToLine className="mr-1 h-3 w-3" />
          ) : (
            <ArrowUpFromLine className="mr-1 h-3 w-3" />
          )}
          {e.direction}
        </Badge>
      ),
    },
    {
      key: "route",
      label: "Route",
      render: (e) => <span className="text-slate-600">{e.route}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (e) => (
        <span className="line-clamp-2 max-w-[360px] text-sm text-slate-700">
          {e.description}
        </span>
      ),
    },
    {
      key: "volumeMl",
      label: "Volume",
      render: (e) => (
        <span className="font-semibold text-slate-800">
          {e.volumeMl}
          <span className="ml-0.5 text-xs font-medium text-slate-400">ml</span>
        </span>
      ),
      align: "right",
    },
    {
      key: "recordedBy",
      label: "Recorded By",
      render: (e) => <span className="text-xs text-slate-500">{e.recordedBy}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <Droplets className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              {title}
            </p>
            <p className="text-xs text-slate-500">
              {description} · net{" "}
              <span
                className={
                  netBalance >= 0
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-rose-700"
                }
              >
                {netBalance >= 0 ? "+" : ""}
                {netBalance} ml
              </span>
            </p>
          </div>
        </div>
        <PillButton
          icon={Plus}
          onClick={() => setOpen(true)}
          className="self-start sm:self-auto"
        >
          Add Entry
        </PillButton>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTileCard
          title="Total Intake"
          icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
          tone="blue"
          value={`${totalIntake} ml`}
          subtitle={`${entries.filter((e) => e.direction === "Intake").length} entries`}
        />
        <InfoTileCard
          title="Total Output"
          icon={<ArrowUpFromLine className="h-3.5 w-3.5" />}
          tone="amber"
          value={`${totalOutput} ml`}
          subtitle={`${entries.filter((e) => e.direction === "Output").length} entries`}
        />
        <InfoTileCard
          title="Net Balance"
          icon={<Scale className="h-3.5 w-3.5" />}
          tone={netBalance >= 0 ? "emerald" : "red"}
          value={`${netBalance >= 0 ? "+" : ""}${netBalance} ml`}
          subtitle={netBalance >= 0 ? "Positive balance" : "Negative balance"}
        />
        <InfoTileCard
          title="Last Entry"
          icon={<Clock className="h-3.5 w-3.5" />}
          tone="slate"
          value={latestEntry ? latestEntry.dateTime : "—"}
          subtitle={latestEntry ? `${latestEntry.volumeMl} ml ${latestEntry.direction}` : "No entries yet"}
        />
      </div>

      {/* Negative-balance alert */}
      {netBalance < -500 && (
        <InfoAlertCard
          tone="red"
          icon={<Wind className="h-3.5 w-3.5" />}
          title="Significant Negative Fluid Balance"
          body={`Net output exceeds intake by ${Math.abs(netBalance)} ml. Consider review of hydration & electrolyte status.`}
        />
      )}

      {/* Entries table */}
      <DataTable
        card
        title="Fluid Balance Chart"
        titleIcon={<Droplets className="h-4 w-4" />}
        rows={entries}
        columns={columns}
        rowKey={(e) => e.id}
        countLabel="entries"
        emptyText="No fluid balance entries recorded yet."
      />

      <AddFluidDrawer
        open={open}
        onOpenChange={setOpen}
        onSave={onAddEntry}
        authorName={authorName}
        authorShift={authorShift}
      />
    </div>
  );
}

function AddFluidDrawer<T extends FluidEntryBase>({
  open,
  onOpenChange,
  onSave,
  authorName,
  authorShift,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSave: (entry: T) => void;
  authorName: string;
  authorShift?: string;
}) {
  const [direction, setDirection] = useState<"Intake" | "Output">("Intake");
  const [route, setRoute] = useState("IV");
  const [description, setDescription] = useState("");
  const [volume, setVolume] = useState("");

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      setDirection("Intake");
      setRoute("IV");
      setDescription("");
      setVolume("");
    }
    onOpenChange(next);
  }

  const routes = direction === "Intake" ? INTAKE_ROUTES : OUTPUT_ROUTES;
  const valid = description.trim() && Number(volume) > 0;

  function handleSave() {
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    onSave({
      id: `F-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      dateTime: stamp,
      direction,
      route,
      description: description.trim(),
      volumeMl: Number(volume),
      recordedBy: authorName,
    } as unknown as T);
  }

  return (
    <ConsultationDrawer
      open={open}
      onOpenChange={handleOpenChange}
      icon={<Droplets className="h-5 w-5" />}
      title="Add Fluid Balance Entry"
      description={`Recording as ${authorName}${authorShift ? ` (${authorShift})` : ""}`}
      bodyClassName="space-y-4"
      footer={
        <div className="flex items-center gap-3">
          <FormButton
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </FormButton>
          <FormButton className="flex-1" onClick={handleSave} disabled={!valid}>
            <Check className="mr-1 h-4 w-4" />
            Save Entry
          </FormButton>
        </div>
      }
    >
      {/* Direction */}
      <DrawerSection
        title="Direction"
        caption="Is this fluid coming in or going out?"
        icon={
          direction === "Intake" ? (
            <ArrowDownToLine className="h-4 w-4 text-blue-500" />
          ) : (
            <ArrowUpFromLine className="h-4 w-4 text-amber-500" />
          )
        }
      >
        <RadioGroup
          name="fluid-direction"
          options={[
            { value: "Intake", label: "Intake" },
            { value: "Output", label: "Output" },
          ]}
          value={direction}
          onChange={(v) => {
            const next = v as "Intake" | "Output";
            setDirection(next);
            setRoute(next === "Intake" ? "IV" : "Urine");
          }}
        />
      </DrawerSection>

      {/* Route */}
      <DrawerSection
        title="Route"
        caption="Select the appropriate route for this entry"
        icon={<Wind className="h-4 w-4" />}
      >
        <SingleSelect
          label="Route"
          value={route}
          onChange={setRoute}
          options={ROUTE_OPTIONS.filter((r) => routes.includes(r.value))}
        />
      </DrawerSection>

      {/* Description & volume */}
      <DrawerSection
        title="Entry Details"
        caption="Description and measured volume"
        icon={<Droplets className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <SuffixedInput
            label="Description *"
            value={description}
            onChange={setDescription}
            placeholder="e.g. NS 500ml infusion, morning void"
          />
          <SuffixedInput
            label="Volume *"
            suffix="ml"
            type="number"
            value={volume}
            onChange={setVolume}
            placeholder="0"
          />
        </div>
      </DrawerSection>
    </ConsultationDrawer>
  );
}
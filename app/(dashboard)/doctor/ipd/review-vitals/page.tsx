// app/ipd/doctor/review-vitals/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  HeartPulse,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  RefreshCw,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  History,
  Printer,
  FileDown,
} from "lucide-react";
import { PillButton } from "@/components/forms/pill-button";
import { SingleSelect } from "@/components/forms/select";
import { QuickVitalsStrip } from "@/components/patient-detail/quick-vitals-strip";
import { QuickActionsCard } from "@/components/patient-detail/quick-actions-card";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  WARD_ROUND_PATIENTS,
  getPatientByUhid,
} from "@/lib/doctor/ipd/ward-round-data";
import {
  getVitalsForPatient,
  getAlertsForPatient,
  NORMAL_RANGES,
} from "@/lib/doctor/ipd/vitals-data";
import { VitalsTrendChart } from "./_components/vitals-trend-chart";
import { LatestVitalsPanel } from "./_components/latest-vitals-panel";
import { VitalsRecordsTable } from "./_components/vitals-records-table";
import { NormalRangesWidget } from "./_components/normal-ranges-widget";
import { AlertsWidget } from "./_components/alerts-widget";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { VitalsFormData } from "@/types/doctor/ipd/record-vitals-types";
import { RecordVitalsDialog } from "./_components/record-vitals-dialog";

export default function ReviewVitalsPage({
  uhid: propUhid,
  embedded = false,
}: { uhid?: string; embedded?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = propUhid ?? searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [viewBy, setViewBy] = useState("chart");
  const [timeRange, setTimeRange] = useState("72");

  const [recordVitalsOpen, setRecordVitalsOpen] = useState(false);

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const records = useMemo(() => getVitalsForPatient(uhid), [uhid]);
  const alerts = useMemo(() => getAlertsForPatient(uhid), [uhid]);
  const latest = records[0];

  function handleSelectPatient(newUhid: string) {
    console.log("Patient changed in Review Vitals to:", newUhid);
    router.push(`/doctor/ipd/review-vitals?uhid=${newUhid}`);
  }

  function handleBack() {
    console.log("Back to Ward Round for UHID:", uhid);
    router.push(`/doctor/ipd/ward-round?uhid=${uhid}`);
  }

  function handleDiagnosisUpdate() {
    console.log("Navigating to Diagnosis Update for UHID:", uhid);
    router.push(`/doctor/ipd/diagnosis-update?uhid=${uhid}`);
  }

  function handleRefresh() {
    console.log("Refreshing vitals for UHID:", uhid);
    toast.success("Vitals refreshed");
  }

  function handleAddRecordVitals() {
    console.log("Add/Record vitals for UHID:", uhid);
    toast.info("Opening record vitals form...");
    setRecordVitalsOpen(true);
  }

  function handleSaveVitals(data: VitalsFormData) {
    console.log("Vitals saved for", uhid, data);
    toast.success("Vitals recorded. Refresh to see updated trend.");
  }

  function handleSaveAndContinue(data: VitalsFormData) {
    console.log(
      "Vitals saved, continuing to Diagnosis Update for",
      uhid,
      data,
    );
    router.push(`/doctor/ipd/diagnosis-update?uhid=${uhid}`);
  }

  function handleSaveDraft(data: VitalsFormData) {
    console.log("Draft vitals saved for", uhid, data);
  }

  function handleViewTrend(type: string) {
    console.log("View trend for:", type);
    toast.info(`Highlighting ${type} trend on chart`);
  }

  function handleQuickAction(label: string) {
    console.log("Quick action:", label, "for", uhid);
    toast.info(label);
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {/* Patient header bar */}
        {!embedded && (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                  {patient.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {patient.patientName}{" "}
                    <PatientStatusBadge status={patient.status} />
                  </p>
                  <p className="text-xs text-slate-400">
                    {patient.age} Y / {patient.gender} · UHID: {patient.uhid} ·
                    IPD: {patient.ipdId} · Bed:{" "}
                    {patient.wardRoomBed.split("/").pop()?.trim()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:items-center lg:gap-8">
                <InfoBlock
                  label="Ward / Room / Bed"
                  value={patient.wardRoomBed}
                />
                <InfoBlock label="Department" value={patient.department} />
                <InfoBlock
                  label="Admitting Doctor"
                  value={patient.admittingDoctor}
                />
                <InfoBlock
                  label="Admission Date"
                  value={patient.admissionDateTime}
                />
              </div>

              <PillButton
                variant="outline"
                className="w-full lg:w-auto"
                onClick={() => setChangePatientOpen(true)}
              >
                Change Patient
              </PillButton>
            </CardContent>
          </Card>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start border p-3 rounded-lg">
          <div className="min-w-0 space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  Review Vitals
                </h1>
                <p className="text-xs text-slate-400">
                  View and analyze patient vital signs trends.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-28">
                  <SingleSelect
                    label="View By"
                    value={viewBy}
                    options={[
                      { value: "chart", label: "Chart" },
                      { value: "table", label: "Table" },
                    ]}
                    onChange={setViewBy}
                  />
                </div>
                <div className="w-28">
                  <SingleSelect
                    label="Time Range"
                    value={timeRange}
                    options={[
                      { value: "24", label: "24 Hours" },
                      { value: "72", label: "72 Hours" },
                      { value: "168", label: "7 Days" },
                    ]}
                    onChange={setTimeRange}
                  />
                </div>
                <PillButton
                  variant="outline"
                  icon={RefreshCw}
                  onClick={handleRefresh}
                  aria-label="Refresh vitals"
                >
                  <span className="sr-only">Refresh</span>
                </PillButton>
                <PillButton
                  variant="gradient"
                  icon={PlusCircle}
                  onClick={handleAddRecordVitals}
                >
                  Add/Record Vitals
                </PillButton>
              </div>
            </div>

            {/* Vitals summary cards */}
            <Card className="border-slate-200 shadow-sm p-0">
              <CardContent className="py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">
                  Vitals Trend
                </p>
                <QuickVitalsStrip
                  vitals={[
                    {
                      label: "BP",
                      value: latest.bp,
                      unit: "mmHg",
                      icon: Activity,
                      recordedOn: latest.dateTime,
                    },
                    {
                      label: "Pulse",
                      value: String(latest.pulse),
                      unit: "/min",
                      icon: HeartPulse,
                      recordedOn: latest.dateTime,
                    },
                    {
                      label: "Temp",
                      value: String(latest.temp),
                      unit: "°F",
                      icon: Thermometer,
                      recordedOn: latest.dateTime,
                    },
                    {
                      label: "RR",
                      value: String(latest.respRate),
                      unit: "/min",
                      icon: Wind,
                      recordedOn: latest.dateTime,
                    },
                    {
                      label: "SpO₂",
                      value: String(latest.spo2),
                      unit: "%",
                      icon: Droplets,
                      recordedOn: latest.dateTime,
                    },
                    {
                      label: "Pain",
                      value: String(latest.pain),
                      unit: "/10",
                      icon: Gauge,
                      recordedOn: latest.dateTime,
                    },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Chart + latest vitals side panel */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-[1fr_220px]">
                <VitalsTrendChart records={records} />
                <LatestVitalsPanel record={latest} />
              </CardContent>
            </Card>

            {/* Records / Graph Data tabs */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-4">
                <Tabs defaultValue="records">
                  <TabsList className="mb-4">
                    <TabsTrigger value="records">Vitals Records</TabsTrigger>
                    <TabsTrigger value="graph">Graph Data</TabsTrigger>
                  </TabsList>
                  <TabsContent value="records">
                    <VitalsRecordsTable records={records} />
                  </TabsContent>
                  <TabsContent value="graph">
                    <VitalsTrendChart records={records} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Footer note + navigation */}
            {!embedded && (
              <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm text-blue-700">
                  <Info className="h-4 w-4 shrink-0" /> Vitals are auto-recorded
                  from monitor and verified by nursing staff.
                </p>
                <div className="flex gap-2">
                  <PillButton
                    variant="outline"
                    icon={ArrowLeft}
                    onClick={handleBack}
                  >
                    Back
                  </PillButton>
                  <PillButton
                    variant="gradient"
                    icon={ArrowRight}
                    onClick={handleDiagnosisUpdate}
                    className="flex-row-reverse"
                  >
                    Next: Diagnosis Update
                  </PillButton>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6">
            <NormalRangesWidget ranges={NORMAL_RANGES} />
            <AlertsWidget alerts={alerts} onViewTrend={handleViewTrend} />
            <QuickActionsCard
              actions={[
                {
                  label: "Add/Record Vitals",
                  icon: PlusCircle,
                  onClick: () => handleQuickAction("Add/Record Vitals"),
                },
                {
                  label: "View Vitals History",
                  icon: History,
                  onClick: () => handleQuickAction("View Vitals History"),
                },
                {
                  label: "Print Vitals Report",
                  icon: Printer,
                  onClick: () => handleQuickAction("Print Vitals Report"),
                },
                {
                  label: "Download Vitals Chart",
                  icon: FileDown,
                  onClick: () => handleQuickAction("Download Vitals Chart"),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {!embedded && (
        <ChangePatientDialog
          patients={WARD_ROUND_PATIENTS}
          currentUhid={patient.uhid}
          open={changePatientOpen}
          onOpenChange={setChangePatientOpen}
          onSelectPatient={handleSelectPatient}
        />
      )}

      <RecordVitalsDialog
        patient={patient}
        previousVitals={records[0]}
        open={recordVitalsOpen}
        onOpenChange={setRecordVitalsOpen}
        onSaveDraft={handleSaveDraft}
        onSaveVitals={handleSaveVitals}
        onSaveAndContinue={handleSaveAndContinue}
      />
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}


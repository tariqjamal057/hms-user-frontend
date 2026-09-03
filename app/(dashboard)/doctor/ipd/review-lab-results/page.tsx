// app/ipd/doctor/review-lab-results/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, ArrowLeft, ArrowRight, Info, FileEdit, Eye, PlusCircle, FileDown, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WARD_ROUND_PATIENTS, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { getLabResultsForPatient, getCriticalAlertsForPatient, getTestHistoryForPatient } from "@/lib/doctor/ipd/lab-results-data";
import { LabResultsTable } from "./_components/lab-results-table";
import { LabResultDetailDialog } from "./_components/lab-result-detail-dialog";
import { CriticalAlertsWidget } from "./_components/critical-alerts-widget";
import { TestSummaryDonut } from "./_components/test-summary-donut";
import { TestHistoryWidget } from "./_components/test-history-widget";
import type { LabTestResult } from "@/types/doctor/ipd/lab-results-types";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";

const CATEGORIES = ["All Results", "Hematology", "Biochemistry", "Serology", "Microbiology", "Others"] as const;
const PAGE_SIZE = 10;

export default function ReviewLabResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof CATEGORIES[number]>("All Results");
  const [dateRange, setDateRange] = useState("7");
  const [page, setPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<LabTestResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const allResults = useMemo(() => getLabResultsForPatient(uhid), [uhid]);
  const alerts = useMemo(() => getCriticalAlertsForPatient(uhid), [uhid]);
  const history = useMemo(() => getTestHistoryForPatient(uhid), [uhid]);

  const filtered = useMemo(() => {
    if (activeTab === "All Results") return allResults;
    return allResults.filter((r) => r.category === activeTab);
  }, [allResults, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    const normal = allResults.filter((r) => r.status === "Normal").length;
    const abnormal = allResults.filter((r) => r.status === "Low" || r.status === "High").length;
    const borderline = allResults.filter((r) => r.status === "Borderline").length;
    const pending = allResults.filter((r) => r.status === "Pending").length;
    return { normal, abnormal, borderline, pending };
  }, [allResults]);

  function categoryCount(cat: typeof CATEGORIES[number]) {
    if (cat === "All Results") return allResults.length;
    return allResults.filter((r) => r.category === cat).length;
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab as typeof CATEGORIES[number]);
    setPage(1);
  }

  function handleView(result: LabTestResult) {
    console.log("View lab result:", result.id, "for UHID:", uhid);
    setSelectedResult(result);
    setDetailOpen(true);
  }

  function handleViewReport(result: LabTestResult) {
    console.log("View report PDF for:", result.testName);
    toast.info(`Opening report for ${result.testName}...`);
  }

  function handleSelectPatient(newUhid: string) {
    console.log("Patient changed in Review Lab Results to:", newUhid);
    router.push(`/doctor/ipd/review-lab-results?uhid=${newUhid}`);
  }

  function handleRefresh() {
    console.log("Refreshing lab results for UHID:", uhid);
    toast.success("Lab results refreshed");
  }

  function handleBack() {
    console.log("Back to Review Vitals for UHID:", uhid);
    router.push(`/doctor/ipd/review-vitals?uhid=${uhid}`);
  }

  function handleNextClinicalExamination() {
    console.log("Navigating to Clinical Examination for UHID:", uhid);
    router.push(`/doctor/ipd/clinical-examination?uhid=${uhid}`);
  }

  function handleAddLabOrder() {
    console.log("Add lab order for UHID:", uhid);
    toast.info("Opening add lab order form...");
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {/* Patient header */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                {patient.patientName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  {patient.patientName} <PatientStatusBadge status={patient.status} />
                </p>
                <p className="text-xs text-slate-400">
                  {patient.age} Y / {patient.gender} · UHID: {patient.uhid} · IPD: {patient.ipdId} · Bed: {patient.wardRoomBed.split("/").pop()?.trim()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:items-center lg:gap-8">
              <InfoBlock label="Ward / Room / Bed" value={patient.wardRoomBed} />
              <InfoBlock label="Department" value={patient.department} />
              <InfoBlock label="Admitting Doctor" value={patient.admittingDoctor} />
              <InfoBlock label="Admission Date" value={patient.admissionDateTime} />
            </div>
            <Button variant="outline" className="w-full gap-2 lg:w-auto" onClick={() => setChangePatientOpen(true)}>
              Change Patient
            </Button>
          </CardContent>
        </Card>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="min-w-0 space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Review Lab Results</h1>
                <p className="text-xs text-slate-400">View and analyze patient laboratory test results.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-400">View By</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tests</SelectItem>
                      <SelectItem value="abnormal">Abnormal Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-slate-400">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon" onClick={handleRefresh}><RefreshCw className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Results card */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-4">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="mb-4 flex-wrap justify-start gap-1 bg-transparent p-0">
                    {CATEGORIES.map((cat) => (
                      <TabsTrigger
                        key={cat}
                        value={cat}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        {cat} ({categoryCount(cat)})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <LabResultsTable results={paginated} onView={handleView} onViewReport={handleViewReport} />

                <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="text-xs text-slate-400">
                    Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="icon"
                        className={`h-8 w-8 ${p === page ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer note + actions */}
            <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-blue-700">
                <Info className="h-4 w-4 shrink-0" /> Reference ranges may vary based on age, gender, and laboratory standards.
              </p>
              <Button variant="outline" className="gap-2 bg-white" onClick={handleAddLabOrder}>
                <FileEdit className="h-4 w-4" /> Add Lab Order
              </Button>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" className="gap-2" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleNextClinicalExamination}>
                Next: Clinical Examination <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6">
            <CriticalAlertsWidget alerts={alerts} />
            <TestSummaryDonut normal={summary.normal} abnormal={summary.abnormal} borderline={summary.borderline} pending={summary.pending} />
            <TestHistoryWidget history={history} />
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-1 py-3">
                <p className="mb-2 px-2 text-sm font-semibold text-slate-800">Quick Actions</p>
                <QuickAction icon={Eye} label="View Lab Report" onClick={() => toast.info("Opening lab report...")} />
                <QuickAction icon={PlusCircle} label="Add Lab Order" onClick={handleAddLabOrder} />
                <QuickAction icon={FileDown} label="Download Lab Summary" onClick={() => toast.info("Downloading lab summary...")} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ChangePatientDialog
        patients={WARD_ROUND_PATIENTS}
        currentUhid={patient.uhid}
        open={changePatientOpen}
        onOpenChange={setChangePatientOpen}
        onSelectPatient={handleSelectPatient}
      />
      <LabResultDetailDialog result={selectedResult} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="whitespace-nowrap text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-blue-600 hover:bg-blue-50">
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
    </button>
  );
}

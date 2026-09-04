// app/doctor/ipd/investigation-orders/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Plus,
  Trash2,
  ClipboardCheck,
  FileText,
  History,
  CircleAlert,
  Activity,
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QuickActionsCard } from "@/components/patient-detail/quick-actions-card";
import { SuffixedInput, FormTextarea } from "@/components/forms/form-controls";
import { SingleSelect } from "@/components/forms/select";
import { PillButton } from "@/components/forms/pill-button";

import {
  WARD_ROUND_PATIENTS,
  getPatientByUhid,
} from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getDiagnosisData } from "@/lib/doctor/ipd/diagnosis-data";
import {
  getInvestigationOrdersData,
  PATHOLOGY_TESTS,
  RADIOLOGY_TESTS,
} from "@/lib/doctor/ipd/investigation-orders-data";
import { InvestigationOrdersTable } from "./_components/investigation-orders-table";
import { LabDrawer, type LabDraft } from "@/components/consultation/lab-drawer";
import { ClearAllInvestigationsDialog } from "./_components/clear-all-investigations-dialog";
import type {
  InvestigationDepartment,
  InvestigationOrderItem,
} from "@/types/doctor/ipd/investigation-order-types";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";
import { QuickVitalsStrip } from "@/components/patient-detail/quick-vitals-strip";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { InvestigationViewDialog } from "./_components/investigation-view-dialog";

export default function InvestigationOrdersPage({
  uhid: propUhid,
  embedded = false,
}: { uhid?: string; embedded?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = propUhid ?? searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const vitals = useMemo(() => getVitalsForPatient(uhid)[0], [uhid]);
  const diagnosis = useMemo(
    () => getDiagnosisData(uhid).currentDiagnoses,
    [uhid],
  );
  const initialData = useMemo(() => getInvestigationOrdersData(uhid), [uhid]);

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [addInvestigationOpen, setAddInvestigationOpen] = useState(false);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const [orderDateTime, setOrderDateTime] = useState("2024-05-20T11:20");
  const [searchInvestigation, setSearchInvestigation] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [items, setItems] = useState<InvestigationOrderItem[]>(
    initialData.items,
  );
  const [indication, setIndication] = useState(initialData.indication);
  const [additionalInstructions, setAdditionalInstructions] = useState(
    initialData.instructions,
  );
  const [viewItem, setViewItem] = useState<InvestigationOrderItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    const data = getInvestigationOrdersData(uhid);

    setItems(data.items);
    setIndication(data.indication);
    setAdditionalInstructions(data.instructions);

    setSearchInvestigation("");
    setCategoryFilter("All Categories");
    setPriorityFilter("All Priorities");

    setViewItem(null);
    setViewOpen(false);
  }, [uhid]);

  function handleView(item: InvestigationOrderItem) {
    setViewItem(item);
    setViewOpen(true);
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.investigationName
        .toLowerCase()
        .includes(searchInvestigation.toLowerCase());
      const matchesCategory =
        categoryFilter === "All Categories" || item.category === categoryFilter;
      const matchesPriority =
        priorityFilter === "All Priorities" || item.priority === priorityFilter;
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [items, searchInvestigation, categoryFilter, priorityFilter]);

  const hasPendingOrder = items.some((item) => item.status === "Pending");
  const orderedCount = items.filter((item) => item.status === "Ordered").length;

  function handleSelectPatient(newUhid: string) {
    console.log("Patient changed in Investigation Orders to:", newUhid);
    router.push(`/doctor/ipd/investigation-orders?uhid=${newUhid}`);
  }

  function handleOpenAddInvestigation() {
    setAddInvestigationOpen(true);
  }

  function handleAddInvestigationDrafts(drafts: LabDraft[]) {
    if (drafts.length === 0) return;
    const today = new Date();
    const orderDate = today.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const newItems: InvestigationOrderItem[] = drafts.map((d) => {
      const department: InvestigationDepartment =
        d.department === "pathology" ? "Pathology" : "Radiology";
      const pool =
        department === "Pathology" ? PATHOLOGY_TESTS : RADIOLOGY_TESTS;
      const ref = pool.find((t) => t.name === d.test);
      return {
        id: `INV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        investigationName: d.test,
        department,
        category: ref?.category ?? d.category ?? department,
        priority: d.priority === "priority" ? "Urgent" : "Normal",
        sample: ref?.sample ?? "",
        orderDate,
        orderedBy: "Dr. Amit Verma",
        status: "Pending",
        indication: "",
        additionalInstructions: "",
        expectedReportTime: ref?.expectedReportTime ?? "",
      };
    });
    setItems((previous) => [...previous, ...newItems]);
    toast.success(
      `${newItems.length} investigation${newItems.length > 1 ? "s" : ""} added as pending`,
    );
  }

  function handleDelete(id: string) {
    console.log("Delete investigation:", id);
    setItems((prev) => prev.filter((row) => row.id !== id));
    toast.success("Investigation deleted");
  }

  function handleAddToOrder() {
    setItems((previous) =>
      previous.map((item) =>
        item.status === "Pending"
          ? {
              ...item,
              status: "Ordered",
            }
          : item,
      ),
    );

    toast.success(
      "Investigation orders sent to pathology and radiology departments",
    );
  }

  function handleClearAll() {
    console.log("Clear all investigations for UHID:", uhid);
    setItems([]);
    toast.success("All test reports deleted");
  }

  function handleBack() {
    router.push(`/doctor/ipd/medicine-orders?uhid=${uhid}`);
  }

  function handleNextTreatmentPlan() {
    router.push(`/doctor/ipd/treatment-plan?uhid=${uhid}`);
  }

  function handleViewAllVitals() {
    router.push(`/doctor/ipd/review-vitals?uhid=${uhid}`);
  }

  function handleDiagnosis() {
    router.push(`/doctor/ipd/diagnosis-update?uhid=${uhid}`);
  }

  function handleViewMedicineOrders() {
    router.push(`/doctor/ipd/medicine-orders?uhid=${uhid}`);
  }

  function handleTreatmentPlan() {
    router.push(`/doctor/ipd/treatment-plan?uhid=${uhid}`);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {!embedded && (
          <Card className="border-slate-200 shadow-sm py-0">
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
                  label="Attending Doctor"
                  value={patient.admittingDoctor}
                />
                <InfoBlock
                  label="Admission Date"
                  value={patient.admissionDateTime}
                />
              </div>

              <PillButton
                variant="outline"
                className="w-full gap-2 lg:w-auto"
                onClick={() => setChangePatientOpen(true)}
              >
                Change Patient
              </PillButton>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  Lab Orders
                </h1>
                <p className="text-xs text-slate-400">
                  Order and review investigations for the patient.
                </p>
              </div>
            </div>

            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px_auto]">
                  <SuffixedInput
                    label="Search Investigation"
                    placeholder="Search by test name or keyword"
                    value={searchInvestigation}
                    onChange={setSearchInvestigation}
                  />

                  <SingleSelect
                    label="Investigation Category"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                      { value: "All Categories", label: "All Categories" },
                      { value: "Hematology", label: "Hematology" },
                      { value: "Biochemistry", label: "Biochemistry" },
                      { value: "Radiology", label: "Radiology" },
                      { value: "Cardiology", label: "Cardiology" },
                      { value: "Microbiology", label: "Microbiology" },
                      { value: "Others", label: "Others" },
                    ]}
                  />

                  <SingleSelect
                    label="Priority"
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    options={[
                      { value: "All Priorities", label: "All Priorities" },
                      { value: "Routine", label: "Routine" },
                      { value: "Urgent", label: "Urgent" },
                      { value: "High", label: "High" },
                    ]}
                  />

                  <div className="flex items-end">
                    <PillButton
                      variant="gradient"
                      className="w-full gap-2 md:w-auto"
                      onClick={handleAddToOrder}
                      disabled={!hasPendingOrder}
                      icon={Plus}
                    >
                      Send To Department
                    </PillButton>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Ordered Investigations ({filteredItems.length})
                  </p>
                  <InvestigationOrdersTable
                    items={filteredItems}
                    onView={handleView}
                    onDelete={handleDelete}
                  />

                  <InvestigationViewDialog
                    open={viewOpen}
                    onOpenChange={setViewOpen}
                    item={viewItem}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <PillButton
                    variant="outline"
                    className="gap-2"
                    onClick={handleOpenAddInvestigation}
                    icon={Plus}
                  >
                    Add Investigation
                  </PillButton>

                  <PillButton
                    variant="danger"
                    className="gap-2"
                    onClick={() => setClearAllOpen(true)}
                    disabled={items.length === 0}
                    icon={Trash2}
                  >
                    Clear All
                  </PillButton>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="py-4">
                  <FormTextarea
                    label="Clinical Indication / Reason"
                    rows={5}
                    maxLength={500}
                    value={indication}
                    onChange={setIndication}
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm py-0">
                <CardContent className="py-4">
                  <FormTextarea
                    label="Additional Instructions (Optional)"
                    rows={5}
                    maxLength={500}
                    value={additionalInstructions}
                    onChange={setAdditionalInstructions}
                  />
                </CardContent>
              </Card>
            </div>

            {!embedded && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" /> Investigations will be
                  sent to the laboratory or radiology incharge for processing and
                  reporting.
                </p>
              </div>
            )}

            {!embedded && (
              <div className="flex justify-between gap-2">
                <PillButton variant="outline" className="gap-2" onClick={handleBack} icon={ArrowLeft}>
                  Back
                </PillButton>
                <PillButton
                  variant="gradient"
                  className="gap-2"
                  onClick={handleNextTreatmentPlan}
                  icon={ArrowRight}
                >
                  Next: Treatment Plan
                </PillButton>
              </div>
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            {vitals && (
              <Card className="border-slate-200 shadow-sm p-0">
                <CardContent className="py-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Vitals Trend
                  </p>
                  <QuickVitalsStrip
                    vitals={[
                      { label: "BP", value: vitals.bp, unit: "mmHg", icon: Activity, recordedOn: vitals.dateTime },
                      { label: "Pulse", value: String(vitals.pulse), unit: "/min", icon: HeartPulse, recordedOn: vitals.dateTime },
                      { label: "Temp", value: String(vitals.temp), unit: "°F", icon: Thermometer, recordedOn: vitals.dateTime },
                      { label: "RR", value: String(vitals.respRate), unit: "/min", icon: Wind, recordedOn: vitals.dateTime },
                      { label: "SpO₂", value: String(vitals.spo2), unit: "%", icon: Droplets, recordedOn: vitals.dateTime },
                      { label: "Pain", value: String(vitals.pain), unit: "/10", icon: Gauge, recordedOn: vitals.dateTime },
                    ]}
                    gridClassName="grid-cols-1 sm:grid-cols-2"
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-3 py-4">
                <p className="text-sm font-semibold text-slate-800">
                  Order Summary
                </p>
                <SummaryRow
                  label="Total Investigations"
                  value={String(items.length)}
                />
                <SummaryRow label="Ordered" value={String(orderedCount)} />
                <SummaryRow
                  label="Sample Collected"
                  value={String(
                    items.filter((item) => item.status === "Sample Collected")
                      .length,
                  )}
                />

                <SummaryRow
                  label="Processing"
                  value={String(
                    items.filter((item) => item.status === "Processing").length,
                  )}
                />
                <SummaryRow
                  label="Reports Ready"
                  value={String(
                    items.filter((item) => item.status === "Report Ready")
                      .length,
                  )}
                />
              </CardContent>
            </Card>

            <QuickActionsCard
              actions={[
                {
                  label: "View Treatment Plan",
                  icon: ClipboardCheck,
                  onClick: handleTreatmentPlan,
                },
                {
                  label: "View Diagnosis",
                  icon: CircleAlert,
                  onClick: handleDiagnosis,
                },
                {
                  label: "View Medicine Orders",
                  icon: FileText,
                  onClick: handleViewMedicineOrders,
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

      <LabDrawer
        open={addInvestigationOpen}
        onOpenChange={setAddInvestigationOpen}
        onSubmit={handleAddInvestigationDrafts}
      />

      <ClearAllInvestigationsDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        onConfirm={handleClearAll}
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

function SummaryRow({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-800">{value}</span>
        {action && (
          <button className="text-xs font-medium text-blue-600 hover:underline">
            {action}
          </button>
        )}
      </div>
    </div>
  );
}


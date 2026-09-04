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
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  WARD_ROUND_PATIENTS,
  getPatientByUhid,
} from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getDiagnosisData } from "@/lib/doctor/ipd/diagnosis-data";
import { getInvestigationOrdersData } from "@/lib/doctor/ipd/investigation-orders-data";
import { InvestigationOrdersTable } from "./_components/investigation-orders-table";
import { AddInvestigationDialog } from "./_components/add-investigation-dialog";
import { ClearAllInvestigationsDialog } from "./_components/clear-all-investigations-dialog";
import type { InvestigationOrderItem } from "@/types/doctor/ipd/investigation-order-types";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";
import { LatestVitalsMini } from "../clinical-examination/_components/latest-vitals-mini";
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
  const [editingItem, setEditingItem] = useState<InvestigationOrderItem | null>(
    null,
  );

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
    setEditingItem(null);
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
    setEditingItem(null);
    setAddInvestigationOpen(true);
  }

  function handleSaveInvestigation(item: InvestigationOrderItem) {
    if (editingItem) {
      setItems((previous) =>
        previous.map((row) =>
          row.id === item.id
            ? {
                ...item,
                status: "Pending",
              }
            : row,
        ),
      );

      toast.success("Investigation updated and marked pending");
      return;
    }

    setItems((previous) => [...previous, item]);
    toast.success("Investigation added as pending");
  }

  function handleEdit(item: InvestigationOrderItem) {
    console.log("Edit investigation:", item);
    setEditingItem(item);
    setAddInvestigationOpen(true);
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

  function handleQuickAction(label: string) {
    console.log("Quick action:", label, "for", uhid);
    toast.info(label);
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
                  label="Attending Doctor"
                  value={patient.admittingDoctor}
                />
                <InfoBlock
                  label="Admission Date"
                  value={patient.admissionDateTime}
                />
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 lg:w-auto"
                onClick={() => setChangePatientOpen(true)}
              >
                Change Patient
              </Button>
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

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px_auto]">
                  <div>
                    <label className="text-xs text-slate-500">
                      Search Investigation
                    </label>
                    <Input
                      className="mt-1"
                      placeholder="Search by test name or keyword"
                      value={searchInvestigation}
                      onChange={(e) => setSearchInvestigation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">
                      Investigation Category
                    </label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Categories">
                          All Categories
                        </SelectItem>
                        <SelectItem value="Hematology">Hematology</SelectItem>
                        <SelectItem value="Biochemistry">
                          Biochemistry
                        </SelectItem>
                        <SelectItem value="Radiology">Radiology</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Microbiology">
                          Microbiology
                        </SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">Priority</label>
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Priorities">
                          All Priorities
                        </SelectItem>
                        <SelectItem value="Routine">Routine</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 md:w-auto"
                      onClick={handleAddToOrder}
                      disabled={!hasPendingOrder}
                    >
                      <Plus className="h-4 w-4" />
                      Send To Department
                    </Button>
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
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleOpenAddInvestigation}
                  >
                    <Plus className="h-4 w-4" /> Add Investigation
                  </Button>

                  <Button
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setClearAllOpen(true)}
                    disabled={items.length === 0}
                  >
                    <Trash2 className="h-4 w-4" /> Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Clinical Indication / Reason
                  </p>
                  <Textarea
                    rows={5}
                    maxLength={500}
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                  />
                  <p className="text-right text-xs text-slate-400">
                    {indication.length}/500
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="py-4">
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Additional Instructions (Optional)
                  </p>
                  <Textarea
                    rows={5}
                    maxLength={500}
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                  />
                  <p className="text-right text-xs text-slate-400">
                    {additionalInstructions.length}/500
                  </p>
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
                <Button variant="outline" className="gap-2" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handleNextTreatmentPlan}
                >
                  Next: Treatment Plan <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            <LatestVitalsMini vitals={vitals} onViewAll={handleViewAllVitals} />

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

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-1 py-3">
                <p className="mb-2 px-2 text-sm font-semibold text-slate-800">
                  Quick Actions
                </p>
                <QuickAction
                  icon={ClipboardCheck}
                  label="View Treatment Plan"
                  onClick={handleTreatmentPlan}
                />
                <QuickAction
                  icon={CircleAlert}
                  label="View Diagnosis"
                  onClick={handleDiagnosis}
                />
                <QuickAction
                  icon={FileText}
                  label="View Medicine Orders"
                  onClick={handleViewMedicineOrders}
                />
              </CardContent>
            </Card>
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

      <AddInvestigationDialog
        open={addInvestigationOpen}
        onOpenChange={setAddInvestigationOpen}
        editingItem={editingItem}
        onSave={handleSaveInvestigation}
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

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" /> {label}
      </span>
    </button>
  );
}


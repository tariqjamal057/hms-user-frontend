// app/doctor/ipd/medicine-orders/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Info, Plus, Trash2,
  FileText,
  StickyNote,
  PillBottle,
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
import { PillButton } from "@/components/forms/pill-button";

import { WARD_ROUND_PATIENTS, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getMedicineOrdersData } from "@/lib/doctor/ipd/medicine-orders-data";
import { MedicineOrdersTable } from "./_components/medicine-orders-table";
import { ClearAllMedicinesDialog } from "./_components/clear-all-medicines-dialog";
import { MedicineDetailDrawer } from "./_components/medicine-detail-drawer";
import { MedicineDrawer, type MedicineDraft } from "@/components/consultation/medicine-drawer";
import type { MedicineOrderItem } from "@/types/doctor/ipd/medicine-order-types";
import { QuickVitalsStrip } from "@/components/patient-detail/quick-vitals-strip";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";
import { PatientProfileCard } from "@/components/patient-detail/patient-profile-card";
import { wardRoundProfileDetail } from "@/lib/patient-detail/patient-profile-data";

export default function MedicineOrdersPage({
  uhid: propUhid,
  embedded = false,
}: { uhid?: string; embedded?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = propUhid ?? searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const profile = useMemo(() => wardRoundProfileDetail(patient), [patient]);
  const vitals = useMemo(() => getVitalsForPatient(uhid)[0], [uhid]);
  const initialData = useMemo(() => getMedicineOrdersData(uhid), [uhid]);

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<MedicineOrderItem | null>(null);

  const [searchMedicine, setSearchMedicine] = useState("");
  const [items, setItems] = useState<MedicineOrderItem[]>(initialData.items);
  const [notes, setNotes] = useState(initialData.notes);

  useEffect(() => {
    setItems(getMedicineOrdersData(uhid).items);
    setNotes(getMedicineOrdersData(uhid).notes);
    setSearchMedicine("");
    setViewingItem(null);
  }, [uhid]);

  const filteredItems = useMemo(
    () => items.filter((item) => item.medicineName.toLowerCase().includes(searchMedicine.toLowerCase())),
    [items, searchMedicine],
  );

  const hasPendingMedicine = items.some((item) => item.status === "Pending");
  const activeCount = items.filter((item) => item.status === "Active").length;
  const completedCount = items.filter((item) => item.status === "Course Completed").length;

  function handleSelectPatient(newUhid: string) {
    router.push(`/doctor/ipd/medicine-orders?uhid=${newUhid}`);
  }

  function handleOpenAddMedicine() {
    setAddMedicineOpen(true);
  }

  function handleAddMedicineDrafts(drafts: MedicineDraft[]) {
    if (drafts.length === 0) return;
    const today = new Date();
    const orderedOn = today.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const newItems: MedicineOrderItem[] = drafts.map((d) => {
      const { dose, route } = splitDosage(d.dosage);
      return {
        id: `MED-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        medicineName: d.name,
        strengthForm: "",
        dose,
        route,
        frequency: d.frequency,
        timesPerDay: timesPerDayFor(d.frequency),
        duration: d.duration,
        startDate: today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        endDate: "",
        instructions: d.instructions,
        orderedBy: "Dr. Amit Verma",
        orderedOn,
        status: "Pending",
        dailyLogs: [],
      };
    });
    setItems((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length} medicine${newItems.length > 1 ? "s" : ""} added with pending status`);
  }

  function handleEdit(item: MedicineOrderItem) {
    setViewingItem(item);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((row) => row.id !== id));
    toast.success("Medicine deleted");
  }

  function handleAddToOrder() {
    setItems((prev) => prev.map((row) => (row.status === "Pending" ? { ...row, status: "Active" } : row)));
    toast.success("Medicines sent to pharmacy. Pending items are now active.");
  }

  function handleClearAll() {
    setItems([]);
    toast.success("All medicines deleted");
  }

  function handleBack() {
    router.push(`/doctor/ipd/progress-note?uhid=${uhid}`);
  }

  function handleNextInvestigationOrders() {
    router.push(`/doctor/ipd/investigation-orders?uhid=${uhid}`);
  }

  function handleViewAllVitals() {
    router.push(`/doctor/ipd/review-vitals?uhid=${uhid}`);
  }

  function handleAddProgressNote() {
    router.push(`/doctor/ipd/progress-note?uhid=${uhid}`);
  }

  function handleViewLabResults() {
    router.push(`/doctor/ipd/review-lab-results?uhid=${uhid}`);
  }

  function handleTreatmentPlan() {
    router.push(`/doctor/ipd/treatment-plan?uhid=${uhid}`);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1400px] space-y-5">
        {!embedded && (
          <PatientProfileCard
            patient={profile}
            patientsPath="/doctor/ipd/patients"
            subtitle="IPD Patient"
            headerActions={
              <PillButton variant="outline" className="w-full lg:w-auto" onClick={() => setChangePatientOpen(true)}>
                Change Patient
              </PillButton>
            }
          />
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Medicine Orders</h1>
                <p className="text-xs text-slate-400">Prescribe and review medicines for the patient.</p>
              </div>
            </div>

            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <SuffixedInput
                      label="Search Medicine"
                      value={searchMedicine}
                      onChange={setSearchMedicine}
                      placeholder="Search by medicine name"
                    />
                  </div>

                  <div className="flex items-end">
                    <PillButton
                      icon={Plus}
                      className="w-full md:w-auto"
                      onClick={handleAddToOrder}
                      disabled={!hasPendingMedicine}
                    >
                      Send to Pharmacy
                    </PillButton>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-800">Ordered Medicines ({filteredItems.length})</p>
                  <MedicineOrdersTable items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} onView={setViewingItem} />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <PillButton variant="outline" icon={Plus} onClick={handleOpenAddMedicine}>
                    Add Medicine
                  </PillButton>

                  <PillButton
                    variant="danger"
                    icon={Trash2}
                    onClick={() => setClearAllOpen(true)}
                    disabled={items.length === 0}
                  >
                    Clear All
                  </PillButton>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm py-0">
              <CardContent className="py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">Order Instructions / Notes (Optional)</p>
                <FormTextarea
                  label=""
                  value={notes}
                  onChange={setNotes}
                  rows={5}
                  maxLength={1000}
                />
              </CardContent>
            </Card>

            {!embedded && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" /> Orders will be sent to pharmacy for verification and dispensing.
                </p>
              </div>
            )}

            {!embedded && (
              <div className="flex justify-between gap-2">
                <PillButton variant="outline" icon={ArrowLeft} onClick={handleBack}>
                  Back
                </PillButton>
                <PillButton icon={ArrowRight} onClick={handleNextInvestigationOrders}>
                  Next: Review Lab Orders
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
                <p className="text-sm font-semibold text-slate-800">Order Summary</p>
                <SummaryRow label="Total Medicines" value={String(items.length)} />
                <SummaryRow label="Active Orders" value={String(activeCount)} />
                <SummaryRow label="Course Completed" value={String(completedCount)} />
                <SummaryRow label="Pending Orders" value={String(items.filter((i) => i.status === "Pending").length)} />
              </CardContent>
            </Card>

            <QuickActionsCard
              actions={[
                {
                  label: "View Lab Results",
                  icon: FileText,
                  onClick: handleViewLabResults,
                },
                {
                  label: "Add Progress Note",
                  icon: StickyNote,
                  onClick: handleAddProgressNote,
                },
                {
                  label: "Treatment Plan",
                  icon: PillBottle,
                  onClick: handleTreatmentPlan,
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

      <MedicineDrawer
        open={addMedicineOpen}
        onOpenChange={setAddMedicineOpen}
        onSubmit={handleAddMedicineDrafts}
      />

      <MedicineDetailDrawer item={viewingItem} onClose={() => setViewingItem(null)} />

      <ClearAllMedicinesDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        onConfirm={handleClearAll}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

const KNOWN_ROUTES = ["PO", "IV", "IM", "SC", "SL", "PR", "INH", "TOP", "SUB"];

function splitDosage(dosage: string): { dose: string; route: string } {
  const tokens = dosage.trim().split(/\s+/);
  const last = tokens[tokens.length - 1]?.toUpperCase();
  if (last && KNOWN_ROUTES.includes(last)) {
    return { dose: tokens.slice(0, -1).join(" "), route: last };
  }
  return { dose: dosage.trim(), route: "" };
}

function timesPerDayFor(frequency: string): number {
  const map: Record<string, number> = { OD: 1, BD: 2, TDS: 3, QID: 4, SOS: 1 };
  const key = frequency.trim().split(/\s+/)[0]?.toUpperCase() ?? "";
  return map[key] ?? 1;
}


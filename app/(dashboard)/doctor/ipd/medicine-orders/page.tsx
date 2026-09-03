// app/doctor/ipd/medicine-orders/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Info, Plus, Trash2,
  FileText,
  LucideIcon,
  StickyNote,
  PillBottle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { WARD_ROUND_PATIENTS, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { getVitalsForPatient } from "@/lib/doctor/ipd/vitals-data";
import { getMedicineOrdersData } from "@/lib/doctor/ipd/medicine-orders-data";
import { MedicineOrdersTable } from "./_components/medicine-orders-table";
import { AddMedicineDialog } from "./_components/add-medicine-dialog";
import { ClearAllMedicinesDialog } from "./_components/clear-all-medicines-dialog";
import { MedicineDetailDrawer } from "./_components/medicine-detail-drawer";
import type { MedicineOrderItem } from "@/types/doctor/ipd/medicine-order-types";
import { PatientStatusBadge } from "../ward-rounds/_components/patient-status-badge";
import { LatestVitalsMini } from "../clinical-examination/_components/latest-vitals-mini";
import { ChangePatientDialog } from "../ward-rounds/_components/change-patient-dialog";

export default function MedicineOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uhid = searchParams.get("uhid") ?? WARD_ROUND_PATIENTS[0].uhid;

  const patient = useMemo(() => getPatientByUhid(uhid), [uhid]);
  const vitals = useMemo(() => getVitalsForPatient(uhid)[0], [uhid]);
  const initialData = useMemo(() => getMedicineOrdersData(uhid), [uhid]);

  const [changePatientOpen, setChangePatientOpen] = useState(false);
  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicineOrderItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MedicineOrderItem | null>(null);

  const [searchMedicine, setSearchMedicine] = useState("");
  const [items, setItems] = useState<MedicineOrderItem[]>(initialData.items);
  const [notes, setNotes] = useState(initialData.notes);

  useEffect(() => {
    setItems(getMedicineOrdersData(uhid).items);
    setNotes(getMedicineOrdersData(uhid).notes);
    setSearchMedicine("");
    setEditingItem(null);
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
    setEditingItem(null);
    setAddMedicineOpen(true);
  }

  function handleSaveMedicine(item: MedicineOrderItem) {
    if (editingItem) {
      setItems((prev) => prev.map((row) => (row.id === item.id ? item : row)));
      toast.success("Medicine updated and marked as pending");
    } else {
      setItems((prev) => [...prev, item]);
      toast.success("Medicine added with pending status");
    }
  }

  function handleEdit(item: MedicineOrderItem) {
    setEditingItem(item);
    setAddMedicineOpen(true);
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
              <InfoBlock label="Attending Doctor" value={patient.admittingDoctor} />
              <InfoBlock label="Admission Date" value={patient.admissionDateTime} />
            </div>

            <Button variant="outline" className="w-full gap-2 lg:w-auto" onClick={() => setChangePatientOpen(true)}>
              Change Patient
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Medicine Orders</h1>
                <p className="text-xs text-slate-400">Prescribe and review medicines for the patient.</p>
              </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <label className="text-xs text-slate-500">Search Medicine</label>
                    <Input
                      className="mt-1"
                      placeholder="Search by medicine name"
                      value={searchMedicine}
                      onChange={(e) => setSearchMedicine(e.target.value)}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 md:w-auto"
                      onClick={handleAddToOrder}
                      disabled={!hasPendingMedicine}
                    >
                      <Plus className="h-4 w-4" /> Send to Pharmacy
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-800">Ordered Medicines ({filteredItems.length})</p>
                  <MedicineOrdersTable items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} onView={setViewingItem} />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="outline" className="gap-2" onClick={handleOpenAddMedicine}>
                    <Plus className="h-4 w-4" /> Add Medicine
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

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">Order Instructions / Notes (Optional)</p>
                <Textarea rows={5} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <p className="text-right text-xs text-slate-400">{notes.length}/1000</p>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <p className="flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" /> Orders will be sent to pharmacy for verification and dispensing.
              </p>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" className="gap-2" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleNextInvestigationOrders}>
                Next: Review Lab Orders <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            <LatestVitalsMini vitals={vitals} onViewAll={handleViewAllVitals} />

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-3 py-4">
                <p className="text-sm font-semibold text-slate-800">Order Summary</p>
                <SummaryRow label="Total Medicines" value={String(items.length)} />
                <SummaryRow label="Active Orders" value={String(activeCount)} />
                <SummaryRow label="Course Completed" value={String(completedCount)} />
                <SummaryRow label="Pending Orders" value={String(items.filter((i) => i.status === "Pending").length)} />
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-1 py-3">
                <p className="mb-2 px-2 text-sm font-semibold text-slate-800">Quick Actions</p>
                <QuickAction icon={FileText} label="View Lab Results" onClick={handleViewLabResults} />
                <QuickAction icon={StickyNote} label="Add Progress Note" onClick={handleAddProgressNote} />
                <QuickAction icon={PillBottle} label="Treatment Plan" onClick={handleTreatmentPlan} />
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

      <AddMedicineDialog
        open={addMedicineOpen}
        onOpenChange={setAddMedicineOpen}
        editingItem={editingItem}
        onSave={handleSaveMedicine}
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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="whitespace-nowrap text-sm font-semibold text-slate-800">{value}</p>
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

function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
    >
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
    </button>
  );
}

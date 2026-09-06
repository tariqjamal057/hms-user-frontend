// app/(dashboard)/doctor/ipd/patient-detail/page.tsx
"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PatientDetailShell, type PatientTab, type PatientDetailData, type PatientListItem } from "@/components/patient-detail/patient-detail-shell";
import { getAllWardPatients, getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { wardRoundProfileDetail } from "@/lib/patient-detail/patient-profile-data";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";
import { TabOverview } from "@/app/(dashboard)/nurse/ipd/patients/[uhid]/_components/tab-overview";
import { getNursePatientByUhid } from "@/lib/nurse/ipd/nurse-ipd-data";
import type { NurseIpdPatient } from "@/types/nurse/ipd/nurse-ipd-types";
import type { EmarDose, FluidBalanceEntry, ProgressNote, VitalRecord } from "@/types/nurse/ipd/nurse-ipd-types";
import { getVitalsForPatient, getEmarForPatient, getProgressNotesForPatient, getFluidBalanceForPatient, NURSE_SHIFT_ASSIGNMENTS } from "@/lib/nurse/icu/nurse-icu-data";
import { DataTable, type DataColumn } from "@/components/patient-detail/data-table";
import { CareStatusStepper, type CareStatus } from "@/components/patient-detail/care-status";
import { FluidBalanceSection } from "@/components/patient-detail/fluid-balance-section";
import { TabHandover } from "@/app/(dashboard)/nurse/icu/patients/[uhid]/_components/tab-handover";
import { TreatmentPlanTracker } from "@/components/patient-detail/treatment-plan-tracker";
import { getTreatmentPlanTrackerData } from "@/lib/patient-detail/treatment-plan-tracker-data";
import { CURRENT_DOCTOR } from "@/lib/doctor/icu/doctor-icu-data";
import ReviewVitalsPage from "../review-vitals/page";
import DiagnosisUpdatePage from "../diagnosis-update/page";
import ProgressNotesPage from "../progress-note/page";
import MedicineOrdersPage from "../medicine-orders/page";
import InvestigationOrdersPage from "../investigation-orders/page";
import DischargeDecisionPage from "../discharge-decision/page";

function toNurseIpdView(p: WardRoundPatient): NurseIpdPatient {
  const nurse = getNursePatientByUhid(p.uhid);
  return {
    uhid: p.uhid,
    ipdId: nurse?.ipdId ?? p.ipdId,
    patientName: p.patientName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    acuity: p.status,
    ward: nurse?.ward ?? "",
    room: nurse?.room ?? "",
    bed: nurse?.bed ?? "",
    department: p.department,
    admittingDoctor: p.admittingDoctor,
    admissionDateTime: p.admissionDateTime,
    allergies: p.allergies ?? [],
    currentDiagnosis: p.currentDiagnosis,
    diagnosisCode: p.diagnosisCode,
    assignedNurse: nurse?.assignedNurse ?? p.admittingDoctor,
    currentShift: nurse?.currentShift ?? "Morning",
  };
}

function toDetailData(p: WardRoundPatient): PatientDetailData {
  return wardRoundProfileDetail(p);
}

function PatientDetailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const all = useMemo(() => getAllWardPatients(), []);
  const requestedUhid = params.get("uhid");
  const initialUhid =
    requestedUhid && all.some((p) => p.uhid === requestedUhid)
      ? requestedUhid
      : (all[0]?.uhid ?? "");
  const [uhid, setUhid] = useState<string>(initialUhid);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [vitals, setVitals] = useState<VitalRecord[]>(() => getVitalsForPatient(uhid));
  const [doses, setDoses] = useState<EmarDose[]>(() => getEmarForPatient(uhid));
  const [notes, setNotes] = useState<ProgressNote[]>(() => getProgressNotesForPatient(uhid));
  const [fluidEntries, setFluidEntries] = useState<FluidBalanceEntry[]>(() => getFluidBalanceForPatient(uhid));
  const [careStatus, setCareStatus] = useState<CareStatus>(() =>
    getPatientByUhid(uhid)?.status === "Under Observation" ? "Under Observation" : "Under Treatment",
  );
  const patient = getPatientByUhid(uhid);

  useEffect(() => {
    setVitals(getVitalsForPatient(uhid));
    setDoses(getEmarForPatient(uhid));
    setNotes(getProgressNotesForPatient(uhid));
    setFluidEntries(getFluidBalanceForPatient(uhid));
    setCareStatus(getPatientByUhid(uhid)?.status === "Under Observation" ? "Under Observation" : "Under Treatment");
  }, [uhid]);

  function addFluidEntry(entry: FluidBalanceEntry) {
    setFluidEntries((previous) => [entry, ...previous]);
    toast.success("Fluid balance entry recorded.");
  }

  function handleCareStatusChange(status: CareStatus) {
    setCareStatus(status);
    if (status === "Ready for Discharge") {
      toast.success("Patient marked ready for discharge — review the Discharge Decision tab.");
    } else {
      toast.success(`Patient status updated to ${status}.`);
    }
  }

  const detail: PatientDetailData | undefined = patient ? toDetailData(patient) : undefined;

  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName,
        subtitle: `${p.uhid} · ${p.ipdId} · ${p.wardRoomBed}`,
      })),
    [all],
  );

  if (!patient || !detail) {
    return <div className="p-10 text-center text-sm text-slate-400">No IPD patients available</div>;
  }

  const nurseView = toNurseIpdView(patient);
  const nurseAssignments = NURSE_SHIFT_ASSIGNMENTS[uhid] || [];

  const shiftColumns: DataColumn<typeof nurseAssignments[number]>[] = [
    {
      key: "date",
      label: "Date",
      render: (a) => (
        <span className="text-slate-700">
          {new Date(a.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "shift",
      label: "Shift",
      render: (a) => (
        <Badge
          variant="outline"
          className={
            a.shift === "Morning"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : a.shift === "Afternoon"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-indigo-200 bg-indigo-50 text-indigo-700"
          }
        >
          {a.shift}
        </Badge>
      ),
    },
    {
      key: "nurseName",
      label: "Nurse",
      render: (a) => <span className="font-medium text-slate-800">{a.nurseName}</span>,
    },
    {
      key: "nurseId",
      label: "Nurse ID",
      render: (a) => <span className="text-slate-600">{a.nurseId}</span>,
    },
    {
      key: "ward",
      label: "Ward",
      render: (a) => <span className="text-slate-700">{a.ward}</span>,
    },
  ];

  const tabs: PatientTab[] = [
    { value: "overview", label: "Overview", content: <TabOverview patient={nurseView} onNext={() => setActiveTab("review-vitals")} /> },
    { value: "review-vitals", label: "Review Vitals", content: <ReviewVitalsPage key={uhid} uhid={uhid} embedded /> },
    { value: "diagnosis-update", label: "Diagnosis Update", content: <DiagnosisUpdatePage key={uhid} uhid={uhid} embedded /> },
    { value: "progress-note", label: "Progress Note", content: <ProgressNotesPage key={uhid} uhid={uhid} embedded /> },
    { value: "medicine-orders", label: "Medicine Orders", content: <MedicineOrdersPage key={uhid} uhid={uhid} embedded /> },
    { value: "lab-orders", label: "Lab Orders", content: <InvestigationOrdersPage key={uhid} uhid={uhid} embedded /> },
    {
      value: "fluid",
      label: "Fluid Balance",
      content: (
        <FluidBalanceSection
          entries={fluidEntries}
          onAddEntry={addFluidEntry}
          authorName={CURRENT_DOCTOR.name}
          title="Fluid Balance Chart"
        />
      ),
    },
    {
      value: "treatment-plan",
      label: "Treatment Plan",
      content: (
        <TreatmentPlanTracker
          key={uhid}
          data={getTreatmentPlanTrackerData(uhid)}
          updatedAt="Just now"
          onOpenActivity={(a) => {
            const tabByModule: Record<string, string> = {
              medicine: "medicine-orders",
              laboratory: "lab-orders",
              vitals: "review-vitals",
              diagnosis: "diagnosis-update",
              fluid: "fluid",
            };
            setActiveTab(tabByModule[a.module] ?? "treatment-plan");
          }}
        />
      ),
    },
    {
      value: "nurse-shift",
      label: "Nurse Shift",
      content: (
        <DataTable
          card
          title="Nurse Shift Assignments"
          titleIcon={<UserCog className="h-4 w-4" />}
          rows={nurseAssignments}
          columns={shiftColumns}
          rowKey={(a) => a.id}
          countLabel="assignments"
          emptyText="No nurse shift assignments recorded yet."
          searchable
          searchPlaceholder="Search nurse, ward or date..."
          filters={[
            {
              id: "shift-filter",
              type: "select",
              label: "Shift",
              placeholder: "All shifts",
              options: Array.from(new Set(nurseAssignments.map((a) => a.shift))).map((s) => ({ value: s, label: s })),
              getValue: (a) => a.shift,
            },
          ]}
        />
      ),
    },
    {
      value: "handover",
      label: "Handover",
      content: (
        <TabHandover
          patient={nurseView}
          vitals={vitals}
          doses={doses}
          notes={notes}
          fluidEntries={fluidEntries}
        />
      ),
    },
    {
      value: "encounter-status",
      label: "Encounter Status",
      content: (
        <CareStatusStepper
          value={careStatus}
          onChange={handleCareStatusChange}
          allowedStatuses={["Under Treatment", "Under Observation", "Ready for Discharge"]}
          authorityLabel="Doctor — IPD ward"
        />
      ),
    },
    { value: "discharge-decision", label: "Discharge Decision", content: <DischargeDecisionPage key={uhid} uhid={uhid} embedded /> },
  ];

  return (
    <PatientDetailShell
      patient={detail}
      patientList={patientList}
      patientsPath="/doctor/ipd/patients"
      tabs={tabs}
      defaultTab="overview"
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      showPatientSwitcher
      onSwitchPatient={(u) => setUhid(u)}
      onBack={() => router.push("/doctor/ipd/patients")}
      subtitle="IPD Patient"
    />
  );
}

export default function DoctorIpdPatientDetailPage() {
  return (
    <Suspense fallback={null}>
      <PatientDetailInner />
    </Suspense>
  );
}

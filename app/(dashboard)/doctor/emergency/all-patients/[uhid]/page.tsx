// app/(dashboard)/doctor/emergency/all-patients/[uhid]/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FilePlus2, HeartPulse, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { PillButton } from "@/components/forms/pill-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PatientDetailShell,
  type PatientTab,
  type PatientDetailData,
  type PatientListItem,
} from "@/components/patient-detail/patient-detail-shell";
import type { RmoEmergencyPatient } from "@/types/emergency/rmo-emergency-types";
import type { EmergencyPatient, TreatmentPlanItem } from "@/types/emergency/emergency-types";
import { EMERGENCY_PATIENTS } from "@/lib/emergency/emergency-data";
import { DiagnosisDrawer, type DiagnosisDraft } from "@/components/consultation/diagnosis-drawer";
import { MedicineDrawer, type MedicineDraft } from "@/components/consultation/medicine-drawer";
import { LabDrawer, type LabDraft } from "@/components/consultation/lab-drawer";
import { EmergencyStatusWorkflow } from "@/app/(dashboard)/rmo/emergency/all-patients/_components/emergency-status-workflow";
import { TreatmentPlanForm } from "@/app/(dashboard)/rmo/emergency/all-patients/_components/section-treatment-plan-form";
import { SectionRegistration } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-registration";
import { SectionVitals } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-vitals";
import { SectionDiagnosis } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-diagnosis";
import { SectionMedicines } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-medicines";
import { SectionLabReports } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-lab-reports";
import { SectionProgressNotes } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-progress-notes";
import { SectionTreatmentPlan } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-treatment-plan";
import { SectionAssignedNurses } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-assigned-nurses";
import { SectionHandoverPolice } from "@/app/(dashboard)/admission/emergency/all-patients/_components/drawer/section-handover-police";

function toRmo(p: EmergencyPatient): RmoEmergencyPatient {
  return { ...p, criticalNotifications: [], deathRecord: undefined, department: "Critical Care" };
}

function toDetailData(p: EmergencyPatient): PatientDetailData {
  return {
    uhid: p.uhid,
    name: p.patientName || "Unidentified Patient",
    age: p.age ?? 0,
    gender: p.gender,
    bloodGroup: "—",
    allergies: p.allergies ?? [],
    moduleId: p.emergencyNumber,
    moduleIdLabel: "Emergency No.",
    locationParts: [p.bedOrBay],
    causeOfProblem: p.currentCondition,
    metaLine: p.incidentType,
    fallbackInfoFields: [
      { label: "Incident", value: p.incidentType },
      { label: "Arrival", value: p.arrivalMode },
      { label: "Attending Doctor", value: p.attendingDoctor || "Unassigned" },
    ],
  };
}

type SectionTone = "blue" | "purple" | "emerald" | "amber" | "red";

const TONE_BG: Record<SectionTone, string> = {
  blue: "border-blue-200 bg-blue-50/60",
  purple: "border-purple-200 bg-purple-50/60",
  emerald: "border-emerald-200 bg-emerald-50/60",
  amber: "border-amber-200 bg-amber-50/60",
  red: "border-red-200 bg-red-50/60",
};

function SectionAction({
  title,
  count,
  icon: Icon,
  onAdd,
  tone = "blue",
  addLabel = "Add New",
  secondaryLabel,
  onSecondary,
  secondaryTone = "outline",
}: {
  title: string;
  count?: number;
  icon?: React.ElementType;
  onAdd: () => void;
  tone?: SectionTone;
  addLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryTone?: "outline" | "gradient" | "danger";
}) {
  return (
    <div
      className={`mb-4 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${TONE_BG[tone]}`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-600" />}
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {typeof count === "number" && (
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {count}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {secondaryLabel && onSecondary && (
          <PillButton size="sm" variant={secondaryTone} onClick={onSecondary}>
            {secondaryLabel}
          </PillButton>
        )}
        <PillButton size="sm" icon={FilePlus2} onClick={onAdd}>
          {addLabel}
        </PillButton>
      </div>
    </div>
  );
}

export default function DoctorEmergencyPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uhid = params.uhid as string;

  const all = useMemo(() => EMERGENCY_PATIENTS.map(toRmo), []);
  const patient = useMemo(
    () => all.find((p) => p.uhid === uhid) ?? null,
    [all, uhid],
  );
  const [version, setVersion] = useState<RmoEmergencyPatient | null>(patient);
  const active = version ?? patient;

  const [diagOpen, setDiagOpen] = useState(false);
  const [medOpen, setMedOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [addingTreatment, setAddingTreatment] = useState(false);

  const detail: PatientDetailData | undefined = active
    ? toDetailData(active)
    : undefined;

  const patientList: PatientListItem[] = useMemo(
    () =>
      all.map((p) => ({
        uhid: p.uhid,
        name: p.patientName || "Unidentified",
        subtitle: `${p.uhid} · ${p.emergencyNumber} · ${p.bedOrBay}`,
      })),
    [all],
  );

  if (!active || !detail) {
    return (
      <div className="p-10 text-center text-sm text-slate-400">
        Patient not found for UHID {uhid}
      </div>
    );
  }

  function addDiagnoses(drafts: DiagnosisDraft[]) {
    if (!active) return;
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const next = drafts.map((d) => ({
      id: `DG-${Date.now()}-${d.id}`,
      name: d.name,
      code: d.icd10 || "—",
      type: (d.type === "active"
        ? "Confirmed"
        : d.type === "chronic"
          ? "Confirmed"
          : "Provisional") as "Confirmed" | "Provisional" | "Differential",
      notes: "",
      addedBy: "Doctor",
      addedAt: stamp,
    }));
    setVersion({ ...active, diagnoses: [...next, ...active.diagnoses] });
    toast.success(`${next.length} diagnosis added`);
  }

  function addMedicines(drafts: MedicineDraft[]) {
    if (!active) return;
    const date = new Date().toISOString().slice(0, 10);
    const next = drafts.map((d, i) => ({
      id: `M-${Date.now()}-${i}`,
      medicineName: d.name,
      medicineCode: "",
      strength: "",
      route: "",
      slot: "OD" as const,
      scheduledTime: "As ordered",
      status: "Pending" as const,
      urgency: "Routine" as const,
      deliveredFromPharmacyAt: undefined,
      givenBy: undefined,
      givenAt: undefined,
      instructions: d.instructions,
      outOfStockRemark: undefined,
      date,
    }));
    setVersion({ ...active, doses: [...next, ...active.doses] });
    toast.success(`${next.length} medicine(s) added`);
  }

  function addLabs(drafts: LabDraft[]) {
    if (!active) return;
    const date = new Date().toISOString().slice(0, 10);
    const next = drafts.map((d, i) => ({
      id: `L-${Date.now()}-${i}`,
      testName: d.test,
      category:
        d.department === "pathology" ? ("Pathology" as const) : ("Radiology" as const),
      date,
      orderedBy: "Doctor",
      reportedAt: "Ordered — awaiting lab",
      pathologyResults: [],
      reportImageUrl: undefined,
      notes: "",
    }));
    setVersion({ ...active, labReports: [...next, ...active.labReports] });
    toast.success(`${next.length} lab order(s) added`);
  }

  function addTreatmentPlan(
    plan: Omit<TreatmentPlanItem, "id" | "orderedOn" | "followStatus">,
  ) {
    if (!active) return;
    const stamp = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const newPlan: TreatmentPlanItem = {
      ...plan,
      id: `T-${Date.now()}`,
      orderedOn: stamp,
      followStatus: "Following",
    };
    setVersion({ ...active, treatmentPlans: [newPlan, ...active.treatmentPlans] });
    setAddingTreatment(false);
  }

  const tabs: PatientTab[] = [
    {
      value: "registration",
      label: "Registration",
      content: <SectionRegistration patient={active} />,
    },
    {
      value: "vitals",
      label: "Vitals",
      content: (
        <>
          <SectionAction
            title="Vitals History"
            count={active.vitals.length}
            icon={HeartPulse}
            tone="blue"
            addLabel="Record Vitals"
            onAdd={() =>
              router.push(
                `/doctor/emergency/all-patients/${active.uhid}/record-vitals`,
              )
            }
          />
          <SectionVitals vitals={active.vitals} />
        </>
      ),
    },
    {
      value: "diagnosis",
      label: "Diagnosis",
      content: (
        <>
          <SectionAction
            title="Diagnosis"
            count={active.diagnoses.length}
            icon={Stethoscope}
            tone="purple"
            onAdd={() => setDiagOpen(true)}
          />
          <SectionDiagnosis diagnoses={active.diagnoses} />
        </>
      ),
    },
    {
      value: "medicines",
      label: "Medicines",
      content: (
        <>
          <SectionAction
            title="Medicine Orders"
            count={active.doses.length}
            tone="emerald"
            onAdd={() => setMedOpen(true)}
          />
          <SectionMedicines doses={active.doses} />
        </>
      ),
    },
    {
      value: "labs",
      label: "Labs",
      content: (
        <>
          <SectionAction
            title="Lab Orders"
            count={active.labReports.length}
            tone="amber"
            onAdd={() => setLabOpen(true)}
          />
          <SectionLabReports reports={active.labReports} />
        </>
      ),
    },
    {
      value: "notes",
      label: "Progress Notes",
      content: (
        <>
          <ProgressNotesHeader
            onAdd={() => toast.info("Use RMO drawer to add a note.")}
          />
          <SectionProgressNotes notes={active.progressNotes} />
        </>
      ),
    },
    {
      value: "treatment",
      label: "Treatment",
      content: (
        <>
          <SectionAction
            title="Treatment Plans"
            count={active.treatmentPlans.length}
            tone="purple"
            onAdd={() => setAddingTreatment(true)}
          />
          <SectionTreatmentPlan plans={active.treatmentPlans} />
        </>
      ),
    },
    {
      value: "nurses",
      label: "Nurses",
      content: <SectionAssignedNurses assignments={active.assignedNurses} />,
    },
    {
      value: "handover",
      label: "Handover",
      content: (
        <SectionHandoverPolice
          handovers={active.handovers}
          police={active.police}
          onInformPolice={() => undefined}
        />
      ),
    },
    {
      value: "status",
      label: "Status Log",
      content: (
        <EmergencyStatusWorkflow
          patient={active}
          onUpdate={(updated) => setVersion(updated)}
        />
      ),
    },
  ];

  return (
    <>
      <PatientDetailShell
        patient={detail}
        patientList={patientList}
        patientsPath="/doctor/emergency/all-patients"
        tabs={tabs}
        subtitle={`Emergency Case · Bed ${active.bedOrBay}`}
      />

      <DiagnosisDrawer
        open={diagOpen}
        onOpenChange={setDiagOpen}
        onSubmit={addDiagnoses}
      />
      <MedicineDrawer
        open={medOpen}
        onOpenChange={setMedOpen}
        onSubmit={addMedicines}
      />
      <LabDrawer
        open={labOpen}
        onOpenChange={setLabOpen}
        onSubmit={addLabs}
      />

      <TreatmentPlanForm
        open={addingTreatment}
        onOpenChange={setAddingTreatment}
        onSubmit={addTreatmentPlan}
      />
    </>
  );
}

function ProgressNotesHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="mb-4 border-blue-200 bg-blue-50/60 p-0">
      <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-bold text-slate-800">Progress Notes</p>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            Use Add New to record a new note
          </span>
        </div>
        <PillButton size="sm" icon={FilePlus2} onClick={onAdd}>
          Add Note
        </PillButton>
      </CardContent>
    </Card>
  );
}

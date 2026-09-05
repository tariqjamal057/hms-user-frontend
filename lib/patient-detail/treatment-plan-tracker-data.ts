// lib/patient-detail/treatment-plan-tracker-data.ts
import type {
  TreatmentActivity,
  TreatmentPlanTrackerData,
  TreatmentStep,
  TreatmentTimelineEvent,
} from "@/components/patient-detail/treatment-plan-tracker";
import { getPatientByUhid } from "@/lib/doctor/ipd/ward-round-data";
import { getDiagnosisData } from "@/lib/doctor/ipd/diagnosis-data";
import {
  getVitalsForPatient,
  getAlertsForPatient,
} from "@/lib/doctor/ipd/vitals-data";
import { getMedicineOrdersData } from "@/lib/doctor/ipd/medicine-orders-data";
import { getInvestigationOrdersData } from "@/lib/doctor/ipd/investigation-orders-data";
import { getTreatmentPlanData } from "@/lib/doctor/ipd/treatment-plan-data";
import { getFluidBalanceForPatient } from "@/lib/nurse/icu/nurse-icu-data";

const LAB_STAGES = [
  "Ordered",
  "Sample Collected",
  "Processing",
  "Report Ready",
  "Reviewed",
] as const;

function step(
  label: string,
  state: TreatmentStep["state"],
  time?: string,
): TreatmentStep {
  return { label, state, time };
}

function makeTimeline(
  events: Array<{
    time: string;
    title: string;
    detail?: string;
    tone?: TreatmentTimelineEvent["tone"];
  }>,
): TreatmentTimelineEvent[] {
  return events
    .filter((e) => e.time)
    .map((e) => ({ tone: "slate", ...e }));
}

function buildMedicineActivity(uhid: string): TreatmentActivity {
  const plan = getMedicineOrdersData(uhid);
  const orders = plan.items;

  let totalDoses = 0;
  let givenDoses = 0;
  let notGiven = 0;
  const deliveredAt: string[] = [];
  const givenAt: string[] = [];
  const orderedAt = new Set<string>();
  const completedOrders = orders.filter((o) => o.status === "Course Completed");

  orders.forEach((o) => {
    if (o.orderedOn) orderedAt.add(o.orderedOn);
    o.dailyLogs?.forEach((log) => {
      if (log.deliveredAt) deliveredAt.push(log.deliveredAt);
      totalDoses += log.doses?.length ?? 0;
      log.doses?.forEach((d) => {
        if (d.status === "Given") {
          givenDoses += 1;
          if (d.givenAt) givenAt.push(d.givenAt);
        } else {
          notGiven += 1;
        }
      });
    });
  });

  const allCompleted = orders.length > 0 && completedOrders.length === orders.length;
  const percent =
    totalDoses === 0
      ? completedOrders.length > 0
        ? 100
        : 0
      : Math.round((givenDoses / totalDoses) * 100);

  const overdueDose = orders
    .flatMap((o) => o.dailyLogs ?? [])
    .flatMap((l) => (l.doses ?? []).filter((d) => d.status !== "Given"))
    .find((d) => d.remarks);

  const steps: TreatmentStep[] = [
    step("Ordered", orderedAt.size > 0 ? "done" : "pending", [...orderedAt][0]?.split(",")[0]?.trim()),
    step(
      "Pharmacy Delivered",
      deliveredAt.length > 0 ? "done" : "pending",
      deliveredAt[0]?.split(",")[0]?.trim(),
    ),
    step(
      "Administered",
      allCompleted
        ? "done"
        : notGiven > 0
          ? "current"
          : givenDoses > 0
            ? "done"
            : "pending",
      givenAt[givenAt.length - 1]?.split(",")[0]?.trim(),
    ),
    step(
      allCompleted ? "Course Completed" : "Next Dose",
      allCompleted ? "done" : notGiven > 0 ? "current" : "pending",
      notGiven > 0 ? "Due today" : undefined,
    ),
  ];

  const timeline: TreatmentTimelineEvent[] = [];
  [...orderedAt].forEach((t) =>
    timeline.push({
      time: t,
      title: "Medicine ordered",
      detail: `By ${orders[0]?.orderedBy ?? "Doctor"}`,
      tone: "indigo",
    }),
  );
  deliveredAt.slice(0, 3).forEach((t) =>
    timeline.push({
      time: t,
      title: "Medicine delivered by pharmacy",
      detail: "Pharmacy → IPD ward",
      tone: "blue",
    }),
  );
  givenAt.slice(0, 4).forEach((t) =>
    timeline.push({
      time: t,
      title: "Dose administered to patient",
      detail: "Nursing record",
      tone: "emerald",
    }),
  );
  if (notGiven > 0)
    timeline.push({
      time: "Pending",
      title: "Dose not administered",
      detail: overdueDose?.remarks ?? "Awaiting pharmacy delivery",
      tone: "red",
    });

  return {
    id: "act-med",
    name: `Medication — ${orders.length} order${orders.length === 1 ? "" : "s"}`,
    subtitle: `Pharmacy · ${Math.max(0, totalDoses - givenDoses - notGiven)}· dose workflow`,
    module: "medicine",
    sourceModule: "Medical Order → Pharmacy → Nursing",
    sourceTone: "indigo",
    progress: percent,
    progressLabel:
      totalDoses === 0 ? `${completedOrders.length}/${orders.length}` : `${givenDoses}/${totalDoses}`,
    workflowLabel: "Medicine order → dispense → administer workflow",
    owner: orders[0]?.orderedBy ?? "Doctor",
    due: notGiven > 0 ? "Dose due today" : allCompleted ? "Completed" : "Next scheduled",
    dueOverdue: notGiven > 0,
    status: allCompleted
      ? "Completed"
      : notGiven > 0 || percent > 0
        ? "In Progress"
        : "Pending",
    steps,
    timeline,
    overdue:
      overdueDose?.remarks || notGiven > 0
        ? {
            message:
              overdueDose?.remarks ??
              "A scheduled dose was not administered. Review the Medicine Orders page.",
          }
        : undefined,
  };
}

function buildLabActivity(uhid: string): TreatmentActivity {
  const data = getInvestigationOrdersData(uhid);
  const items = data.items;

  const stageIndex = (s: string) => {
    const idx = LAB_STAGES.indexOf(s as (typeof LAB_STAGES)[number]);
    return idx < 0 ? 0 : idx;
  };

  const maxStage = Math.max(0, ...items.map((it) => stageIndex(it.status)));
  const reported = items.filter((it) => it.status === "Report Ready").length;
  const pendingCount = items.filter((it) => it.status !== "Report Ready").length;
  const percent =
    items.length === 0
      ? 0
      : Math.round(
          (items.reduce((sum, it) => sum + stageIndex(it.status) * 20, 0) /
            items.length),
        );

  const steps: TreatmentStep[] = LAB_STAGES.map((label, i) =>
    step(
      label,
      maxStage > i ? "done" : i === maxStage ? "current" : "pending",
    ),
  );

  const timeline = makeTimeline(
    items.map((it) => ({
      time: it.orderDate,
      title: `Lab • ${it.investigationName} ordered`,
      detail: `${it.department} · ${it.priority} · ${it.status}`,
      tone: "indigo" as const,
    })),
  );
  if (pendingCount > 0)
    timeline.push({
      time: "Pending",
      title: `${pendingCount} test${pendingCount === 1 ? "" : "s"} awaiting result`,
      detail: "Lab Desk processing",
      tone: "amber",
    });

  return {
    id: "act-lab",
    name: `Lab Investigation — ${items.length} test${items.length === 1 ? "" : "s"}`,
    subtitle: `Investigation · ${pendingCount > 0 ? "Results pending" : "All reported"}`,
    module: "laboratory",
    sourceModule: "Lab Order",
    sourceTone: "cyan",
    progress: percent,
    progressLabel: `${reported}/${items.length}`,
    workflowLabel: "Order → sample → process → report → review",
    owner: items[0]?.orderedBy ?? "Doctor",
    due: pendingCount > 0 ? "Result pending" : "Review in reports",
    dueOverdue: false,
    status:
      items.length === 0
        ? "Pending"
        : pendingCount === 0
          ? "Completed"
          : reported > 0
            ? "In Progress"
            : "Pending",
    steps,
    timeline,
  };
}

function buildVitalsActivity(uhid: string): TreatmentActivity {
  const vitals = getVitalsForPatient(uhid);
  const latest = vitals[0];

  const timeline = makeTimeline(
    vitals.slice(0, 4).map((v, i) => ({
      time: v.dateTime,
      title: i === 0 ? "Latest vitals recorded" : "Vitals recorded",
      detail: `BP ${v.bp} · Pulse ${v.pulse} · SpO₂ ${v.spo2}% · ${v.recordedBy}`,
      tone: i === 0 ? ("blue" as const) : ("slate" as const),
    })),
  );

  return {
    id: "act-vitals",
    name: `Vital Monitoring — ${vitals.length} recordings`,
    subtitle: "Continuous / scheduled monitoring",
    module: "vitals",
    sourceModule: "Vitals",
    sourceTone: "emerald",
    progress: 100,
    progressLabel: "ongoing",
    workflowLabel: "Scheduled → recorded → monitored",
    owner: latest?.recordedBy ?? "Nursing",
    due: `Next reading ${latest?.dateTime.split(",")[1]?.trim() ?? "08:00 AM"}`,
    dueOverdue: false,
    status: "Ongoing",
    steps: [
      step("Scheduled", "done", "Protocol"),
      step("Recorded", vitals.length > 0 ? "done" : "pending"),
      step("Monitored", "current", "Ongoing"),
    ],
    timeline,
  };
}

function buildDiagnosisActivity(uhid: string): TreatmentActivity {
  const diagnoses = getDiagnosisData(uhid).currentDiagnoses;

  const timeline = makeTimeline(
    diagnoses.map((d, i) => ({
      time: d.diagnosedOn,
      title: `${d.isPrimary ? "Primary diagnosis" : "Co-morbidity"} noted`,
      detail: `${d.diagnosis} · ${d.type}`,
      tone: i === 0 ? ("red" as const) : ("slate" as const),
    })),
  );

  return {
    id: "act-diagnosis",
    name: `Diagnosis Review — ${diagnoses.length} active`,
    subtitle: "Clinical problem classification",
    module: "diagnosis",
    sourceModule: "Diagnosis",
    sourceTone: "violet",
    progress: 100,
    progressLabel: diagnoses.length ? "reviewed" : "—",
    workflowLabel: "Problem noted → classified → treatment response reviewed",
    owner: "Dr. Amit Verma",
    due: "Review on next round",
    dueOverdue: false,
    status: "Ongoing",
    steps: [
      step("Problem Noted", diagnoses.length > 0 ? "done" : "pending"),
      step("Classified", diagnoses.length > 0 ? "done" : "pending"),
      step("Response Review", "current", "Next round"),
    ],
    timeline,
  };
}

function buildFluidActivity(uhid: string): TreatmentActivity {
  const entries = getFluidBalanceForPatient(uhid);
  const intake = entries
    .filter((e) => e.direction === "Intake")
    .reduce((sum, e) => sum + e.volumeMl, 0);
  const output = entries
    .filter((e) => e.direction === "Output")
    .reduce((sum, e) => sum + e.volumeMl, 0);

  const timeline = makeTimeline(
    entries.slice(0, 4).map((e, i) => ({
      time: e.dateTime,
      title: `${e.direction === "Intake" ? "Intake" : "Output"} recorded`,
      detail: `${e.description} · ${e.volumeMl} ml · ${e.recordedBy}`,
      tone: i === 0 ? ("emerald" as const) : ("slate" as const),
    })),
  );

  return {
    id: "act-fluid",
    name: `Intake & Output — ${entries.length} entries`,
    subtitle: "Fluid balance chart",
    module: "fluid",
    sourceModule: "Fluid Balance",
    sourceTone: "orange",
    progress: entries.length > 0 ? 100 : 25,
    progressLabel: entries.length > 0 ? "today" : "no entries",
    workflowLabel: "Planned → recorded → balanced",
    owner: "Nursing",
    due: entries.length > 0 ? "Next entry 2 PM" : "First entry due",
    dueOverdue: entries.length === 0,
    status: entries.length > 0 ? "Ongoing" : "Pending",
    steps: [
      step("Planned", "done", "Chart"),
      step("Recorded", entries.length > 0 ? "done" : "current"),
      step("Balanced", "current", `In ${intake} ml / Out ${output} ml`),
    ],
    timeline,
  };
}

function buildPendingActions(
  uhid: string,
  activities: TreatmentActivity[],
) {
  const actions: TreatmentPlanTrackerData["pendingActions"] = [];

  const med = activities.find((a) => a.id === "act-med");
  if (med?.overdue) {
    actions.push({
      id: "pa-med",
      label: "Medicine administration",
      meta: "Overdue · dose not given",
      tone: "red",
    });
  }

  const lab = activities.find((a) => a.id === "act-lab");
  if (lab && lab.status !== "Completed") {
    actions.push({
      id: "pa-lab",
      label: "Lab result",
      meta: "Awaiting result",
      tone: "amber",
    });
  }

  getAlertsForPatient(uhid).slice(0, 2).forEach((alert, i) => {
    const severe = /high|low|spike|drop/i.test(alert.message);
    actions.push({
      id: `pa-vitals-${i}`,
      label: `Vitals alert — ${alert.type}`,
      meta: alert.message,
      tone: severe ? "red" : "amber",
    });
  });

  const fluid = activities.find((a) => a.id === "act-fluid");
  if (fluid && fluid.status === "Pending") {
    actions.push({
      id: "pa-fluid",
      label: "Fluid balance entry",
      meta: "None recorded today",
      tone: "slate",
    });
  }

  const diagnoses = getDiagnosisData(uhid).currentDiagnoses;
  if (diagnoses.length > 0) {
    actions.push({
      id: "pa-diagnosis",
      label: "Doctor review",
      meta: "Next round · Diagnosis Update",
      tone: "slate",
    });
  }

  return actions.slice(0, 6);
}

function buildCondition(uhid: string): TreatmentPlanTrackerData["condition"] {
  const patient = getPatientByUhid(uhid);
  const plan = getTreatmentPlanData(uhid);
  const diagnoses = getDiagnosisData(uhid).currentDiagnoses;

  const statusTone =
    patient?.status === "Critical"
      ? "red"
      : patient?.status === "Under Observation"
        ? "amber"
        : "emerald";

  const primary = diagnoses.find((d) => d.isPrimary)?.diagnosis;
  const priorities = plan.items.map((i) => i.priority);
  const priority = priorities.includes("High")
    ? "High"
    : priorities.includes("Medium")
      ? "Medium"
      : "Low";

  return {
    status: patient?.status ?? "Stable",
    statusTone,
    summary: `${primary ?? "Active clinical problem"} — under ${patient?.status === "Critical" ? "intensive observation" : "observation and treatment"}`,
    description: patient?.status === "Critical"
      ? "Condition remains critical but currently monitored. Continue prescribed treatment and reassess."
      : "Patient is being treated per the active care plan. Vitals, medication and lab response are being monitored.",
    careGoal: plan.goals[0] ?? "Stabilize & monitor",
    priority,
    location: patient?.wardRoomBed ?? "IPD",
    planStarted: patient?.admissionDateTime ?? "Today",
  };
}

function buildProblems(uhid: string): TreatmentPlanTrackerData["problems"] {
  const diagnoses = getDiagnosisData(uhid).currentDiagnoses;
  const plan = getTreatmentPlanData(uhid);
  const problems: TreatmentPlanTrackerData["problems"] = [];

  diagnoses.forEach((d, i) => {
    const related = plan.items
      .filter((it) => it.problemDiagnosis && it.problemDiagnosis.includes(d.diagnosis))
      .map((it) => it.category);
    const modules =
      related.length > 0
        ? related
        : d.isPrimary
          ? ["Medication", "Lab", "Monitoring", "Nursing"]
          : ["Vitals", "Monitoring", "Review"];

    problems.push({
      id: `prob-${d.id}`,
      code: `P${i + 1}`,
      tag: d.isPrimary ? "Active" : "Monitoring",
      tagTone: d.isPrimary ? "red" : "blue",
      title: d.diagnosis,
      goal: d.isPrimary
        ? plan.goals[0] ?? "Stabilize symptoms and monitor response."
        : plan.goals.slice(1, 2)[0] ??
          "Maintain close observation and identify abnormal trends early.",
      modules,
    });
  });

  return problems.slice(0, 4);
}

export function getTreatmentPlanTrackerData(
  uhid: string,
): TreatmentPlanTrackerData {
  const activities: TreatmentActivity[] = [
    buildMedicineActivity(uhid),
    buildLabActivity(uhid),
    buildVitalsActivity(uhid),
    buildDiagnosisActivity(uhid),
    buildFluidActivity(uhid),
  ].filter((a) => a);

  const completed = activities.filter(
    (a) => a.status === "Completed",
  ).length;
  const overdue = activities.filter((a) => a.status === "Overdue").length;
  const pending = activities.length - completed - overdue;
  const percent = Math.round(
    activities.reduce((sum, a) => sum + a.progress, 0) / activities.length,
  );

  return {
    overall: {
      percent,
      completed,
      total: activities.length,
      pending,
      overdue,
      status: "In Progress",
      note: `${percent}% represents completion of planned activities. It does not mean the patient is ${percent}% recovered.`,
    },
    condition: buildCondition(uhid),
    pendingActions: buildPendingActions(uhid, activities),
    problems: buildProblems(uhid),
    activities,
  };
}

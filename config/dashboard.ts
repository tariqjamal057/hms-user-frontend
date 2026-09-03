import {
  CalendarCheck,
  Users,
  BedDouble,
  UserRound,
  FlaskConical,
  ClipboardList,
  Stethoscope,
  FileCheck2,
  Activity,
  Car,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UserRole } from "@/config/roles";
import type { KpiCardProps, ActivityItem } from "@/components/dashboard/types";

export interface DashboardHeaderConfig {
  eyebrow: string;
  title: string;
  description: string;
}

export interface DashboardBlueprint {
  header: DashboardHeaderConfig;
  kpis: KpiCardProps[];
  activities: ActivityItem[];
  activityTitle: string;
  activityDescription: string;
}

const DASHBOARDS: Record<UserRole, DashboardBlueprint> = {
  [UserRole.DOCTOR]: {
    header: {
      eyebrow: "Clinical overview",
      title: "Doctor Dashboard",
      description: "Today's patient load, investigations and pending actions",
    },
    kpis: [
      {
        id: "doc-opd",
        accent: "blue",
        label: "OPD Patients",
        value: "24",
        icon: Stethoscope,
        trend: { value: 11.5, label: "vs yesterday" },
        sparkline: [30, 45, 40, 58, 66, 74, 82],
        footer: "18 walk-ins · 6 follow-ups",
        href: "/doctor/opd/appointments",
      },
      {
        id: "doc-appointments",
        accent: "indigo",
        label: "Appointments",
        value: "12",
        icon: CalendarCheck,
        trend: { value: 8.4, label: "vs yesterday" },
        sparkline: [36, 42, 46, 52, 58, 62, 68],
        footer: "4 upcoming today",
        href: "/doctor/opd/appointments",
      },
      {
        id: "doc-ipd",
        accent: "emerald",
        label: "IPD Patients",
        value: "8",
        icon: BedDouble,
        trend: { value: 4.3, label: "vs yesterday" },
        sparkline: [40, 38, 44, 42, 50, 48, 54],
        footer: "3 under review",
        href: "/doctor/ipd/patients",
      },
      {
        id: "doc-reports",
        accent: "violet",
        label: "Pending Reports",
        value: "5",
        icon: FileCheck2,
        trend: { value: -16.7, label: "vs yesterday" },
        sparkline: [60, 54, 58, 48, 42, 44, 34],
        footer: "Review required · 1 critical",
        href: "/doctor/ipd/investigation-orders",
      },
    ],
    activities: [
      {
        id: "a1",
        title: "Critical Potassium result · Ravi Sharma",
        meta: "12:18 PM",
        dotClassName: "bg-rose-500",
      },
      {
        id: "a2",
        title: "5 patients waiting > 30 min · OPD queue",
        meta: "12:05 PM",
        dotClassName: "bg-amber-500",
      },
      {
        id: "a3",
        title: "New lab order · Madhurima Sen",
        meta: "11:40 AM",
        dotClassName: "bg-blue-500",
      },
      {
        id: "a4",
        title: "Treatment plan pending · Debasish Roy",
        meta: "11:25 AM",
        dotClassName: "bg-violet-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Pending orders, results and follow-ups needing your action",
  },

  [UserRole.ADMISSION]: {
    header: {
      eyebrow: "Admission desk",
      title: "Admission Desk Dashboard",
      description: "Registrations, admissions, discharges and bed status",
    },
    kpis: [
      {
        id: "adm-new",
        accent: "blue",
        label: "New Patients",
        value: "18",
        icon: UserRound,
        trend: { value: 12.5, label: "vs yesterday" },
        sparkline: [28, 40, 36, 50, 58, 66, 74],
        footer: "8 walk-ins · 10 registered",
      },
      {
        id: "adm-active",
        accent: "indigo",
        label: "Active Admissions",
        value: "11",
        icon: ClipboardList,
        trend: { value: 4.2, label: "vs yesterday" },
        sparkline: [40, 42, 46, 44, 50, 48, 54],
        footer: "3 pending approval requests",
      },
      {
        id: "adm-discharged",
        accent: "emerald",
        label: "Discharged Today",
        value: "6",
        icon: Car,
        trend: { value: 20, label: "vs yesterday" },
        sparkline: [30, 36, 40, 46, 52, 58, 62],
        footer: "2 billing pending",
      },
      {
        id: "adm-beds",
        accent: "violet",
        label: "Available Beds",
        value: "22",
        icon: BedDouble,
        trend: { value: -8.3, label: "vs yesterday" },
        sparkline: [60, 56, 58, 50, 48, 46, 42],
        footer: "ICU 2 · General 12 · Private 8",
      },
    ],
    activities: [
      {
        id: "b1",
        title: "Admission request awaiting approval · Neha Singh",
        meta: "12:10 PM",
        dotClassName: "bg-rose-500",
      },
      {
        id: "b2",
        title: "New registration · patient #1024",
        meta: "12:10 PM",
        dotClassName: "bg-blue-500",
      },
      {
        id: "b3",
        title: "2 beds cleaned and available in ICU",
        meta: "11:55 AM",
        dotClassName: "bg-emerald-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Requests, registrations and bed updates in real time",
  },

  [UserRole.NURSE]: {
    header: {
      eyebrow: "Nursing overview",
      title: "Nurse Dashboard",
      description: "Ward census, vitals due and nursing tasks",
    },
    kpis: [
      {
        id: "nrs-opd",
        accent: "blue",
        label: "OPD Patients",
        value: "24",
        icon: Stethoscope,
        trend: { value: 11.5, label: "vs yesterday" },
        sparkline: [30, 45, 40, 58, 66, 74, 82],
        footer: "142 OPD consultations today",
      },
      {
        id: "nrs-ward",
        accent: "indigo",
        label: "Total In Ward Patient",
        value: "12",
        icon: BedDouble,
        trend: { value: 4.3, label: "vs yesterday" },
        sparkline: [40, 42, 46, 44, 50, 48, 54],
        footer: "General 7 · Private 3 · ICU 2",
      },
      {
        id: "nrs-ipd",
        accent: "emerald",
        label: "IPD Patients",
        value: "8",
        icon: Users,
        trend: { value: 6.7, label: "vs yesterday" },
        sparkline: [44, 46, 50, 48, 54, 56, 58],
        footer: "3 with discharge planning",
      },
      {
        id: "nrs-reports",
        accent: "violet",
        label: "Pending Reports",
        value: "5",
        icon: FileCheck2,
        trend: { value: -16.7, label: "vs yesterday" },
        sparkline: [60, 54, 58, 48, 42, 44, 34],
        footer: "Review required · 1 critical",
      },
    ],
    activities: [
      {
        id: "c1",
        title: "Vitals overdue · Ravi Sharma · bed G-14",
        meta: "12:30 PM",
        dotClassName: "bg-rose-500",
      },
      {
        id: "c2",
        title: "Medicine round due · Ward 3",
        meta: "1:00 PM",
        dotClassName: "bg-amber-500",
      },
      {
        id: "c3",
        title: "New admission assessment · Anita Roy",
        meta: "11:45 AM",
        dotClassName: "bg-blue-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Vitals, medications and assessments requiring attention",
  },

  [UserRole.PHARMACY]: {
    header: {
      eyebrow: "Pharmacy operations",
      title: "Pharmacy Dashboard",
      description: "Orders, dispensing, stock and dispatch status",
    },
    kpis: [
      {
        id: "phx-opd",
        accent: "blue",
        label: "OPD Patients",
        value: "24",
        icon: Stethoscope,
        trend: { value: 11.5, label: "vs yesterday" },
        sparkline: [30, 45, 40, 58, 66, 74, 82],
        footer: "54 OPD orders today",
      },
      {
        id: "phx-ward",
        accent: "indigo",
        label: "Total In Ward Patient",
        value: "12",
        icon: BedDouble,
        trend: { value: 4.3, label: "vs yesterday" },
        sparkline: [40, 42, 46, 44, 50, 48, 54],
        footer: "32 IPD orders today",
      },
      {
        id: "phx-ipd",
        accent: "emerald",
        label: "IPD Patients",
        value: "8",
        icon: Users,
        trend: { value: 6.7, label: "vs yesterday" },
        sparkline: [44, 46, 50, 48, 54, 56, 58],
        footer: "Ward 3 · Ward 5 · ICU",
      },
      {
        id: "phx-reports",
        accent: "violet",
        label: "Pending Reports",
        value: "5",
        icon: FileCheck2,
        trend: { value: -16.7, label: "vs yesterday" },
        sparkline: [60, 54, 58, 48, 42, 44, 34],
        footer: "7 ready for dispatch",
      },
    ],
    activities: [
      {
        id: "d1",
        title: "Cart packed · Rahul Ghosh · ₹2,460",
        meta: "12:34 PM",
        dotClassName: "bg-emerald-500",
      },
      {
        id: "d2",
        title: "IPD order needs verification · Ravi Sharma",
        meta: "12:15 PM",
        dotClassName: "bg-amber-500",
      },
      {
        id: "d3",
        title: "Stock below reorder · Paracetamol 500mg",
        meta: "11:30 AM",
        dotClassName: "bg-rose-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Order verification, packing and dispatch in real time",
  },

  [UserRole.LAB]: {
    header: {
      eyebrow: "Laboratory operations",
      title: "Lab Dashboard",
      description: "Test requests, processing and result dispatch",
    },
    kpis: [
      {
        id: "lab-new",
        accent: "blue",
        label: "New Patients",
        value: "24",
        icon: Stethoscope,
        trend: { value: 11.5, label: "vs yesterday" },
        sparkline: [30, 45, 40, 58, 66, 74, 82],
        footer: "64 test requests today",
      },
      {
        id: "lab-active",
        accent: "indigo",
        label: "Active Tests",
        value: "18",
        icon: FlaskConical,
        trend: { value: 5.9, label: "vs yesterday" },
        sparkline: [44, 46, 50, 48, 54, 56, 58],
        footer: "In progress across workstations",
      },
      {
        id: "lab-processing",
        accent: "emerald",
        label: "Processing Tests",
        value: "6",
        icon: Activity,
        trend: { value: -14.3, label: "vs yesterday" },
        sparkline: [54, 48, 50, 42, 40, 38, 34],
        footer: "Avg turnaround 24 min",
      },
      {
        id: "lab-ready",
        accent: "violet",
        label: "Ready to Send",
        value: "22",
        icon: FileCheck2,
        trend: { value: 10, label: "vs yesterday" },
        sparkline: [40, 44, 48, 52, 56, 60, 64],
        footer: "Awaiting dispatch to wards",
      },
    ],
    activities: [
      {
        id: "e1",
        title: "Critical result · Potassium 6.8 · Ravi Sharma",
        meta: "12:18 PM",
        dotClassName: "bg-rose-500",
      },
      {
        id: "e2",
        title: "Sample received · Madhurima Sen",
        meta: "12:10 PM",
        dotClassName: "bg-blue-500",
      },
      {
        id: "e3",
        title: "Results ready for dispatch · 5 reports",
        meta: "11:55 AM",
        dotClassName: "bg-emerald-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Critical results, processing and dispatch updates",
  },

  [UserRole.NURSEADMIN]: {
    header: {
      eyebrow: "Nursing administration",
      title: "Nurse Admin Dashboard",
      description: "Ward capacity, staffing and nursing oversight",
    },
    kpis: [
      {
        id: "na-ipd",
        accent: "blue",
        label: "IPD Patients",
        value: "24",
        icon: BedDouble,
        trend: { value: 4.3, label: "vs yesterday" },
        sparkline: [40, 42, 46, 44, 50, 48, 54],
        footer: "Across all wards",
      },
      {
        id: "na-ward",
        accent: "indigo",
        label: "Total In Ward Patient",
        value: "12",
        icon: Users,
        trend: { value: 6.7, label: "vs yesterday" },
        sparkline: [44, 46, 50, 48, 54, 56, 58],
        footer: "General 7 · Private 5",
      },
      {
        id: "na-new",
        accent: "emerald",
        label: "New Patients",
        value: "8",
        icon: UserRound,
        trend: { value: 14.3, label: "vs yesterday" },
        sparkline: [30, 36, 40, 46, 52, 58, 62],
        footer: "2 awaiting bed allocation",
      },
      {
        id: "na-reports",
        accent: "violet",
        label: "Pending Reports",
        value: "5",
        icon: FileCheck2,
        trend: { value: -16.7, label: "vs yesterday" },
        sparkline: [60, 54, 58, 48, 42, 44, 34],
        footer: "Review required · 1 critical",
      },
    ],
    activities: [
      {
        id: "f1",
        title: "Bed allocation required · Anita Roy",
        meta: "12:02 PM",
        dotClassName: "bg-amber-500",
      },
      {
        id: "f2",
        title: "Staffing shortfall · ICU night shift",
        meta: "11:40 AM",
        dotClassName: "bg-rose-500",
      },
      {
        id: "f3",
        title: "Handover notes pending review · Ward 3",
        meta: "11:20 AM",
        dotClassName: "bg-blue-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Bed allocation, staffing and ward oversight",
  },

  [UserRole.BILLING]: {
    header: {
      eyebrow: "Billing & finance",
      title: "Billing Dashboard",
      description: "Collections, dues, refunds and payment today",
    },
    kpis: [
      {
        id: "bil-opd",
        accent: "blue",
        label: "OPD Patients",
        value: "24",
        icon: Stethoscope,
        trend: { value: 11.5, label: "vs yesterday" },
        sparkline: [30, 45, 40, 58, 66, 74, 82],
        footer: "142 OPD billings today",
      },
      {
        id: "bil-ward",
        accent: "indigo",
        label: "Total In Ward Patient",
        value: "12",
        icon: BedDouble,
        trend: { value: 4.3, label: "vs yesterday" },
        sparkline: [40, 42, 46, 44, 50, 48, 54],
        footer: "24 IPD billings today",
      },
      {
        id: "bil-ipd",
        accent: "emerald",
        label: "IPD Patients",
        value: "8",
        icon: Users,
        trend: { value: 6.7, label: "vs yesterday" },
        sparkline: [44, 46, 50, 48, 54, 56, 58],
        footer: "₹1,24,800 outstanding",
      },
      {
        id: "bil-reports",
        accent: "violet",
        label: "Pending Reports",
        value: "5",
        icon: FileCheck2,
        trend: { value: -16.7, label: "vs yesterday" },
        sparkline: [60, 54, 58, 48, 42, 44, 34],
        footer: "6 approved · 2 processing",
      },
    ],
    activities: [
      {
        id: "g1",
        title: "Large due · Debasish Roy · ₹12,000",
        meta: "12:30 PM",
        dotClassName: "bg-amber-500",
      },
      {
        id: "g2",
        title: "Refund approved · Meena Kapoor · ₹2,100",
        meta: "12:05 PM",
        dotClassName: "bg-emerald-500",
      },
      {
        id: "g3",
        title: "Insurance claim ready · Ravi Sharma",
        meta: "11:50 AM",
        dotClassName: "bg-blue-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Collections, dues and payment processing updates",
  },

  [UserRole.RMO]: {
    header: {
      eyebrow: "Resident medical oversight",
      title: "RMO Dashboard",
      description: "Critical cases, transfers and hospital-wide readiness",
    },
    kpis: [
      {
        id: "rmo-ipd",
        accent: "blue",
        label: "IPD Patients",
        value: "24",
        icon: BedDouble,
        trend: { value: 4.3, label: "vs yesterday" },
        sparkline: [40, 42, 46, 44, 50, 48, 54],
        footer: "Across all wards",
      },
      {
        id: "rmo-ward",
        accent: "indigo",
        label: "Total In Ward Patient",
        value: "12",
        icon: Users,
        trend: { value: 6.7, label: "vs yesterday" },
        sparkline: [44, 46, 50, 48, 54, 56, 58],
        footer: "General 7 · Private 5",
      },
      {
        id: "rmo-new",
        accent: "emerald",
        label: "New Patients",
        value: "8",
        icon: UserRound,
        trend: { value: 14.3, label: "vs yesterday" },
        sparkline: [30, 36, 40, 46, 52, 58, 62],
        footer: "4 critical / resuscitation",
      },
      {
        id: "rmo-reports",
        accent: "violet",
        label: "Pending Reports",
        value: "5",
        icon: FileCheck2,
        trend: { value: -16.7, label: "vs yesterday" },
        sparkline: [60, 54, 58, 48, 42, 44, 34],
        footer: "3 unacknowledged critical",
      },
    ],
    activities: [
      {
        id: "h1",
        title: "ICU transfer request pending",
        meta: "12:20 PM",
        dotClassName: "bg-amber-500",
      },
      {
        id: "h2",
        title: "Critical lab · SpO₂ 89% · Anita Roy",
        meta: "12:20 PM",
        dotClassName: "bg-rose-500",
      },
      {
        id: "h3",
        title: "Night handover notes ready · 12 notes",
        meta: "11:35 PM",
        dotClassName: "bg-blue-500",
      },
    ],
    activityTitle: "Recent Activity",
    activityDescription: "Critical cases, transfers and handover items",
  },
};

const FALLBACK_ICON = Activity;

function getDashboard(userRole: UserRole): DashboardBlueprint | undefined {
  return DASHBOARDS[userRole];
}

export { DASHBOARDS, getDashboard, FALLBACK_ICON };
export type { LucideIcon };
import { SidebarItem } from "@/types/sidebar";
import {
  LayoutDashboard,
  Stethoscope,
  Activity,
  Siren,
  DiamondPlus,
} from "lucide-react";

const doctorSidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "OPD",
    icon: Stethoscope,
    section: "Clinical Operations",
    children: [
      { label: "Appointments", href: "/doctor/opd/appointments" },
    ],
  },
  {
    label: "IPD",
    icon: Activity,
    section: "Clinical Operations",
    children: [
      { label: "Patient List", href: "/doctor/ipd/patients" },
      { label: "Ward Rounds", href: "/doctor/ipd/ward-rounds" },
      { label: "Review Vitals", href: "/doctor/ipd/review-vitals" },
      { label: "Diagnosis Update", href: "/doctor/ipd/diagnosis-update" },
      { label: "Progress Note", href: "/doctor/ipd/progress-note" },
      { label: "Medicine Orders", href: "/doctor/ipd/medicine-orders" },
      { label: "Lab Orders", href: "/doctor/ipd/investigation-orders" },
      { label: "Treatment Plan", href: "/doctor/ipd/treatment-plan" },
      { label: "Discharge Decision", href: "/doctor/ipd/discharge-decision" },
    ],
  },
  {
    label: "Emergency",
    icon: Siren,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/doctor/emergency/all-patients" },
    ],
  },
  {
    label: "ICU",
    icon: DiamondPlus,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/doctor/icu/all-patients" },
    ],
  },
];

export default doctorSidebar;

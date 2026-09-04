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

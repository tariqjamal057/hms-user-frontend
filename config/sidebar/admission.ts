import { SidebarItem } from "@/types/sidebar";
import {
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  Activity,
  Stethoscope,
  Siren,
  DiamondPlus,
} from "lucide-react";

const admissionSidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admission/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "OPD",
    icon: Stethoscope,
    section: "Clinical Operations",
    children: [
      { label: "Appointments", href: "/admission/opd/appointments" },
      { label: "Today's Appointments", href: "/admission/opd/todays-appointments" },
    ],
  },
  {
    label: "IPD",
    icon: Activity,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/admission/ipd/all-patients" },
      { label: "Pending Admissions", href: "/admission/ipd/pending-admissions" },
      { label: "Department Requests", href: "/admission/ipd/department-requests" },
      { label: "Bed Availability", href: "/admission/ipd/bed-availability" },
    ],
  },
  {
    label: "Emergency",
    icon: Siren,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/admission/emergency/all-patients" },
    ],
  },
  {
    label: "ICU",
    icon: DiamondPlus,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/admission/icu/all-patients" },
    ],
  },
];

export default admissionSidebar;

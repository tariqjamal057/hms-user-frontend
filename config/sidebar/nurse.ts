import { SidebarItem } from "@/types/sidebar";
import {
  LayoutDashboard,
  Activity,
  Siren,
  DiamondPlus,
} from "lucide-react";

const nurseSidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/nurse/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "IPD",
    icon: Activity,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/nurse/ipd/patients" },
    ],
  },
  {
    label: "Emergency",
    icon: Siren,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/nurse/emergency/all-patients" },
    ],
  },
  {
    label: "ICU",
    icon: DiamondPlus,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/nurse/icu/patients" },
    ],
  },
];

export default nurseSidebar;

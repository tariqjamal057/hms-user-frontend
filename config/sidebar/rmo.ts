import { SidebarItem } from "@/types/sidebar";
import { LayoutDashboard, Activity, Siren, DiamondPlus } from "lucide-react";

const rmoSidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/rmo/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "IPD",
    icon: Activity,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/rmo/ipd/all-patients" },
    ],
  },
  {
    label: "Emergency",
    icon: Siren,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/rmo/emergency/all-patients" },
    ],
  },
  {
    label: "ICU",
    icon: DiamondPlus,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/rmo/icu/all-patients" },
    ],
  },
];

export default rmoSidebar;

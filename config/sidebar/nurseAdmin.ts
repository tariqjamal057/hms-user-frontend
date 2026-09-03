import { SidebarItem } from "@/types/sidebar";
import { LayoutDashboard, Activity, DiamondPlus } from "lucide-react";

const nurseAdminSidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/nurseAdmin/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "IPD",
    icon: Activity,
    section: "Clinical Operations",
    children: [
      { label: "New Admissions", href: "/nurseAdmin/ipd/new-admissions" },
      { label: "All Ward Patients", href: "/nurseAdmin/ipd/all-ward-patients" },
      { label: "Beds", href: "/nurseAdmin/ipd/beds" },
    ],
  },
  {
    label: "ICU",
    icon: DiamondPlus,
    section: "Clinical Operations",
    children: [
      { label: "All Patients", href: "/nurseAdmin/icu/patients" },
    ],
  },
];

export default nurseAdminSidebar;

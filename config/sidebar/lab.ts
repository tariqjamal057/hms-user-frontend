import { SidebarItem } from "@/types/sidebar";
import { LayoutDashboard, TestTube, BoneFracture } from "lucide-react";

const labSidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/lab/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "Pathology",
    icon: TestTube,
    section: "Services",
    children: [
      { label: "OPD Orders", href: "/lab/pathology/opd-orders" },
      { label: "IPD Orders", href: "/lab/pathology/ipd-orders" },
      { label: "Emergency Orders", href: "/lab/pathology/emergency-orders" },
      { label: "ICU Orders", href: "/lab/pathology/icu-orders" },
    ],
  },
  {
    label: "Radiology",
    icon: BoneFracture,
    section: "Services",
    children: [
      { label: "OPD Orders", href: "/lab/radiology/opd-orders" },
      { label: "IPD Orders", href: "/lab/radiology/ipd-orders" },
      { label: "Emergency Orders", href: "/lab/radiology/emergency-orders" },
      { label: "ICU Orders", href: "/lab/radiology/icu-orders" },
    ],
  },
];

export default labSidebar;

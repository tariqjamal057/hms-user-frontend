import { SidebarItem } from "@/types/sidebar";
import {
  LayoutDashboard,
  Activity,
  Stethoscope,
  Siren,
  DiamondPlus,
} from "lucide-react";

const pharmacySidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/pharmacy/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "IPD",
    href: "/pharmacy/ipd/orders",
    icon: Activity,
    section: "Services",
  },
  {
    label: "OPD",
    icon: Stethoscope,
    section: "Services",
    children: [
      { label: "Orders", href: "/pharmacy/opd/orders" },
    ],
  },
  {
    label: "Emergency",
    icon: Siren,
    section: "Services",
    children: [
      { label: "Orders", href: "/pharmacy/emergency/orders" },
    ],
  },
  {
    label: "ICU",
    icon: DiamondPlus,
    section: "Services",
    children: [
      { label: "All Patients", href: "/pharmacy/icu/orders" },
    ],
  },
];

export default pharmacySidebar;

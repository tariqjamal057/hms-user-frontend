import { SidebarItem } from "@/types/sidebar";
import { LayoutDashboard, Activity } from "lucide-react";

const billingSidebar: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/billing/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "IPD",
    icon: Activity,
    section: "Billing",
    children: [
      { label: "All Billings", href: "/billing/ipd/all-billings" },
    ],
  },
];

export default billingSidebar;

import { LucideIcon } from "lucide-react";

export interface SidebarChild {
  label: string;
  href: string;
  badge?: number;
}

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: SidebarChild[];
  badge?: number;
  section?: string;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

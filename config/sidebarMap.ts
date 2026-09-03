import type { SidebarItem } from "@/types/sidebar";
import { UserRole } from "@/config/roles";

import doctorSidebar from "@/config/sidebar/doctor";
import admissionSidebar from "@/config/sidebar/admission";
import nurseSidebar from "@/config/sidebar/nurse";
import pharmacySidebar from "@/config/sidebar/pharmacy";
import labSidebar from "@/config/sidebar/lab";
import nurseAdminSidebar from "@/config/sidebar/nurseAdmin";
import billingSidebar from "@/config/sidebar/billing";
import rmoSidebar from "@/config/sidebar/rmo";

export const SIDEBAR_MAP: Record<UserRole, SidebarItem[]> = {
  [UserRole.DOCTOR]: doctorSidebar,
  [UserRole.ADMISSION]: admissionSidebar,
  [UserRole.NURSE]: nurseSidebar,
  [UserRole.PHARMACY]: pharmacySidebar,
  [UserRole.LAB]: labSidebar,
  [UserRole.NURSEADMIN]: nurseAdminSidebar,
  [UserRole.BILLING]: billingSidebar,
  [UserRole.RMO]: rmoSidebar,
};

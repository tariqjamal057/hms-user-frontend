import { UserRole } from "@/config/roles";

export interface RoleMeta {
  brand: string;
  subtitle: string;
  gradient: string;
  shadow: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  [UserRole.DOCTOR]: {
    brand: "Clinical",
    subtitle: "Doctor Workspace",
    gradient: "from-blue-600 to-cyan-500",
    shadow: "shadow-blue-200",
  },
  [UserRole.ADMISSION]: {
    brand: "Admission",
    subtitle: "Admission Desk",
    gradient: "from-violet-600 to-purple-500",
    shadow: "shadow-violet-200",
  },
  [UserRole.NURSE]: {
    brand: "Nursing",
    subtitle: "Nurse Workspace",
    gradient: "from-emerald-600 to-teal-500",
    shadow: "shadow-emerald-200",
  },
  [UserRole.PHARMACY]: {
    brand: "Pharmacy",
    subtitle: "Pharmacy Operations",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-200",
  },
  [UserRole.LAB]: {
    brand: "Laboratory",
    subtitle: "Lab Operations",
    gradient: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-200",
  },
  [UserRole.NURSEADMIN]: {
    brand: "Nurse Admin",
    subtitle: "Nursing Administration",
    gradient: "from-teal-600 to-cyan-500",
    shadow: "shadow-teal-200",
  },
  [UserRole.BILLING]: {
    brand: "Billing",
    subtitle: "Billing Center",
    gradient: "from-indigo-600 to-blue-500",
    shadow: "shadow-indigo-200",
  },
  [UserRole.RMO]: {
    brand: "RMO",
    subtitle: "Resident Medical Officer",
    gradient: "from-sky-600 to-blue-500",
    shadow: "shadow-sky-200",
  },
};

import {
  BarChart3,
  Bell,
  FileCheck2,
  FileSearch,
  FileSpreadsheet,
  Settings,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { routes } from "@/constants/routes";
import { userRoles, type UserRole } from "@/constants/roles";

export type AdminNavigationItem = {
  labelKey: string;
  href: string;
  icon: typeof BarChart3;
  allowedRoles: UserRole[];
};

export const adminNavigationItems: AdminNavigationItem[] = [
  {
    labelKey: "dashboard",
    href: routes.admin,
    icon: LayoutDashboard,
    allowedRoles: [
      userRoles.admin,
      userRoles.admissionDean,
      userRoles.departmentHead,
      userRoles.admissionEmployee,
    ],
  },
  {
    labelKey: "reports",
    href: routes.adminReports,
    icon: BarChart3,
    allowedRoles: [userRoles.admin, userRoles.admissionDean],
  },
  {
    labelKey: "applications",
    href: routes.adminApplications,
    icon: FileSearch,
    allowedRoles: [userRoles.admin, userRoles.departmentHead, userRoles.admissionEmployee],
  },
  {
    labelKey: "manualReview",
    href: routes.adminManualReview,
    icon: FileCheck2,
    allowedRoles: [userRoles.admin, userRoles.departmentHead, userRoles.admissionEmployee],
  },
  {
    labelKey: "documentVerification",
    href: routes.adminDocumentVerification,
    icon: FileSearch,
    allowedRoles: [userRoles.admin, userRoles.departmentHead, userRoles.admissionEmployee],
  },
  {
    labelKey: "tawjihiImport",
    href: routes.adminSecondarySchoolRecords,
    icon: FileSpreadsheet,
    allowedRoles: [userRoles.admin],
  },
  {
    labelKey: "users",
    href: routes.adminUsers,
    icon: Users,
    allowedRoles: [userRoles.admin, userRoles.admissionDean, userRoles.departmentHead],
  },
  {
    labelKey: "notifications",
    href: routes.adminNotifications,
    icon: Bell,
    allowedRoles: [userRoles.admin, userRoles.admissionDean, userRoles.departmentHead, userRoles.admissionEmployee],
  },
  {
    labelKey: "settings",
    href: routes.adminSettings,
    icon: Settings,
    allowedRoles: [userRoles.admin, userRoles.admissionDean],
  },
];

export function getAdminNavigationItems(role?: string | null) {
  if (!role) return [];

  return adminNavigationItems.filter((item) =>
    item.allowedRoles.includes(role as UserRole)
  );
}
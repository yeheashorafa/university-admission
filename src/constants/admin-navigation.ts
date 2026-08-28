import {
  BarChart3,
  Bell,
  ChartBar,
  Building2,
  Boxes,
  FileCheck2,
  FileSearch,
  FileSpreadsheet,
  FileText,
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
    labelKey: "headReports",
    href: routes.adminHeadReports,
    icon: ChartBar,
    allowedRoles: [userRoles.departmentHead],
  },
  {
    labelKey: "deanReports",
    href: routes.adminDeanReports,
    icon: ChartBar,
    allowedRoles: [userRoles.admissionDean],
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
    allowedRoles: [userRoles.admissionEmployee],
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
    labelKey: "employeeNotifications",
    href: routes.adminEmployeeNotifications,
    icon: Bell,
    allowedRoles: [userRoles.admissionEmployee],
  },
  {
    labelKey: "headNotifications",
    href: routes.adminHeadNotifications,
    icon: Bell,
    allowedRoles: [userRoles.departmentHead],
  },
  {
    labelKey: "settings",
    href: routes.adminSettings,
    icon: Settings,
    allowedRoles: [userRoles.admin, userRoles.admissionDean],
  },
  {
    labelKey: "masterData.faculties",
    href: routes.adminFaculties,
    icon: Building2,
    allowedRoles: [userRoles.admin],
  },
  {
    labelKey: "masterData.departments",
    href: routes.adminDepartments,
    icon: Boxes,
    allowedRoles: [userRoles.admin],
  },
  {
    labelKey: "masterData.documentTypes",
    href: routes.adminDocumentTypes,
    icon: FileText,
    allowedRoles: [userRoles.admin],
  },
  {
    labelKey: "masterData.applicationTypes",
    href: routes.adminApplicationTypes,
    icon: FileSpreadsheet,
    allowedRoles: [userRoles.admin],
  },
  {
    labelKey: "masterData.branches",
    href: routes.adminBranches,
    icon: Building2,
    allowedRoles: [userRoles.admin],
  },
];

export function getAdminNavigationItems(role?: string | null) {
  if (!role) return [];

  return adminNavigationItems.filter((item) =>
    item.allowedRoles.includes(role as UserRole)
  );
}
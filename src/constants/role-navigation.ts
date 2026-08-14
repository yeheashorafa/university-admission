import { routes } from "@/constants/routes";
import {
  isAdminRole,
  isStudentRole,
  isAdmissionEmployee,
  isDepartmentHead,
  isAdmissionDean,
} from "@/constants/roles";
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  UserCircle2,
  UserPlus,
  Home,
  GraduationCap,
} from "lucide-react";

/**
 * Returns the primary dashboard route for a given user role.
 * Guest -> /
 * Student -> /dashboard
 * Admin roles (Employee, Head, Dean) -> /admin
 */
export function getDashboardRouteByRole(role?: string | null): string {
  if (!role) return routes.home;
  if (isStudentRole(role)) return routes.dashboard;
  if (isAdminRole(role)) return routes.admin;
  return routes.home;
}

/**
 * Returns the logo click target route for a given user role.
 * Guest -> /
 * Student -> /dashboard
 * Admin roles (Employee, Head, Dean) -> /admin
 */
export function getLogoRouteByRole(role?: string | null): string {
  if (!role) return routes.home;
  if (isStudentRole(role)) return routes.dashboard;
  if (isAdminRole(role)) return routes.admin;
  return routes.home;
}

/**
 * Validates whether a specific role is allowed to navigate to a path.
 */
export function canAccessRoute(role?: string | null, path?: string): boolean {
  if (!path) return true;
  const cleanPath = path.replace(/^\/(ar|en)/, "") || "/";

  // Public routes accessible to everyone (Guest + Logged in)
  const publicRoutes = [
    routes.home,
    routes.programs,
    routes.login,
    routes.register,
    routes.forgotPassword,
    routes.resetPassword,
    routes.verifyOtp,
    routes.unauthorized,
  ];

  if (
    (publicRoutes as readonly string[]).includes(cleanPath) ||
    cleanPath.startsWith("/programs/")
  ) {
    return true;
  }

  // Guest attempts to access protected routes
  if (!role) {
    return false;
  }

  // Student role access rules
  if (isStudentRole(role)) {
    const studentRoutes = [
      routes.dashboard,
      routes.applications,
      routes.newApplication,
      routes.documents,
      routes.notifications,
      routes.status,
      routes.payment,
      routes.socialResearch,
      routes.profile,
    ];

    if ((studentRoutes as readonly string[]).includes(cleanPath)) return true;
    if (cleanPath.startsWith("/applications/")) return true;
    if (cleanPath.startsWith("/status/")) return true;
    if (cleanPath.startsWith("/payment/")) return true;
    if (cleanPath.startsWith("/social-research/")) return true;
    return false;
  }

  // Admin role access rules (Admin, Employee, Department Head, Dean)
  if (isAdminRole(role)) {
    if (cleanPath.startsWith("/admin")) return true;
    return false;
  }

  return false;
}

export type NavMenuItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

/**
 * Returns main header navigation items per role.
 */
export function getNavItemsByRole(
  role?: string | null,
  locale: string = "ar"
): NavMenuItem[] {
  const isAr = locale === "ar";

  if (!role) {
    // Guest items
    return [
      {
        label: isAr ? "الرئيسية" : "Home",
        href: routes.home,
        icon: Home,
      },
      {
        label: isAr ? "الكليات والتخصصات" : "Faculties & Programs",
        href: routes.programs,
        icon: GraduationCap,
      },
    ];
  }

  if (isStudentRole(role)) {
    return [
      {
        label: isAr ? "الرئيسية" : "Home",
        href: routes.home,
        icon: Home,
      },
      {
        label: isAr ? "لوحة التحكم" : "Dashboard",
        href: routes.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: isAr ? "طلباتي" : "My Applications",
        href: routes.applications,
        icon: FileText,
      },
      {
        label: isAr ? "تقديم طلب جديد" : "Submit New Application",
        href: routes.newApplication,
        icon: UserPlus,
      },
      {
        label: isAr ? "المستندات" : "Documents",
        href: routes.documents,
        icon: FileCheck2,
      },
    ];
  }

  // Admin roles
  return [
    {
      label: isAr ? "الرئيسية" : "Home",
      href: routes.home,
      icon: Home,
    },
    {
      label: isAr ? "الكليات" : "Faculties",
      href: routes.programs,
      icon: GraduationCap,
    },
    {
      label: isAr ? "لوحة الإدارة" : "Admin Panel",
      href: routes.admin,
      icon: LayoutDashboard,
    },
  ];
}

/**
 * Returns user dropdown menu items per role.
 */
export function getUserDropdownItemsByRole(
  role?: string | null,
  locale: string = "ar"
): NavMenuItem[] {
  const isAr = locale === "ar";

  if (isStudentRole(role)) {
    return [
      {
        label: isAr ? "لوحة التحكم" : "Dashboard",
        href: routes.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: isAr ? "طلباتي" : "My Applications",
        href: routes.applications,
        icon: FileText,
      },
      {
        label: isAr ? "الملف الشخصي" : "Profile",
        href: routes.profile,
        icon: UserCircle2,
      },
    ];
  }

  if (isAdminRole(role)) {
    return [
      {
        label: isAr ? "لوحة التحكم" : "Dashboard",
        href: routes.admin,
        icon: LayoutDashboard,
      },
    ];
  }

  return [];
}

/**
 * Returns role-safe quick links for PortalFooter.
 */
export function getFooterQuickLinksByRole(
  role?: string | null,
  locale: string = "ar"
): { label: string; href: string }[] {
  const isAr = locale === "ar";

  if (!role) {
    return [
      { label: isAr ? "الرئيسية" : "Home", href: routes.home },
      { label: isAr ? "الكليات والتخصصات" : "Faculties & Programs", href: routes.programs },
      { label: isAr ? "تسجيل حساب طالب" : "Register Student", href: routes.register },
      { label: isAr ? "تسجيل الدخول" : "Login", href: routes.login },
    ];
  }

  if (isStudentRole(role)) {
    return [
      { label: isAr ? "الرئيسية" : "Home", href: routes.home },
      { label: isAr ? "لوحة التحكم" : "Dashboard", href: routes.dashboard },
      { label: isAr ? "تقديم طلب جديد" : "Submit New Application", href: routes.newApplication },
      { label: isAr ? "تتبع حالة الطلب" : "Track Application", href: routes.status },
    ];
  }

  return [
    { label: isAr ? "الرئيسية" : "Home", href: routes.home },
    { label: isAr ? "لوحة الإدارة" : "Admin Dashboard", href: routes.admin },
    { label: isAr ? "الكليات والتخصصات" : "Faculties & Programs", href: routes.programs },
  ];
}

/**
 * Returns role-safe services links for PortalFooter.
 */
export function getFooterServicesByRole(
  role?: string | null,
  locale: string = "ar"
): { label: string; href: string }[] {
  const isAr = locale === "ar";

  if (!role) {
    return [
      { label: isAr ? "استعراض التخصصات" : "Browse Programs", href: routes.programs },
      { label: isAr ? "بوابة التسجيل" : "Registration Portal", href: routes.register },
      { label: isAr ? "دخول الطلاب والعمادة" : "Portal Login", href: routes.login },
    ];
  }

  if (isStudentRole(role)) {
    return [
      { label: isAr ? "لوحة التحكم" : "Dashboard", href: routes.dashboard },
      { label: isAr ? "مركز طلباتي" : "My Applications", href: routes.applications },
      { label: isAr ? "مركز المستندات" : "Documents", href: routes.documents },
      { label: isAr ? "الإشعارات" : "Notifications", href: routes.notifications },
    ];
  }

  if (isAdmissionEmployee(role)) {
    return [
      { label: isAr ? "لوحة مهام الموظف" : "Employee Dashboard", href: routes.admin },
      { label: isAr ? "تدقيق المستندات" : "Document Verification", href: routes.adminDocumentVerification },
      { label: isAr ? "المراجعة اليدوية" : "Manual Review", href: routes.adminManualReview },
    ];
  }

  if (isDepartmentHead(role)) {
    return [
      { label: isAr ? "لوحة رئيس القسم" : "Department Head Dashboard", href: routes.admin },
      { label: isAr ? "مراجعة الطلبات" : "Application Review", href: routes.adminApplications },
      { label: isAr ? "إدارة المستخدمين" : "User Management", href: routes.adminUsers },
    ];
  }

  if (isAdmissionDean(role)) {
    return [
      { label: isAr ? "لوحة العميد" : "Dean Dashboard", href: routes.admin },
      { label: isAr ? "التقارير والإحصائيات" : "Reports & Statistics", href: routes.adminReports },
      { label: isAr ? "الإشعارات" : "Notifications", href: routes.adminNotifications },
    ];
  }

  return [
    { label: isAr ? "لوحة الإدارة" : "Admin Dashboard", href: routes.admin },
  ];
}

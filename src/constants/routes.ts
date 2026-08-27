export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  verifyOtp: "/verify-otp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  dashboard: "/dashboard",
  applications: "/applications",
  newApplication: "/applications/new",
  programs: "/programs",
  faculties: "/faculties",
  application: "/application",
  applicationSubmitted: "/application/submitted",
  documents: "/documents",
  status: "/status",
  profile: "/profile",
  notifications: "/notifications",
  payment: "/payment",
  paymentSuccess: "/payment/success",
  paymentFailed: "/payment/failed",
  unauthorized: "/unauthorized",
  socialResearch: "/social-research",
  
  admin: "/admin",
  adminApplications: "/admin/applications",
  adminManualReview: "/admin/manual-review",
  adminDocumentVerification: "/admin/document-verification",
  adminNotifications: "/admin/notifications",
  adminEmployeeNotifications: "/admin/employee-notifications",
  adminHeadNotifications: "/admin/head-notifications",
  adminUsers: "/admin/users",
  adminPrograms: "/admin/programs",
  adminFaculties: "/admin/faculties",
  adminDepartments: "/admin/departments",
  adminDocumentTypes: "/admin/document-types",
  adminApplicationTypes: "/admin/application-types",
  adminAdmissionCycles: "/admin/admission-cycles",
  adminReports: "/admin/reports",
  adminHeadReports: "/admin/head-reports",
  adminDeanReports: "/admin/dean-reports",
  adminSettings: "/admin/settings",
  adminLegalPolicies: "/admin/legal-policies",
  adminSecondarySchoolRecords: "/admin/secondary-school-records",
} as const;

export function withLocale(locale: string, path: string) {
  if (path === "/") {
    return `/${locale}`;
  }

  return `/${locale}${path}`;
}
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
  adminUsers: "/admin/users",
  adminPrograms: "/admin/programs",
  adminAdmissionCycles: "/admin/admission-cycles",
  adminReports: "/admin/reports",
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
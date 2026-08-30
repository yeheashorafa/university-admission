"use client";

import { useLocale } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useStudentDashboardQuery, useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";
import { useMyProfileQuery } from "@/hooks/queries/use-profile-queries";
import { useMyDocumentsQuery } from "@/hooks/queries/use-documents-queries";
import { useMyNotificationsQuery } from "@/hooks/queries/use-notifications-queries";
import { isVerificationError } from "@/lib/api/api-error";
import { isAccountVerificationBypassed } from "@/lib/auth-verification";

export function DashboardVerificationWarning() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const { error: dashError } = useStudentDashboardQuery();
  const { error: appsError } = useStudentApplicationsQuery();
  const { error: profileError } = useMyProfileQuery();
  const { error: docsError } = useMyDocumentsQuery();
  const { error: notifError } = useMyNotificationsQuery();

  const hasVerificationError =
    (dashError && isVerificationError(dashError)) ||
    (appsError && isVerificationError(appsError)) ||
    (profileError && isVerificationError(profileError)) ||
    (docsError && isVerificationError(docsError)) ||
    (notifError && isVerificationError(notifError));

  if (!hasVerificationError || !isAccountVerificationBypassed()) {
    return null;
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50 p-4 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div>
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
          {isAr
            ? "تنبيه: الباك ما زال يطلب تفعيل الحساب"
            : "Warning: Backend still requires account verification"}
        </p>
        <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-300">
          {isAr
            ? "الباك ما زال يطلب تفعيل الحساب، لذلك قد لا تظهر بعض بيانات لوحة التحكم."
            : "Backend still requires account verification, so some dashboard data may be unavailable."}
        </p>
      </div>
    </div>
  );
}

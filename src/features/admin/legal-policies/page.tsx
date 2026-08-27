"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { FileWarning } from "lucide-react";
import { BackendPendingBanner } from "@/components/common/backend-pending-banner";

export function AdminLegalPoliciesPage() {
  return (
    <AdminLayout activePath={routes.adminLegalPolicies}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-20 text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <FileWarning className="size-8" />
          </div>

          <h1 className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            الشروط والسياسات القانونية
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-7 text-amber-700/80 dark:text-amber-300/80">
            هذه الصفحة في انتظار ربط واجهة البرمجة الخلفية.
            إدارة السياسات القانونية (إضافة، تعديل، حذف، نشر) ستكون متاحة بعد
            توفير نقاط النهاية المطلوبة من فريق الخلفية.
          </p>

          <p className="mt-2 text-xs font-mono text-amber-600/70 dark:text-amber-400/70">
            PENDING_BACKEND_API — /admin/legal-policies
          </p>
        </div>

        <BackendPendingBanner description="إدارة السياسات القانونية (إضافة، تعديل، حذف، نشر) بانتظار نقاط النهاية من الخادم." />
      </div>
    </AdminLayout>
  );
}
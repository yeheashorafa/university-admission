"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  FileCheck2,
  Bell,
  Clock,
  ArrowLeft,
  ArrowRight,
  Eye,
  ShieldAlert,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useHeadApplicationsQuery } from "@/hooks/queries/use-admin-queries";
import { useHeadNotificationsQuery } from "@/hooks/queries/use-head-notifications-queries";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils/application-formatters";
import type { HeadApplication } from "@/services/department-head.service";

export function DepartmentHeadOperationalDashboard() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const {
    data: applicationsData,
    isLoading: isAppsLoading,
    isError: isAppsError,
    error: appsError,
  } = useHeadApplicationsQuery();

  const {
    data: notificationsData,
    isLoading: isNotifsLoading,
  } = useHeadNotificationsQuery();

  const applications = (Array.isArray(applicationsData) ? applicationsData : []) as HeadApplication[];
  const notifications = (Array.isArray(notificationsData) ? notificationsData : []) as Array<{
    id: string | number;
    title?: string;
    message?: string;
    read_at?: string | null;
    created_at?: string;
  }>;

  const unreadNotifsCount = notifications.filter((n) => !n.read_at).length;
  const forwardedApps = applications.filter(
    (app) => app.status === "forwarded_to_department_head" || !app.status
  );

  return (
    <div className="space-y-8">
      {/* Department Head Header */}
      <header className="rounded-2xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          {isAr ? "لوحة مهام رئيس القسم" : "Department Head Workspace"}
        </h1>
        <p className="mt-2 leading-7 text-muted-foreground">
          {isAr
            ? "مرحباً بك. تتيح لك هذه اللوحة متابعة والبت في طلبات الالتحاق المحولة لقسمك الأكاديمي."
            : "Welcome. Review and decide on admission applications forwarded to your academic department."}
        </p>
      </header>

      {/* Operational Task Queues Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Forwarded Applications Queue */}
        <Link
          href={withLocale(locale, routes.adminApplications)}
          className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="size-6" />
            </div>
            <span className="text-2xl font-extrabold text-primary">
              {isAppsLoading ? "..." : forwardedApps.length}
            </span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary">
            {isAr ? "طلبات محولة بانتظار قرار القسم" : "Forwarded Applications"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr
              ? "طلبات التحاق محولة من موظف القبول وتتطلب موافقة القسم"
              : "Applications forwarded by admission employee awaiting department decision"}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
            <span>{isAr ? "الانتقال إلى قائمة الطلبات" : "View Applications"}</span>
            <ArrowIcon className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </Link>

        {/* Notifications Card */}
        <Link
          href={withLocale(locale, routes.adminHeadNotifications)}
          className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-secondary hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Bell className="size-6" />
            </div>
            <span className="text-2xl font-extrabold text-secondary">
              {isNotifsLoading ? "..." : unreadNotifsCount}
            </span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-secondary">
            {isAr ? "التنبيهات الأكاديمية الجديدة" : "Unread Notifications"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr
              ? "الإشعارات الواردة بخصوص التحويلات والتحديثات الأكاديمية"
              : "Incoming notifications regarding forwarded files and academic updates"}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-secondary">
            <span>{isAr ? "عرض مركز التنبيهات" : "View Notifications"}</span>
            <ArrowIcon className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </Link>

        {/* Scoped Global Stats Notice (distinguish unavailable from zero) */}
        <div className="rounded-xl border border-border bg-muted/30 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ShieldAlert className="size-6" />
            </div>
            <span className="text-xs font-semibold rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              {isAr ? "نطاق أكاديمي" : "Academic Scope"}
            </span>
          </div>
          <h3 className="font-bold text-foreground">
            {isAr ? "الإحصائيات الكلية للجامعة" : "University Global Statistics"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr
              ? "غير متوفرة في الحساب الأكاديمي (مخصصة لعميد القبول والإدارة فقط)"
              : "Unavailable in academic account (restricted to Dean and Admin)"}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            {isAr
              ? "يعرض النظام فقط الطلبات الموجهة لقسمكم الأكاديمي"
              : "System only exposes applications scoped to your department"}
          </div>
        </div>
      </section>

      {/* Forwarded Applications List */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {isAr ? "طابور الطلبات المحولة للقسم" : "Forwarded Applications Queue"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAr
                ? "قائمة الطلبات المحولة التي تحتاج إلى مراجعة أكاديمية واتخاذ قرار"
                : "Applications forwarded to your department requiring academic evaluation"}
            </p>
          </div>
          <Link
            href={withLocale(locale, routes.adminApplications)}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            {isAr ? "عرض كافة الطلبات" : "View all applications"}
            <ArrowIcon className="size-4" />
          </Link>
        </div>

        {isAppsLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : isAppsError ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
            <AlertCircle className="size-8" />
            <p className="font-bold">
              {isAr ? "تعذر تحميل الطلبات المحولة" : "Failed to load forwarded applications"}
            </p>
            <p className="text-xs text-muted-foreground">
              {appsError instanceof Error ? appsError.message : String(appsError)}
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 p-12 text-center text-muted-foreground">
            <FileCheck2 className="size-10 text-muted-foreground/50" />
            <p className="font-bold text-foreground">
              {isAr ? "لا توجد طلبات محولة حالياً" : "No forwarded applications at the moment"}
            </p>
            <p className="text-sm">
              {isAr
                ? "سيتم إدراج أي طلب جديد يتم تحويله من قبل موظفي القبول فور وصوله."
                : "Any application forwarded by admission staff will appear here immediately."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold text-muted-foreground">
                  <th className="px-4 py-3 text-start">
                    {isAr ? "رقم الطلب" : "App #"}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isAr ? "اسم الطالب" : "Student Name"}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isAr ? "البرنامج" : "Program"}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isAr ? "تاريخ التحويل" : "Date"}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isAr ? "الحالة" : "Status"}
                  </th>
                  <th className="px-4 py-3 text-start">
                    {isAr ? "الإجراء" : "Action"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => (
                  <tr
                    key={String(app.id)}
                    className="border-b border-border last:border-b-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      {app.applicationNo || `APP-${app.id}`}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {app.studentName || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {app.program || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {app.forwardedAt ? formatDateTime(app.forwardedAt, locale) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={app.status || "forwarded_to_department_head"} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={withLocale(
                          locale,
                          `${routes.adminApplications}/${app.id}`
                        )}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                      >
                        <Eye className="size-3.5" />
                        {isAr ? "مراجعة والبت" : "Review"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

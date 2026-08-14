"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { routes, withLocale } from "@/constants/routes";
import { useStudentDashboardQuery, useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";
import { getStatusConfig } from "@/lib/adapters/status-adapter";
import { cn } from "@/lib/utils";

export function CurrentApplicationCard() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: dashboardData, isLoading: loadingDash } = useStudentDashboardQuery();
  const { data: applications, isLoading: loadingApps } = useStudentApplicationsQuery();

  const isLoading = loadingDash || loadingApps;

  const totalCount = dashboardData?.totalApplicationsCount ?? applications?.length ?? 0;

  const inProgressCount = applications?.filter((a) =>
    ["submitted", "under_review", "forwarded_to_department_head", "returned_to_employee"].includes(a.status)
  ).length ?? 0;

  const actionRequiredCount = applications?.filter((a) =>
    ["draft", "returned_for_revision"].includes(a.status)
  ).length ?? 0;

  const completedCount = applications?.filter((a) => a.status === "accepted").length ?? 0;

  const recentApps = applications?.slice(0, 3) || [];

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      {/* Header with Title and All Applications Link */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#12360b] dark:text-[#8bd63a]">
            {isAr ? "مركز طلبات القبول" : "Admission Applications Center"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "متابعة وإدارة طلبات القبول الخاصة بك والحلول السريعة"
              : "Overview of your admission applications and quick actions"}
          </p>
        </div>

        <Link
          href={withLocale(locale, routes.applications)}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span>{isAr ? "عرض كل طلباتي" : "View All Applications"}</span>
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-center">
              <p className="text-2xs font-bold text-muted-foreground">
                {isAr ? "إجمالي الطلبات" : "Total Applications"}
              </p>
              <p className="text-xl font-black text-foreground mt-0.5">{totalCount}</p>
            </div>

            <div className="rounded-xl border border-amber-200/60 bg-amber-500/5 p-3.5 text-center">
              <p className="text-2xs font-bold text-amber-700 dark:text-amber-400">
                {isAr ? "قيد المراجعة" : "In Progress"}
              </p>
              <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
                {inProgressCount}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200/60 bg-emerald-500/5 p-3.5 text-center">
              <p className="text-2xs font-bold text-emerald-700 dark:text-emerald-400">
                {isAr ? "بحاجة لإجراء" : "Needs Action"}
              </p>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {actionRequiredCount}
              </p>
            </div>

            <div className="rounded-xl border border-green-200/60 bg-green-500/5 p-3.5 text-center">
              <p className="text-2xs font-bold text-green-700 dark:text-green-400">
                {isAr ? "مكتملة" : "Completed"}
              </p>
              <p className="text-xl font-black text-green-700 dark:text-green-400 mt-0.5">
                {completedCount}
              </p>
            </div>
          </div>

          {/* Recent Applications List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isAr ? "أحدث الطلبات" : "Recent Applications"}
            </h3>

            {recentApps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد طلبات تقديم حالياً." : "No active applications found."}
              </div>
            ) : (
              <div className="grid gap-3">
                {recentApps.map((app) => {
                  const statusInfo = getStatusConfig(app.status);

                  return (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-background p-4 hover:border-primary/40 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            {app.applicationNo || `APP-2026-${app.id}`}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-2xs font-bold border",
                              statusInfo.badgeClass
                            )}
                          >
                            {isAr ? statusInfo.labelAr : statusInfo.labelEn}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {app.programName || (isAr ? "طلب الالتحاق" : "Admission Application")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={withLocale(locale, `/status/${app.id}`)}
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-3 text-2xs font-bold text-foreground hover:bg-muted"
                        >
                          <span>{isAr ? "تتبع الحالة" : "Track Status"}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
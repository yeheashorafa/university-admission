"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { ReportsFilterBar } from "@/features/admin/reports/components/reports-filter-bar";
import { useHeadReportsQuery } from "@/hooks/queries/use-head-reports-queries";
import { ApplicationStatusReport } from "@/features/admin/reports/components/application-status-report";
import type { ReportsChartItem } from "@/features/admin/reports/utils/admin-reports-analytics";
import {
  BarChart3,
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

export function calculateAvgTimeToDecisionHours(
  metrics: { label: string; value: number }[] | null | undefined
): number | null {
  if (!Array.isArray(metrics)) return null;
  if (metrics.length === 0) return 0;

  const hoursItem = metrics.find((m) => {
    const l = m.label.toLowerCase();
    return l === "average_hours" || l === "hours" || l === "avg_hours";
  });
  if (hoursItem) {
    return Math.round(hoursItem.value * 10) / 10;
  }

  const minutesItem = metrics.find((m) => {
    const l = m.label.toLowerCase();
    return l === "average_minutes" || l === "minutes" || l === "avg_minutes";
  });
  if (minutesItem) {
    return Math.round((minutesItem.value / 60) * 10) / 10;
  }

  const secondsItem = metrics.find((m) => {
    const l = m.label.toLowerCase();
    return l === "average_seconds" || l === "seconds" || l === "avg_seconds";
  });
  if (secondsItem) {
    return Math.round((secondsItem.value / 3600) * 10) / 10;
  }

  // Never assume or average unknown units as hours; return null (unavailable state)
  return null;
}

export function HeadReportsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  const { data: reports, isLoading, isError, error, refetch } = useHeadReportsQuery(range);

  const statusDistribution: ReportsChartItem[] | null = reports?.byStatus
    ? reports.byStatus.map((item) => ({
        key: item.label,
        label: item.label,
        value: item.count,
      }))
    : null;

  // KPIs
  const totalApplications = Array.isArray(reports?.byStatus)
    ? reports.byStatus.reduce((acc, curr) => acc + curr.count, 0)
    : null;

  const totalThroughput = Array.isArray(reports?.throughput)
    ? reports.throughput.reduce((acc, curr) => acc + curr.count, 0)
    : null;

  const avgTimeToDecisionHours = calculateAvgTimeToDecisionHours(reports?.timeToDecision);

  let overallAcceptanceRate: number | null = null;
  if (Array.isArray(reports?.acceptanceRate)) {
    if (reports.acceptanceRate.length === 0) {
      overallAcceptanceRate = 0;
    } else {
      const totalApplied = reports.acceptanceRate.reduce((acc, curr) => acc + curr.total, 0);
      const totalAccepted = reports.acceptanceRate.reduce((acc, curr) => acc + curr.accepted, 0);
      overallAcceptanceRate = totalApplied > 0 ? Math.round((totalAccepted / totalApplied) * 100) : 0;
    }
  }

  const hasUnavailableEndpoints =
    reports &&
    (reports.byStatus === null ||
      reports.throughput === null ||
      reports.timeToDecision === null ||
      reports.acceptanceRate === null);

  return (
    <AdminLayout activePath={routes.adminHeadReports}>
      <div className="flex flex-col gap-8">
        <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">
                {isAr ? "تقارير رئيس القسم" : "Department Head Reports"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAr
                  ? "مؤشرات أداء طلبات القسم ومعدلات المعالجة والقبول مصنفة حسب التواريخ"
                  : "Department application performance metrics, throughput, and decision times"}
              </p>
            </div>
          </div>
        </header>

        <ReportsFilterBar onApply={setRange} />

        {hasUnavailableEndpoints && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-3">
              <Info className="size-4 shrink-0" />
              <span>
                {isAr
                  ? "تنبيه: بعض نقاط نهاية تقارير رئيس القسم غير مفعّلة أو تعذر تحميلها من الخادم حالياً. تم تمييز الأقسام غير المتوفرة بوضوح."
                  : "Notice: Some department head report endpoints failed or are unavailable from the backend. Sections without data are labeled accordingly."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-[28px] border border-border shadow-sm">
            <Loader2 className="size-10 animate-spin text-primary mb-3" />
            <p className="text-sm font-bold text-muted-foreground">
              {isAr ? "جاري تحميل تقارير القسم..." : "Loading department reports..."}
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
            <AlertCircle className="size-10" />
            <h3 className="text-lg font-bold">
              {isAr ? "تعذر تحميل تقارير رئيس القسم" : "Failed to load department head reports"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              {error instanceof Error ? error.message : String(error)}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : reports ? (
          <>
            {/* KPI Cards */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {/* Total Applications */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isAr ? "طلبات القسم" : "Department Applications"}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-primary">
                  {totalApplications !== null
                    ? totalApplications
                    : (isAr ? "غير متوفر" : "Unavailable")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "إجمالي الطلبات المحولة للقسم" : "Total assigned to department"}
                </p>
              </div>

              {/* Throughput */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isAr ? "الطلبات المنجزة" : "Processed Throughput"}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <TrendingUp className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-secondary">
                  {totalThroughput !== null
                    ? totalThroughput
                    : (isAr ? "غير متوفر" : "Unavailable")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "حجم المعالجة في النطاق الزمني" : "Processed during date range"}
                </p>
              </div>

              {/* Time to Decision */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isAr ? "متوسط زمن القرار" : "Avg Decision Time"}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <Clock className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-amber-600">
                  {avgTimeToDecisionHours !== null
                    ? `${avgTimeToDecisionHours} ${isAr ? "ساعة" : "hrs"}`
                    : (isAr ? "غير متوفر" : "Unavailable")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "متوسط المدة حتى البت في الطلب" : "Average turnaround per decision"}
                </p>
              </div>

              {/* Acceptance Rate */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isAr ? "معدل القبول" : "Acceptance Rate"}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-emerald-600">
                  {overallAcceptanceRate !== null
                    ? `${overallAcceptanceRate}%`
                    : (isAr ? "غير متوفر" : "Unavailable")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "نسبة الطلبات المقبولة في القسم" : "Percentage of accepted applicants"}
                </p>
              </div>
            </section>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 gap-6">
              <ApplicationStatusReport data={statusDistribution} />
            </div>

            {/* Additional Breakdowns: Throughput, Time To Decision, Acceptance Rate */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Throughput Timeline */}
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-primary">
                    {isAr ? "معدل المعالجة والإنجاز اليومي" : "Daily Processing Throughput"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isAr ? "عدد الطلبات المنجزة يومياً بالقسم" : "Applications processed per day"}
                  </p>
                </div>

                {reports.throughput === null ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="size-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {isAr ? "بيانات معدل الإنجاز غير متوفرة من الخادم" : "Throughput data unavailable from server"}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-3 text-xs font-bold text-primary hover:underline"
                    >
                      {isAr ? "إعادة المحاولة" : "Retry"}
                    </button>
                  </div>
                ) : reports.throughput.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <p className="text-sm">
                      {isAr ? "لا توجد بيانات مسجلة في هذا النطاق" : "No throughput records in this period"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {reports.throughput.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="font-medium text-foreground">{item.date}</span>
                        <span className="font-bold text-primary">{item.count} {isAr ? "طلب" : "apps"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Time to Decision Breakdown */}
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-primary">
                    {isAr ? "مؤشرات زمن البت بالقرارات" : "Time to Decision Metrics"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isAr ? "زمن المراجعة حسب نوع القرار أو البرنامج" : "Decision turnaround breakdown"}
                  </p>
                </div>

                {reports.timeToDecision === null ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="size-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {isAr ? "بيانات زمن القرار غير متوفرة من الخادم" : "Decision time data unavailable from server"}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-3 text-xs font-bold text-primary hover:underline"
                    >
                      {isAr ? "إعادة المحاولة" : "Retry"}
                    </button>
                  </div>
                ) : reports.timeToDecision.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <p className="text-sm">
                      {isAr ? "لا توجد مؤشرات مسجلة" : "No decision time records available"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.timeToDecision.map((item, idx) => {
                      const isSeconds = item.label.toLowerCase().includes("second");
                      const isMinutes = item.label.toLowerCase().includes("minute");
                      const isHours = item.label.toLowerCase().includes("hour");
                      const isTotal = item.label.toLowerCase().includes("total") || item.label.toLowerCase().includes("decision");

                      let unit = isAr ? "ساعة" : "hrs";
                      let friendlyLabel = item.label;

                      if (isSeconds) {
                        unit = isAr ? "ثانية" : "sec";
                        friendlyLabel = isAr ? "متوسط الوقت بالثواني" : "Average Seconds";
                      } else if (isMinutes) {
                        unit = isAr ? "دقيقة" : "min";
                        friendlyLabel = isAr ? "متوسط الوقت بالدقائق" : "Average Minutes";
                      } else if (isHours) {
                        unit = isAr ? "ساعة" : "hrs";
                        friendlyLabel = isAr ? "متوسط الوقت بالساعات" : "Average Hours";
                      } else if (isTotal) {
                        unit = isAr ? "قرار" : "decisions";
                        friendlyLabel = isAr ? "إجمالي القرارات المتخذة" : "Total Decisions";
                      }

                      return (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-sm">
                          <span className="font-medium text-foreground">{friendlyLabel}</span>
                          <span className="font-bold text-amber-600">
                            {item.value} {unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

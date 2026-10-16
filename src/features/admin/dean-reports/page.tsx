"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { ReportsFilterBar } from "@/features/admin/reports/components/reports-filter-bar";
import { useDeanReportsQuery } from "@/hooks/queries/use-dean-reports-queries";
import { ApplicationStatusReport } from "@/features/admin/reports/components/application-status-report";
import { FacultyReportTable } from "@/features/admin/reports/components/faculty-report-table";
import { DepartmentReportTable } from "@/features/admin/reports/components/department-report-table";
import { ProgramReportTable } from "@/features/admin/reports/components/program-report-table";
import type { ReportsChartItem } from "@/features/admin/reports/utils/admin-reports-analytics";
import { BarChart3, Clock, FileText, Loader2, AlertCircle } from "lucide-react";

export function DeanReportsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  const { data: reports, isLoading, isError, error } = useDeanReportsQuery(range);

  const statusDistribution: ReportsChartItem[] | null = reports?.byStatus
    ? reports.byStatus.map((item) => ({
        key: item.label,
        label: item.label,
        value: item.count,
      }))
    : null;

  const facultyDistribution: ReportsChartItem[] | null = reports?.byFaculty
    ? reports.byFaculty.map((item) => ({
        key: item.label,
        label: item.label,
        value: item.count,
      }))
    : null;

  const departmentDistribution: ReportsChartItem[] | null = reports?.byDepartment
    ? reports.byDepartment.map((item) => ({
        key: item.label,
        label: item.label,
        value: item.count,
      }))
    : null;

  const programDistribution: ReportsChartItem[] | null = reports?.byProgram
    ? reports.byProgram.map((item) => ({
        key: item.label,
        label: item.label,
        value: item.count,
      }))
    : null;

  const totalApplications = reports?.byStatus
    ? reports.byStatus.reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  const totalUploads = reports?.uploadVolume
    ? reports.uploadVolume.reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  let avgMinutesInReview = 0;
  if (reports?.timeInStatus && reports.timeInStatus.length > 0) {
    const reviewItem = reports.timeInStatus.find(
      (item) => item.label.includes("review") || item.label.includes("under_review")
    );
    if (reviewItem) {
      avgMinutesInReview = Math.round(reviewItem.average_minutes);
    } else {
      const avg =
        reports.timeInStatus.reduce((acc, curr) => acc + curr.average_minutes, 0) /
        reports.timeInStatus.length;
      avgMinutesInReview = Math.round(avg);
    }
  }

  return (
    <AdminLayout activePath={routes.adminDeanReports}>
      <div className="flex flex-col gap-8">
        <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">
                {isAr ? "تقارير عمادة القبول والتسجيل" : "Admission Dean Reports"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAr
                  ? "مؤشرات أداء القبول الإجمالية على مستوى الجامعة مصنفة حسب التواريخ والحالات"
                  : "Comprehensive university-wide admission metrics scoped by date and status"}
              </p>
            </div>
          </div>
        </header>

        <ReportsFilterBar onApply={setRange} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-[28px] border border-border shadow-sm">
            <Loader2 className="size-10 animate-spin text-primary mb-3" />
            <p className="text-sm font-bold text-muted-foreground">
              {isAr ? "جاري تحميل التقارير والإحصائيات..." : "Loading reports and analytics..."}
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
            <AlertCircle className="size-10" />
            <h3 className="text-lg font-bold">
              {isAr ? "تعذر تحميل تقارير العميد" : "Failed to load Dean reports"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        ) : reports ? (
          <>
            {/* KPI Cards */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isAr ? "إجمالي الطلبات" : "Total Applications"}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-primary">
                  {totalApplications}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "موزعة حسب الحالات الرسمية" : "Classified by official statuses"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isAr ? "حجم رفع الوثائق" : "Uploaded Documents"}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <BarChart3 className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-secondary">
                  {totalUploads}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "إجمالي الملفات والوثائق المرفوعة" : "Total uploaded admission files"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isAr ? "متوسط وقت المراجعة" : "Avg Review Time"}
                  </span>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <Clock className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold text-amber-600">
                  {avgMinutesInReview} {isAr ? "دقيقة" : "mins"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "متوسط بقاء الطلب في مرحلة التدقيق" : "Average time in verification stage"}
                </p>
              </div>
            </section>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 gap-6">
              <ApplicationStatusReport data={statusDistribution} />
            </div>

            {/* Academic Breakdowns (with individual error states for 500 endpoints) */}
            <div className="grid grid-cols-1 gap-6">
              <FacultyReportTable data={facultyDistribution} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <DepartmentReportTable data={departmentDistribution} />
              <ProgramReportTable data={programDistribution} />
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Building2,
  GraduationCap,
  Calendar,
} from "lucide-react";

import { ListSkeleton } from "@/components/common/loading/list-skeleton";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { PortalFooter } from "@/components/layouts/portal-footer";
import { routes, withLocale } from "@/constants/routes";
import { useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";
import { getStatusConfig } from "@/lib/adapters/status-adapter";
import { cn } from "@/lib/utils";
import { isVerificationError } from "@/lib/api/api-error";
import { isAccountVerificationBypassed } from "@/lib/auth-verification";

type FilterTab = "all" | "in_progress" | "action_required" | "draft" | "completed";

export function StudentApplicationsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: apiApps, isLoading, isFetching, isError, error, refetch } = useStudentApplicationsQuery();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const safeApiApps = Array.isArray(apiApps) ? apiApps : [];

  if (process.env.NODE_ENV !== "production") {
    // Dev diagnostics logging
    console.debug(`[MyApplications] query status: isLoading=${isLoading}, isFetching=${isFetching}, count=${safeApiApps.length}`);
  }

  const applications = safeApiApps.map((app) => ({
    id: String(app.id),
    applicationNo: app.applicationNo || String(app.id),
    selectedProgram: app.programName || (isAr ? "غير متوفر" : "N/A"),
    faculty: app.facultyName || (isAr ? "غير متوفر" : "N/A"),
    average: isAr ? "غير متوفر" : "N/A",
    currentStatus: app.status || "draft",
    createdAt: app.createdAt || app.submittedAt || new Date().toISOString().split("T")[0],
    statusConfig: getStatusConfig(app.status),
  }));

  // Calculate Metrics
  const totalCount = applications.length;
  const inProgressCount = applications.filter((a) =>
    ["submitted", "under_review", "forwarded_to_department_head", "returned_to_employee"].includes(a.currentStatus)
  ).length;

  const actionRequiredCount = applications.filter((a) =>
    ["draft", "returned_for_revision"].includes(a.currentStatus)
  ).length;

  const completedCount = applications.filter(
    (a) => a.currentStatus === "accepted"
  ).length;

  // Filter Applications
  const filteredApps = applications.filter((app) => {
    // Tab Filter
    if (activeTab === "in_progress") {
      if (!["submitted", "under_review", "forwarded_to_department_head", "returned_to_employee"].includes(app.currentStatus)) return false;
    } else if (activeTab === "action_required") {
      if (!["draft", "returned_for_revision"].includes(app.currentStatus)) return false;
    } else if (activeTab === "draft") {
      if (app.currentStatus !== "draft") return false;
    } else if (activeTab === "completed") {
      if (app.currentStatus !== "accepted") return false;
    }

    // Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        app.applicationNo.toLowerCase().includes(q) ||
        app.selectedProgram.toLowerCase().includes(q) ||
        app.faculty.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.applications} />

      <main className="app-container flex flex-1 flex-col gap-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#12360b] dark:text-[#8bd63a]">
                {isAr ? "طلباتي" : "My Applications"}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? "إدارة وتتبع طلبات القبول الخاصة بك في الجامعة الإسلامية بغزة"
                : "Manage and track all your admission applications at IUG"}
            </p>
          </div>

          <div>
            <Link
              href={withLocale(locale, routes.newApplication)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-md hover:bg-primary/90 transition active:scale-95"
            >
              <Plus className="size-5" />
              <span>{isAr ? "تقديم طلب جديد" : "Submit New Application"}</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <ListSkeleton items={4} />
        ) : isError && isVerificationError(error) && isAccountVerificationBypassed() ? (
          <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-6 text-center space-y-3 dark:border-amber-900/30 dark:bg-amber-950/20">
            <AlertTriangle className="size-8 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              {isAr ? "تعذر تحميل الطلبات" : "Failed to load applications"}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              {isAr
                ? "الباك ما زال يطلب تفعيل الحساب. يرجى تفعيل التجاوز المؤقت من جهة الباك."
                : "Backend still requires account verification. Please ask the backend team to enable the temporary verification bypass."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center space-y-3">
            <AlertTriangle className="size-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-800">
              {isAr ? "فشل التعرف على طلبات القبول" : "Failed to load applications"}
            </h3>
            <p className="text-xs text-red-600">
              {(error as Error)?.message || (isAr ? "تعذر الاتصال بالخادم" : "Server connection error")}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : (
          <>
            {/* Metrics Summary Row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isAr ? "إجمالي الطلبات" : "Total Applications"}
                  </p>
                  <h3 className="text-2xl font-black text-foreground mt-1">{totalCount}</h3>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isAr ? "قيد المراجعة" : "In Progress"}
                  </p>
                  <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {inProgressCount}
                  </h3>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="size-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isAr ? "بحاجة لإجراء" : "Action Required"}
                  </p>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {actionRequiredCount}
                  </h3>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <AlertTriangle className="size-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isAr ? "مكتملة" : "Completed"}
                  </p>
                  <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
                    {completedCount}
                  </h3>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-5" />
                </div>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 rounded-xl bg-muted/60 p-1.5 border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition",
                    activeTab === "all"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isAr ? `الكل (${totalCount})` : `All (${totalCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("action_required")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition",
                    activeTab === "action_required"
                      ? "bg-card text-emerald-700 dark:text-emerald-400 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isAr ? `بحاجة لإجراء (${actionRequiredCount})` : `Action Needed (${actionRequiredCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("in_progress")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition",
                    activeTab === "in_progress"
                      ? "bg-card text-amber-700 dark:text-amber-400 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isAr ? `قيد المراجعة (${inProgressCount})` : `In Progress (${inProgressCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("draft")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition",
                    activeTab === "draft"
                      ? "bg-card text-slate-700 dark:text-slate-300 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isAr ? "المسودات" : "Drafts"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("completed")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition",
                    activeTab === "completed"
                      ? "bg-card text-green-700 dark:text-green-400 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isAr ? `مكتملة (${completedCount})` : `Completed (${completedCount})`}
                </button>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? "بحث بالرقم أو التخصص..." : "Search by app # or program..."}
                  className="h-10 w-full rounded-xl border border-border bg-card ps-9 pe-4 text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Applications List */}
            {filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                  <FileText className="size-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isAr
                    ? totalCount === 0
                      ? "لا توجد طلبات حتى الآن"
                      : "لا توجد طلبات مطابقة"
                    : totalCount === 0
                    ? "No applications yet"
                    : "No matching applications found"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  {isAr
                    ? totalCount === 0
                      ? "لم تقم بإنشاء أي طلبات قبول بعد. يمكنك تقديم طلب قبول جديد الآن."
                      : "لم نجد أي طلبات قبول بهذا التصنيف. يمكنك إعادة تعيين البحث أو تقديم طلب جديد."
                    : totalCount === 0
                    ? "You have not created any applications yet. You can submit a new application now."
                    : "No admission applications found for this filter. Reset search or submit a new application."}
                </p>
                <Link
                  href={withLocale(locale, routes.newApplication)}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  <span>{isAr ? "تقديم طلب جديد" : "Submit New Application"}</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredApps.map((app) => {
                  const statusInfo = app.statusConfig;

                  return (
                    <div
                      key={app.id}
                      className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-6"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">
                            {app.applicationNo}
                          </span>

                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold shadow-2xs",
                              statusInfo.badgeClass
                            )}
                          >
                            {isAr ? statusInfo.labelAr : statusInfo.labelEn}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>{isAr ? `التاريخ: ${app.createdAt}` : `Date: ${app.createdAt}`}</span>
                        </div>
                      </div>

                      {/* Middle Content */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <GraduationCap className="size-3.5 text-primary" />
                            {isAr ? "التخصص المطلوب" : "Specialization / Program"}
                          </span>
                          <p className="text-base font-extrabold text-foreground">
                            {app.selectedProgram}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Building2 className="size-3.5 text-primary" />
                            {isAr ? "الكلية" : "Faculty"}
                          </span>
                          <p className="text-sm font-bold text-foreground">{app.faculty}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">
                            {isAr ? "المعدل" : "Average"}
                          </span>
                          <p className="text-sm font-bold text-foreground">{app.average}</p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
                        <Link
                          href={withLocale(locale, `/status/${app.id}`)}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-muted transition"
                        >
                          <span>{isAr ? "تتبع حالة الطلب" : "Track Status"}</span>
                          <ChevronRight className="size-4 rtl:rotate-180" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <PortalFooter />
    </div>
  );
}

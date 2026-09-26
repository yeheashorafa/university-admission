"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { useAdminApplicationsQuery } from "@/hooks/queries/use-admin-queries";
import { useAdminReportsQuery } from "@/hooks/queries/use-admin-reports-queries";
import {
  mapBackendApplicationToWorkflowApplication,
  type WorkflowApplication,
} from "@/features/admin/applications/data/applications-workflow.data";
import { ReportsHeader } from "./components/reports-header";
import { ReportsFilterBar } from "./components/reports-filter-bar";
import { ReportsStats } from "./components/reports-stats";
import { ApplicationStatusReport } from "./components/application-status-report";
import { AiAlertsReport } from "./components/ai-alerts-report";
import { RecentExportsCard } from "./components/recent-exports-card";
import { FacultyReportTable } from "./components/faculty-report-table";
import { buildAdminReportsAnalytics } from "./utils/admin-reports-analytics";

export function AdminReportsPage() {
  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  const { data: apiApps } = useAdminApplicationsQuery();
  const { data: reports } = useAdminReportsQuery(range);

  const applications: WorkflowApplication[] = useMemo(() => {
    const list = Array.isArray(apiApps) ? apiApps : [];
    return list.map((app) =>
      mapBackendApplicationToWorkflowApplication(app as Record<string, unknown>)
    );
  }, [apiApps]);

  const analytics = useMemo(() => {
    return buildAdminReportsAnalytics(applications, {
      byStatus: reports?.byStatus,
      byFaculty: reports?.byFaculty,
    });
  }, [applications, reports]);

  return (
    <AdminLayout activePath={routes.adminReports}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-800 dark:text-amber-300">
          <span>تنبيه النظام (PENDING_BACKEND_API):</span>
          <span>واجهة التقارير تعتمد على الـ Backend، وهي غير متاحة حالياً.</span>
        </div>

        <ReportsHeader />
        
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-[28px] border border-border shadow-sm">
          <h3 className="text-xl font-bold text-muted-foreground mb-2">Pending Backend API</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            لم يتم تفعيل روابط التقارير في الخلفية بعد. ستظهر الإحصائيات والرسوم البيانية هنا بمجرد توفر البيانات.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
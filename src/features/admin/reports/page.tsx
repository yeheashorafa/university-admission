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
import { DepartmentReportTable } from "./components/department-report-table";
import { ProgramReportTable } from "./components/program-report-table";
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
      byDepartment: reports?.byDepartment,
      byProgram: reports?.byProgram,
    });
  }, [applications, reports]);

  return (
    <AdminLayout activePath={routes.adminReports}>
      <div className="flex flex-col gap-8">
        <ReportsHeader />
        
        <ReportsFilterBar onApply={setRange} />
        
        {reports ? (
          <>
            <ReportsStats analytics={analytics} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ApplicationStatusReport data={analytics.statusDistribution} />
              <AiAlertsReport data={analytics.aiConfidenceDistribution} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <FacultyReportTable data={analytics.facultyDistribution} />
              </div>
              <div className="xl:col-span-1">
                <RecentExportsCard />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <DepartmentReportTable data={analytics.departmentDistribution} />
              <ProgramReportTable data={analytics.programDistribution} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-[28px] border border-border shadow-sm">
            <h3 className="text-xl font-bold text-muted-foreground mb-2">جاري التحميل...</h3>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
"use client";

import { useMemo, useState } from "react";
import { TableSkeleton } from "@/components/common/loading/table-skeleton";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { userRoles } from "@/constants/roles";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  useAdminApplicationsQuery,
  useEmployeeApplicationsQuery,
  useHeadApplicationsQuery,
} from "@/hooks/queries/use-admin-queries";
import { ApplicationsWorkflowHeader } from "./components/applications-workflow-header";
import { ApplicationsWorkflowTable } from "./components/applications-workflow-table";
import {
  mapBackendApplicationToWorkflowApplication,
  type WorkflowApplication,
} from "./data/applications-workflow.data";

export function AdminApplicationsPage() {
  const { user } = useCurrentAuth();
  const [search, setSearch] = useState("");

  const isEmployee = user?.role === userRoles.admissionEmployee;
  const isHead = user?.role === userRoles.departmentHead;

  const { data: empApps, isLoading: empLoading } = useEmployeeApplicationsQuery({ search });
  const { data: headApps, isLoading: headLoading } = useHeadApplicationsQuery({ search });
  const { data: adminApps, isLoading: adminLoading } = useAdminApplicationsQuery({ search });

  const rawApps = isEmployee ? empApps : isHead ? headApps : adminApps;
  const isLoading = isEmployee ? empLoading : isHead ? headLoading : adminLoading;

  const applications: WorkflowApplication[] = useMemo(() => {
    const list = Array.isArray(rawApps) ? rawApps : [];
    const normalized = list.map((app) =>
      mapBackendApplicationToWorkflowApplication(app as Record<string, unknown>)
    );

    if (process.env.NODE_ENV !== "production") {
      console.debug("[applications-debug]", {
        role: user?.role,
        endpoint: isEmployee ? "employee" : isHead ? "head" : "admin",
        rawCount: Array.isArray(rawApps) ? rawApps.length : 0,
        rawShape: rawApps,
        normalizedCount: normalized.length,
        firstApp: normalized[0] ? {
          id: normalized[0].id,
          applicationNo: normalized[0].applicationNo,
          status: normalized[0].currentStatus,
        } : null,
        filters: { search },
        visibleCount: normalized.length
      });
    }

    return normalized;
  }, [rawApps, isEmployee, isHead, search, user?.role]);

  return (
    <AdminLayout activePath={routes.adminApplications}>
      <div className="flex flex-col gap-6">
        <ApplicationsWorkflowHeader applications={applications} />

        {isLoading ? (
          <TableSkeleton columns={5} rows={6} />
        ) : (
          <ApplicationsWorkflowTable
            applications={applications}
            search={search}
            onSearchChange={setSearch}
          />
        )}
      </div>
    </AdminLayout>
  );
}
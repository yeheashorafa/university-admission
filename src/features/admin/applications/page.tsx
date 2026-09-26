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
  const { role } = useCurrentAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const isEmployee = role === userRoles.admissionEmployee;
  const isHead = role === userRoles.departmentHead;

  const queryStatus = status !== "all" ? status : undefined;
  const { data: empApps, isLoading: empLoading } = useEmployeeApplicationsQuery({ search, status: queryStatus });
  const { data: headApps, isLoading: headLoading } = useHeadApplicationsQuery({ search, status: queryStatus });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: adminApps, isLoading: adminLoading } = useAdminApplicationsQuery({ search, status: queryStatus as any });

  const rawApps = isEmployee ? empApps : isHead ? headApps : adminApps;
  const isLoading = isEmployee ? empLoading : isHead ? headLoading : adminLoading;

  const applications: WorkflowApplication[] = useMemo(() => {
    const list = Array.isArray(rawApps) ? rawApps : [];
    const normalized = list.map((app) =>
      mapBackendApplicationToWorkflowApplication(app as Record<string, unknown>)
    );

    if (process.env.NODE_ENV !== "production") {
      console.debug("[applications-debug]", {
        role,
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
  }, [rawApps, isEmployee, isHead, search, role]);

  return (
    <AdminLayout activePath={routes.adminApplications}>
      <div className="flex flex-col gap-6">
        <ApplicationsWorkflowHeader />

        {isLoading ? (
          <TableSkeleton columns={5} rows={6} />
        ) : (
          <ApplicationsWorkflowTable
            applications={applications}
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
          />
        )}
      </div>
    </AdminLayout>
  );
}
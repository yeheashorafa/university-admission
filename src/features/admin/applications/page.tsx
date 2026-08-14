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
    return list.map((app) =>
      mapBackendApplicationToWorkflowApplication(app as Record<string, unknown>)
    );
  }, [rawApps]);

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
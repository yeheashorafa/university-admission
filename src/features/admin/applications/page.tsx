"use client";

import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
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
  const empQuery = useEmployeeApplicationsQuery({ search, status: queryStatus });
  const headQuery = useHeadApplicationsQuery({ search, status: queryStatus });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminQuery = useAdminApplicationsQuery({ search, status: queryStatus as any });

  const activeQuery = isEmployee ? empQuery : isHead ? headQuery : adminQuery;
  const rawApps = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const error = activeQuery.error;

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
        <ApplicationsWorkflowHeader
          applications={applications}
          isLoading={isLoading}
        />

        {isLoading ? (
          <TableSkeleton columns={5} rows={6} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
            <AlertCircle className="size-10" />
            <h3 className="text-lg font-bold">تعذر تحميل طلبات الالتحاق</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error instanceof Error ? error.message : "حدث خطأ أثناء استرجاع الطلبات من الخادم."}
            </p>
            <button
              type="button"
              onClick={() => activeQuery.refetch()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              إعادة المحاولة
            </button>
          </div>
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
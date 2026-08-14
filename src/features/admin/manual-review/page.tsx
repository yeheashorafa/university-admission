"use client";

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { userRoles } from "@/constants/roles";
import {
  useEmployeeApplicationsQuery,
  useHeadApplicationsQuery,
  useAdminApplicationsQuery,
} from "@/hooks/queries/use-admin-queries";
import { ManualReviewHeader } from "./components/manual-review-header";
import { ManualReviewWorkflowQueue } from "./components/manual-review-workflow-queue";
import {
  mapBackendApplicationToWorkflowApplication,
  type WorkflowApplication,
} from "../applications/data/applications-workflow.data";

export function AdminManualReviewPage() {
  const { user } = useCurrentAuth();
  const [search, setSearch] = useState("");

  const isHead = user?.role === userRoles.departmentHead;
  const isEmployee = user?.role === userRoles.admissionEmployee;

  const { data: employeeApps, isLoading: loadingEmp } = useEmployeeApplicationsQuery();
  const { data: headApps, isLoading: loadingHead } = useHeadApplicationsQuery();
  const { data: adminApps, isLoading: loadingAdmin } = useAdminApplicationsQuery();

  const rawApplications = useMemo(() => {
    if (isHead) return headApps || [];
    if (isEmployee) return employeeApps || [];
    return adminApps || [];
  }, [isHead, isEmployee, headApps, employeeApps, adminApps]);

  const reviewApplications = useMemo<WorkflowApplication[]>(() => {
    const list = Array.isArray(rawApplications) ? rawApplications : [];

    return list
      .filter((app) => {
        const st = String(app.status || "").toLowerCase();
        // Exclude terminal / non-reviewable statuses
        if (["accepted", "rejected", "cancelled", "draft"].includes(st)) {
          return false;
        }

        if (isHead) {
          return st === "forwarded_to_department_head";
        }
        if (isEmployee) {
          return st === "under_review" || st === "returned_to_employee" || st === "submitted";
        }

        return st === "under_review" || st === "forwarded_to_department_head" || st === "returned_to_employee" || st === "submitted";
      })
      .map((app) =>
        mapBackendApplicationToWorkflowApplication(app as Record<string, unknown>)
      );
  }, [rawApplications, isHead, isEmployee]);

  const isLoading = isHead ? loadingHead : isEmployee ? loadingEmp : loadingAdmin;

  return (
    <AdminLayout activePath={routes.adminManualReview}>
      <div className="flex flex-col gap-6">
        <ManualReviewHeader
          totalApplications={reviewApplications.length}
          role={user?.role}
        />

        {isLoading ? (
          <div className="rounded-[28px] border border-border bg-card p-12 text-center text-muted-foreground">
            جاري تحميل طلبات المراجعة من الخادم...
          </div>
        ) : (
          <ManualReviewWorkflowQueue
            applications={reviewApplications}
            search={search}
            onSearchChange={setSearch}
          />
        )}
      </div>
    </AdminLayout>
  );
}
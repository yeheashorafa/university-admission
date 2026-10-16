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

import { AlertCircle } from "lucide-react";

export function AdminManualReviewPage() {
  const { role } = useCurrentAuth();
  const [search, setSearch] = useState("");

  const isHead = role === userRoles.departmentHead;
  const isEmployee = role === userRoles.admissionEmployee;

  const empQuery = useEmployeeApplicationsQuery();
  const headQuery = useHeadApplicationsQuery();
  const adminQuery = useAdminApplicationsQuery();

  const activeQuery = isHead ? headQuery : isEmployee ? empQuery : adminQuery;
  const rawApplications = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const error = activeQuery.error;

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

  return (
    <AdminLayout activePath={routes.adminManualReview}>
      <div className="flex flex-col gap-6">
        <ManualReviewHeader
          totalApplications={reviewApplications.length}
          role={role}
        />

        {isLoading ? (
          <div className="rounded-[28px] border border-border bg-card p-12 text-center text-muted-foreground">
            جاري تحميل طلبات المراجعة من الخادم...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
            <AlertCircle className="size-10" />
            <h3 className="text-lg font-bold">تعذر تحميل طلبات المراجعة اليدوية</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error instanceof Error ? error.message : "حدث خطأ أثناء استرجاع قائمة المراجعة من الخادم."}
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
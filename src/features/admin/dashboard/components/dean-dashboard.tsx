"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminDashboardHeader } from "./admin-dashboard-header";
import { DeanKpiCard, type DeanKpiCard as DeanKpiCardType } from "./dean-kpi-card";
import { useDeanDashboardQuery } from "@/hooks/queries/use-dean-queries";

export function DeanDashboard() {
  const t = useTranslations("admin");
  const { data, isLoading, isError } = useDeanDashboardQuery();

  const cards = useMemo<DeanKpiCardType[]>(() => {
    if (!data?.statistics) return [];

    const s = data.statistics;
    const result: DeanKpiCardType[] = [];

    if (typeof s.total_applications === "number") {
      result.push({ id: "total", value: s.total_applications.toLocaleString() });
    }
    if (typeof s.pending_applications === "number") {
      result.push({ id: "pending", value: s.pending_applications.toLocaleString() });
    }
    if (typeof s.under_review_applications === "number") {
      result.push({
        id: "review",
        value: s.under_review_applications.toLocaleString(),
        variant: "warning",
      });
    }
    if (typeof s.returned_for_revision_applications === "number") {
      result.push({
        id: "returned",
        value: s.returned_for_revision_applications.toLocaleString(),
        variant: "warning",
      });
    }
    if (typeof s.accepted_applications === "number") {
      result.push({
        id: "accepted",
        value: s.accepted_applications.toLocaleString(),
        variant: "success",
      });
    }
    if (typeof s.rejected_applications === "number") {
      result.push({
        id: "rejected",
        value: s.rejected_applications.toLocaleString(),
        variant: "danger",
      });
    }
    if (typeof s.total_programs === "number") {
      result.push({ id: "programs", value: s.total_programs.toLocaleString() });
    }
    if (typeof s.total_faculties === "number") {
      result.push({ id: "faculties", value: s.total_faculties.toLocaleString() });
    }
    if (typeof s.total_departments === "number") {
      result.push({ id: "departments", value: s.total_departments.toLocaleString() });
    }
    if (typeof s.total_students === "number") {
      result.push({ id: "students", value: s.total_students.toLocaleString() });
    }
    if (typeof s.total_users === "number") {
      result.push({ id: "users", value: s.total_users.toLocaleString() });
    }

    return result;
  }, [data]);

  return (
    <div className="flex flex-col gap-8">
      <AdminDashboardHeader />

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground font-semibold">
          {t("deanDashboard.loading")}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive font-semibold">
          {t("deanDashboard.error")}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <DeanKpiCard key={card.id} card={card} />
          ))}
        </section>
      )}
    </div>
  );
}

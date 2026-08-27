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
    if (!data) return [];

    const result: DeanKpiCardType[] = [];

    if (typeof data.totalApplications === "number") {
      result.push({
        id: "total",
        value: data.totalApplications.toLocaleString(),
      });
    }
    if (typeof data.submittedApplications === "number") {
      result.push({
        id: "submitted",
        value: data.submittedApplications.toLocaleString(),
      });
    }
    if (typeof data.underReviewApplications === "number") {
      result.push({
        id: "review",
        value: data.underReviewApplications.toLocaleString(),
        variant: "warning",
      });
    }
    if (typeof data.acceptedApplications === "number") {
      result.push({
        id: "accepted",
        value: data.acceptedApplications.toLocaleString(),
        variant: "success",
      });
    }
    if (typeof data.rejectedApplications === "number") {
      result.push({
        id: "rejected",
        value: data.rejectedApplications.toLocaleString(),
        variant: "danger",
      });
    }
    if (typeof data.programsCount === "number") {
      result.push({
        id: "programs",
        value: data.programsCount.toLocaleString(),
      });
    }
    if (typeof data.facultiesCount === "number") {
      result.push({
        id: "faculties",
        value: data.facultiesCount.toLocaleString(),
      });
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

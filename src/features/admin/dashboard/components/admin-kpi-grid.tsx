"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useAdminReportsQuery } from "@/hooks/queries/use-admin-reports-queries";
import { AdminKpiCard } from "./admin-kpi-card";
import type { AdminKpiCard as KpiCardType } from "../data/admin-dashboard.data";

export function AdminKpiGrid() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { data: reports, isLoading } = useAdminReportsQuery();

  const cards: KpiCardType[] = useMemo(() => {
    if (isLoading) {
      return [
        { id: "total", label: isAr ? "إجمالي الطلبات" : "Total Applications", value: "..." },
        { id: "review", label: isAr ? "قيد المراجعة" : "Under Review", value: "...", variant: "warning" },
        { id: "missing", label: isAr ? "معادة للاستكمال" : "Returned / Revision", value: "..." },
        { id: "accepted", label: isAr ? "الطلبات المقبولة" : "Accepted", value: "...", variant: "success" },
        { id: "rejected", label: isAr ? "الطلبات المرفوضة" : "Rejected", value: "...", variant: "danger" },
      ];
    }

    const byStatus = reports?.byStatus ?? [];
    const totalCount = byStatus.reduce((acc, curr) => acc + curr.count, 0);

    const getCountFor = (statuses: string[]) =>
      byStatus
        .filter((item) => statuses.includes(item.label.toLowerCase()))
        .reduce((sum, item) => sum + item.count, 0);

    const reviewCount = getCountFor([
      "under_review",
      "submitted",
      "forwarded_to_department_head",
      "ai_failed",
      "employee_review",
      "head_review",
    ]);

    const returnedCount = getCountFor([
      "returned_to_employee",
      "returned_for_revision",
    ]);

    const acceptedCount = getCountFor([
      "accepted",
      "approved",
      "head_approved",
      "completed",
      "payment_pending",
      "payment_completed",
    ]);

    const rejectedCount = getCountFor([
      "rejected",
      "cancelled",
      "ai_rejected",
      "employee_rejected",
      "head_rejected",
    ]);

    return [
      {
        id: "total",
        label: isAr ? "إجمالي الطلبات" : "Total Applications",
        value: String(totalCount),
      },
      {
        id: "review",
        label: isAr ? "قيد المراجعة" : "Under Review",
        value: String(reviewCount),
        variant: "warning",
      },
      {
        id: "missing",
        label: isAr ? "معادة للاستكمال" : "Returned / Revision",
        value: String(returnedCount),
      },
      {
        id: "accepted",
        label: isAr ? "الطلبات المقبولة" : "Accepted",
        value: String(acceptedCount),
        variant: "success",
      },
      {
        id: "rejected",
        label: isAr ? "الطلبات المرفوضة" : "Rejected",
        value: String(rejectedCount),
        variant: "danger",
      },
    ];
  }, [reports, isLoading, isAr]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <AdminKpiCard key={card.id} card={card} />
      ))}
    </section>
  );
}
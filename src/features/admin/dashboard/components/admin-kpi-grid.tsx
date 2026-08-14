"use client";

import { useMemo } from "react";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { userRoles } from "@/constants/roles";
import {
  useEmployeeApplicationsQuery,
  useHeadApplicationsQuery,
  useAdminApplicationsQuery,
} from "@/hooks/queries/use-admin-queries";
import { AdminKpiCard } from "./admin-kpi-card";
import type { AdminKpiCard as KpiCardType } from "../data/admin-dashboard.data";

export function AdminKpiGrid() {
  const { user } = useCurrentAuth();

  const isHead = user?.role === userRoles.departmentHead;
  const isEmployee = user?.role === userRoles.admissionEmployee;

  const { data: empApps } = useEmployeeApplicationsQuery();
  const { data: headApps } = useHeadApplicationsQuery();
  const { data: adminApps } = useAdminApplicationsQuery();

  const rawApplications = useMemo(() => {
    if (isHead) return headApps || [];
    if (isEmployee) return empApps || [];
    return adminApps || [];
  }, [isHead, isEmployee, headApps, empApps, adminApps]);

  const cards: KpiCardType[] = useMemo(() => {
    const apps = Array.isArray(rawApplications) ? rawApplications : [];
    const total = apps.length;

    let review = 0;
    let missing = 0;
    let accepted = 0;
    let rejected = 0;

    for (const app of apps) {
      const st = String(app.status || "").toLowerCase();
      if (st === "accepted") accepted++;
      else if (st === "rejected") rejected++;
      else if (st === "returned_for_revision" || st === "returned_to_employee") missing++;
      else if (st === "under_review" || st === "submitted" || st === "forwarded_to_department_head") review++;
    }

    return [
      { id: "total", label: "Total Applications", value: total.toLocaleString() },
      { id: "review", label: "Under Review", value: review.toLocaleString(), variant: "warning" },
      { id: "missing", label: "Returned / Revision", value: missing.toLocaleString() },
      { id: "accepted", label: "Accepted", value: accepted.toLocaleString(), variant: "success" },
      { id: "rejected", label: "Rejected", value: rejected.toLocaleString(), variant: "danger" },
    ];
  }, [rawApplications]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <AdminKpiCard key={card.id} card={card} />
      ))}
    </section>
  );
}
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
  const { role } = useCurrentAuth();

  const isHead = role === userRoles.departmentHead;
  const isEmployee = role === userRoles.admissionEmployee;

  const { data: empApps } = useEmployeeApplicationsQuery();
  const { data: headApps } = useHeadApplicationsQuery();
  const { data: adminApps } = useAdminApplicationsQuery();

  const rawApplications = useMemo(() => {
    if (isHead) return headApps || [];
    if (isEmployee) return empApps || [];
    return adminApps || [];
  }, [isHead, isEmployee, headApps, empApps, adminApps]);

  const cards: KpiCardType[] = useMemo(() => {
    return [
      { id: "total", label: "Total Applications", value: "Pending API" },
      { id: "review", label: "Under Review", value: "Pending API", variant: "warning" },
      { id: "missing", label: "Returned / Revision", value: "Pending API" },
      { id: "accepted", label: "Accepted", value: "Pending API", variant: "success" },
      { id: "rejected", label: "Rejected", value: "Pending API", variant: "danger" },
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
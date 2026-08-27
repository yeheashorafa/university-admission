"use client";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { isAdmissionEmployee, isAdmissionDean } from "@/constants/roles";
import { AdminDashboardHeader } from "./components/admin-dashboard-header";
import { AdminKpiGrid } from "./components/admin-kpi-grid";
import { EmployeeOperationalDashboard } from "./components/employee-operational-dashboard";
import { DeanDashboard } from "./components/dean-dashboard";

export function AdminDashboardPage() {
  const { user } = useCurrentAuth();

  if (isAdmissionDean(user?.role)) {
    return (
      <AdminLayout activePath={routes.admin}>
        <DeanDashboard />
      </AdminLayout>
    );
  }

  if (isAdmissionEmployee(user?.role)) {
    return (
      <AdminLayout activePath={routes.admin}>
        <EmployeeOperationalDashboard />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePath={routes.admin}>
      <div className="flex flex-col gap-8">
        <AdminDashboardHeader />
        <AdminKpiGrid />
      </div>
    </AdminLayout>
  );
}
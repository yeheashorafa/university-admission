"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { AdmissionCyclesStats } from "./components/admission-cycles-stats";
import { AdmissionCyclesWorkspace } from "./components/admission-cycles-workspace";
import { AdmissionCyclesHeader } from "./components/admission-cycles-header";
import {
  type AdmissionCycle,
  type AdmissionCycleStatus,
} from "./data/admission-cycles.data";

import { useAdminAdmissionCyclesQuery } from "@/hooks/queries/use-admin-queries";

export function AdminAdmissionCyclesPage() {
  const { data: apiCycles } = useAdminAdmissionCyclesQuery();

  const cycles: AdmissionCycle[] = useMemo(() => {
    const list = Array.isArray(apiCycles) ? apiCycles : [];

    return list.map((item) => {
      const c = item as Record<string, unknown>;
      return {
        id: String(c.id),
        name: String(c.name || c.academic_year || "—"),
        academicYear: String(c.academic_year || "—"),
        semester: String(c.semester || "—"),
        status: (c.is_active === true || c.status === "open" ? "active" : "closed") as AdmissionCycleStatus,
        applicationsOpenAt: String(c.starts_at || c.start_date || "—"),
        applicationsCloseAt: String(c.ends_at || c.end_date || "—"),
        paymentDeadline: String(c.payment_deadline || "—"),
        capacity: c.capacity !== undefined && c.capacity !== null ? Number(c.capacity) : 0,
        applicationsCount: Number(c.applications_count || 0),
        acceptedCount: Number(c.accepted_count || 0),
        notes: String(c.notes || "—"),
      };
    });
  }, [apiCycles]);

  const [activeCycleId, setActiveCycleId] = useState(cycles[0]?.id ?? "");

  const activeCycle = useMemo(() => {
    return cycles.find((cycle) => cycle.id === activeCycleId) ?? cycles[0];
  }, [cycles, activeCycleId]);

  async function handleCreateCycle() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
  }

  async function handleUpdateCycle() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
  }

  async function handleChangeStatus() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
  }

  async function handleDeleteCycle() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
  }

  return (
    <AdminLayout activePath={routes.adminAdmissionCycles}>
      <div className="flex flex-col gap-8">
        <AdmissionCyclesHeader onCreateCycle={handleCreateCycle} />

        {cycles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
            <p className="text-lg font-bold text-muted-foreground">
              لا توجد بيانات من الخادم حالياً
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No data is currently available from the server.
            </p>
          </div>
        ) : (
          <>
            <AdmissionCyclesStats cycles={cycles} />

            <AdmissionCyclesWorkspace
              cycles={cycles}
              activeCycle={activeCycle}
              activeCycleId={activeCycleId}
              onSelectCycle={setActiveCycleId}
              onUpdateCycle={handleUpdateCycle}
              onChangeStatus={handleChangeStatus}
              onDeleteCycle={handleDeleteCycle}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
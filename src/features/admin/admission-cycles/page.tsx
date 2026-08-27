"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { AdmissionCyclesStats } from "./components/admission-cycles-stats";
import { AdmissionCyclesWorkspace } from "./components/admission-cycles-workspace";
import { AdmissionCyclesHeader } from "./components/admission-cycles-header";
import { AdmissionCycleCreateModal } from "./components/admission-cycle-create-modal";
import {
  type AdmissionCycle,
  type AdmissionCycleStatus,
} from "./data/admission-cycles.data";
import {
  useAdminAdmissionCyclesQuery,
  useCreateAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
  useDeleteAdmissionCycleMutation,
} from "@/hooks/queries/use-admin-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { AdminAdmissionCyclePayload } from "@/services/admin.service";

const SEMESTER_TO_BACKEND: Record<string, AdminAdmissionCyclePayload["semester"]> = {
  Fall: "first",
  Spring: "second",
  Summer: "summer",
};

function mapCycleUpdates(
  updates: Partial<AdmissionCycle>
): Partial<AdminAdmissionCyclePayload> {
  const payload: Partial<AdminAdmissionCyclePayload> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.academicYear !== undefined) payload.academic_year = updates.academicYear;
  if (updates.semester !== undefined) {
    payload.semester =
      SEMESTER_TO_BACKEND[updates.semester] ??
      (updates.semester as AdminAdmissionCyclePayload["semester"]);
  }
  if (updates.applicationsOpenAt !== undefined)
    payload.starts_at = updates.applicationsOpenAt;
  if (updates.applicationsCloseAt !== undefined)
    payload.ends_at = updates.applicationsCloseAt;
  return payload;
}

export function AdminAdmissionCyclesPage() {
  const { data: apiCycles } = useAdminAdmissionCyclesQuery();
  const createMutation = useCreateAdmissionCycleMutation();
  const updateMutation = useUpdateAdmissionCycleMutation();
  const deleteMutation = useDeleteAdmissionCycleMutation();

  const [showCreate, setShowCreate] = useState(false);

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

  function handleCreateCycle() {
    setShowCreate(true);
  }

  async function handleUpdateCycle(
    cycleId: string,
    updates: Partial<AdmissionCycle>,
    successMessage?: string
  ) {
    try {
      await updateMutation.mutateAsync({ id: cycleId, payload: mapCycleUpdates(updates) });
      toast.success(successMessage || "Admission cycle updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleChangeStatus(cycleId: string, status: AdmissionCycleStatus) {
    try {
      await updateMutation.mutateAsync({
        id: cycleId,
        payload: { is_active: status === "open" },
      });
      toast.success(status === "open" ? "Cycle opened." : "Cycle closed.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleDeleteCycle(cycleId: string) {
    const result = await Swal.fire({
      title: "Delete admission cycle?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMutation.mutateAsync(cycleId);
      toast.success("Admission cycle deleted.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
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

      <AdmissionCycleCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
          toast.success("Admission cycle created.");
        }}
      />
    </AdminLayout>
  );
}

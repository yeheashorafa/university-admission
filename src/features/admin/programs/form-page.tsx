"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toast } from "sonner";
import { useAdminFacultiesQuery } from "@/hooks/queries";
import {
  useAdminProgramCatalogDetailsQuery,
  useCreateAdminProgramMutation,
  useUpdateAdminProgramCatalogDetailsMutation,
  useUpdateAdminProgramMutation,
} from "@/hooks/queries/use-admin-programs-queries";
import type {
  AdminProgramDetailsPayload,
  AdminProgramPayload,
} from "@/services/admin-programs.service";
import type { AdminProgramEditor } from "./data/admin-programs.data";
import { mapAdminProgram } from "./data/map-admin-program";
import {
  AdminProgramForm,
  type ProgramFormSubmission,
} from "./components/admin-program-form";

export function AdminProgramFormPage({
  mode,
  programId,
}: {
  mode: "create" | "edit";
  programId?: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin");
  const programQuery = useAdminProgramCatalogDetailsQuery(mode === "edit" ? programId : undefined);
  const { data: rawFaculties } = useAdminFacultiesQuery();
  const createProgram = useCreateAdminProgramMutation();
  const updateProgram = useUpdateAdminProgramMutation();
  const updateDetails = useUpdateAdminProgramCatalogDetailsMutation();
  const [pendingDetails, setPendingDetails] = useState<{
    id: string;
    payload: AdminProgramDetailsPayload;
  } | null>(null);

  const program: AdminProgramEditor | null = useMemo(() => {
    if (mode !== "edit" || !programQuery.data) return null;
    const item = programQuery.data;
    return String(item.id) === programId ? mapAdminProgram(item, locale, rawFaculties) : null;
  }, [locale, mode, programId, programQuery.data, rawFaculties]);

  async function submit({ program: values, details }: ProgramFormSubmission) {
    const payload: AdminProgramPayload = {
      faculty_id: Number(values.facultyId),
      name_en: values.nameEn,
      name_ar: values.nameAr,
      description_en: values.descriptionEn || undefined,
      description_ar: values.descriptionAr || undefined,
      minimum_average: values.minimumAverage,
      is_active: mode === "create" || values.isActive,
    };

    let createdThisAttempt = false;
    try {
      if (pendingDetails) {
        await updateDetails.mutateAsync({
          programId: pendingDetails.id,
          payload: pendingDetails.payload,
        });
        setPendingDetails(null);
        toast.success(t("programs.updatedSuccessfully"));
        router.push(`/${locale}${routes.adminPrograms}`);
        return;
      }

      let savedId = programId ?? "";
      if (mode === "create") {
        const created = await createProgram.mutateAsync(payload);
        savedId = String(created.id);
        setPendingDetails({ id: savedId, payload: details });
        createdThisAttempt = true;
      } else {
        await updateProgram.mutateAsync({ programId: savedId, payload });
      }

      await updateDetails.mutateAsync({ programId: savedId, payload: details });
      setPendingDetails(null);
      toast.success(t("programs.updatedSuccessfully"));
      router.push(`/${locale}${routes.adminPrograms}`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error(
        pendingDetails || createdThisAttempt
          ? `تم إنشاء التخصص الأساسي، لكن تعذر حفظ التفاصيل. أعد الحفظ للمحاولة. / The program was created, but its details failed to save. Save again to retry. ${message}`
          : message,
      );
    }
  }

  const isSubmitting =
    createProgram.isPending || updateProgram.isPending || updateDetails.isPending;
  const isLoadingProgram =
    !programQuery.isAuthHydrated ||
    (programQuery.isEnabled && (programQuery.isPending || programQuery.isFetching));
  const hasProgramLoadError =
    programQuery.isError ||
    (programQuery.isAuthHydrated && !programQuery.isEnabled);

  return (
    <AdminLayout activePath={routes.adminPrograms}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {mode === "edit" && isLoadingProgram ? (
          <div className="rounded-2xl border border-border bg-card py-20 text-center text-muted-foreground">
            {t("programs.loading")}
          </div>
        ) : mode === "edit" && (hasProgramLoadError || !program) ? (
          <div className="rounded-2xl border border-destructive/20 bg-card py-12 text-center">
            <p className="font-bold text-destructive">تعذر تحميل التخصص / Could not load program</p>
            <button
              type="button"
              onClick={() => programQuery.refetch()}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              إعادة المحاولة / Retry
            </button>
          </div>
        ) : (
          <AdminProgramForm
            mode={mode}
            program={program}
            onClose={() => router.push(`/${locale}${routes.adminPrograms}`)}
            onSubmit={submit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </AdminLayout>
  );
}

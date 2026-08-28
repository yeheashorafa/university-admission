"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api/api-error";
import { X } from "lucide-react";
import { useCreateAdminBranchMutation, useUpdateAdminBranchMutation } from "@/hooks/queries/use-admin-branches-queries";
import type { AdminBranch } from "@/services/admin-branches.service";
import { cn } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  branch: AdminBranch | null;
};

const formSchema = z.object({
  name_ar: z.string().min(1, "Required"),
  name_en: z.string().min(1, "Required"),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function AdminBranchFormModal({ isOpen, onClose, branch }: Props) {
  const t = useTranslations("admin.branches");
  const isEditing = !!branch;

  const createMutation = useCreateAdminBranchMutation();
  const updateMutation = useUpdateAdminBranchMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_ar: "",
      name_en: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (isOpen) {
      if (branch) {
        reset({
          name_ar: branch.name_ar || "",
          name_en: branch.name_en || "",
          is_active: branch.is_active ?? true,
        });
      } else {
        reset({
          name_ar: "",
          name_en: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, branch, reset]);

  if (!isOpen) return null;

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { branchId: branch.id, payload: values },
        {
          onSuccess: () => {
            toast.success("Success");
            onClose();
          },
          onError: (error) => {
            const apiError = extractApiError(error);
            toast.error(apiError.message || "Failed");
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Success");
          onClose();
        },
        onError: (error) => {
          const apiError = extractApiError(error);
          toast.error(apiError.message || "Failed");
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <section className="w-full max-w-[425px] overflow-hidden rounded-xl bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? t("edit") : t("add")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <label className="space-y-2 block">
            <span className="block text-sm font-medium text-muted-foreground">{t("nameAr")}</span>
            <input
              {...register("name_ar")}
              className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name_ar && <p className="text-xs text-destructive">{errors.name_ar.message}</p>}
          </label>

          <label className="space-y-2 block">
            <span className="block text-sm font-medium text-muted-foreground">{t("nameEn")}</span>
            <input
              {...register("name_en")}
              className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name_en && <p className="text-xs text-destructive">{errors.name_en.message}</p>}
          </label>

          <div className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
            <span className="text-base font-medium text-muted-foreground">{t("status")}</span>
            <button
              type="button"
              onClick={() => setValue("is_active", !isActive)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isActive ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isActive ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

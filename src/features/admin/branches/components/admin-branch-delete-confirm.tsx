"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { X } from "lucide-react";
import { extractApiError } from "@/lib/api/api-error";
import { useDeleteAdminBranchMutation } from "@/hooks/queries/use-admin-branches-queries";
import type { AdminBranch } from "@/services/admin-branches.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  branch: AdminBranch | null;
};

export function AdminBranchDeleteConfirm({ isOpen, onClose, branch }: Props) {
  const t = useTranslations("admin.branches");
  const deleteMutation = useDeleteAdminBranchMutation();

  if (!isOpen) return null;

  const handleDelete = () => {
    if (!branch) return;

    deleteMutation.mutate(branch.id, {
      onSuccess: () => {
        toast.success(t("deleteSuccess"));
        onClose();
      },
      onError: (error) => {
        const apiError = extractApiError(error);
        toast.error(apiError.message || t("deleteFailed"));
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <section className="w-full max-w-[425px] overflow-hidden rounded-xl bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-xl font-bold text-destructive">
            {t("delete")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="p-5">
          <p className="text-sm text-muted-foreground">{t("deleteConfirm")}</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-border p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="h-11 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-11 rounded-lg bg-destructive px-5 text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
          >
            {deleteMutation.isPending ? "..." : t("delete")}
          </button>
        </div>
      </section>
    </div>
  );
}

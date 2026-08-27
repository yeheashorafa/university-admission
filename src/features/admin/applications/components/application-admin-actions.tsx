"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, UserCheck, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { userRoles } from "@/constants/roles";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  assignReviewerToApplication,
  cancelApplicationByAdmin,
} from "@/services/admin.service";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/api/api-error";

type ApplicationAdminActionsProps = {
  applicationId: string | number;
  status: string;
};

export function ApplicationAdminActions({
  applicationId,
  status,
}: ApplicationAdminActionsProps) {
  const t = useTranslations("admin.applicationWorkflow");
  const { user } = useCurrentAuth();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === userRoles.admin;

  const [reviewerId, setReviewerId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = status !== "cancelled" && status !== "completed";

  async function handleAssignReviewer() {
    if (!reviewerId.trim()) {
      await Swal.fire({
        title: t("reviewerRequiredTitle"),
        text: t("reviewerRequiredDescription"),
        icon: "warning",
      });
      return;
    }
    const res = await Swal.fire({
      title: t("assignReviewerConfirmTitle"),
      text: t("assignReviewerConfirmDescription"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    setIsAssigning(true);
    try {
      await assignReviewerToApplication(applicationId, reviewerId.trim());
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.applicationDetails(applicationId),
      });
      setReviewerId("");
      await Swal.fire({
        title: t("successTitle"),
        text: t("assignReviewerSuccess"),
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({ title: t("errorTitle"), text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleCancelApplication() {
    const res = await Swal.fire({
      title: t("cancelApplicationTitle"),
      html: `<textarea id="swal-cancel-reason" class="swal2-textarea" placeholder="${t("cancelReasonPlaceholder")}"></textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: t("cancelApplicationConfirm"),
      cancelButtonText: t("cancel"),
      preConfirm: () => {
        const el = document.getElementById("swal-cancel-reason") as HTMLTextAreaElement | null;
        return el ? el.value : "";
      },
    });
    if (!res.isConfirmed) return;

    const reason = (res.value as string) ?? "";
    setIsCancelling(true);
    try {
      await cancelApplicationByAdmin(applicationId, reason);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.applicationDetails(applicationId),
      });
      setCancelReason("");
      await Swal.fire({
        title: t("successTitle"),
        text: t("cancelApplicationSuccess"),
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({ title: t("errorTitle"), text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsCancelling(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="text-xl font-bold text-primary">{t("adminActionsTitle")}</h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("adminActionsDescription")}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <label className="text-sm font-bold text-foreground">{t("assignReviewer")}</label>
        <input
          type="text"
          value={reviewerId}
          onChange={(event) => setReviewerId(event.target.value)}
          placeholder={t("reviewerIdPlaceholder")}
          disabled={isAssigning}
          className="h-11 w-full rounded-[14px] border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
        />
        <button
          type="button"
          disabled={isAssigning}
          onClick={handleAssignReviewer}
          className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-secondary text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-50"
        >
          {isAssigning ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
          {isAssigning ? t("processing") : t("assignReviewer")}
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <label className="text-sm font-bold text-foreground">{t("cancelApplication")}</label>
        <textarea
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
          placeholder={t("cancelReasonPlaceholder")}
          disabled={isCancelling}
          className="min-h-[90px] w-full rounded-[18px] border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
        />
        <button
          type="button"
          disabled={!canCancel || isCancelling}
          onClick={handleCancelApplication}
          className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-destructive text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
        >
          {isCancelling ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
          {isCancelling ? t("processing") : t("cancelApplication")}
        </button>
      </div>
    </section>
  );
}

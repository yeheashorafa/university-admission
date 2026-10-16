"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MessageSquare, Sparkles, Trash2, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { userRoles } from "@/constants/roles";
import {
  useEmployeeWorkflowMutations,
} from "@/hooks/queries/use-admin-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import type { EmployeeComment } from "@/services/employee.service";

type ApplicationEmployeeActionsProps = {
  applicationId: string | number;
  status: string;
  comments: EmployeeComment[];
};

export function ApplicationEmployeeActions({
  applicationId,
  status,
  comments: initialComments,
}: ApplicationEmployeeActionsProps) {
  const t = useTranslations("admin.applicationWorkflow");
  const { role } = useCurrentAuth();
  const isEmployee = role === userRoles.admissionEmployee;

  const {
    verifyAiMutation,
    addCommentMutation,
    updateCommentMutation,
    deleteCommentMutation,
  } = useEmployeeWorkflowMutations();

  const [comments, setComments] = useState<EmployeeComment[]>(initialComments ?? []);
  const [newComment, setNewComment] = useState("");

  const isTerminal = ["accepted", "approved", "rejected", "cancelled"].includes(status);
  const canVerifyAi = isEmployee && !isTerminal && (status === "under_review" || status === "returned_to_employee" || status === "ai_failed" || status === "submitted");

  async function handleVerifyAi() {
    const res = await Swal.fire({
      title: t("verifyAiConfirmTitle"),
      text: t("verifyAiConfirmDescription"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    try {
      await verifyAiMutation.mutateAsync({ id: applicationId });
      await Swal.fire({
        title: t("successTitle"),
        text: t("verifyAiSuccess"),
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({ title: t("errorTitle"), text: getApiErrorMessage(err), icon: "error" });
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    try {
      const created = await addCommentMutation.mutateAsync({
        id: applicationId,
        comment: newComment.trim(),
      });
      setComments((prev) => [
        ...prev,
        {
          id: created.id,
          comment: created.comment,
          created_at: created.created_at,
        },
      ]);
      setNewComment("");
    } catch (err) {
      await Swal.fire({ title: t("errorTitle"), text: getApiErrorMessage(err), icon: "error" });
    }
  }

  async function handleUpdateComment(comment: EmployeeComment) {
    const { value } = await Swal.fire({
      title: t("updateCommentTitle"),
      input: "textarea",
      inputValue: comment.comment,
      showCancelButton: true,
      confirmButtonText: t("updateComment"),
      cancelButtonText: t("cancel"),
    });
    if (!value || !value.trim()) return;
    try {
      await updateCommentMutation.mutateAsync({
        id: applicationId,
        commentId: comment.id,
        comment: value.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, comment: value.trim() } : c))
      );
    } catch (err) {
      await Swal.fire({ title: t("errorTitle"), text: getApiErrorMessage(err), icon: "error" });
    }
  }

  async function handleDeleteComment(comment: EmployeeComment) {
    const res = await Swal.fire({
      title: t("deleteCommentTitle"),
      text: t("deleteCommentDescription"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("deleteComment"),
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;
    try {
      await deleteCommentMutation.mutateAsync({
        id: applicationId,
        commentId: comment.id,
      });
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch (err) {
      await Swal.fire({ title: t("errorTitle"), text: getApiErrorMessage(err), icon: "error" });
    }
  }

  if (!isEmployee) return null;

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="text-xl font-bold text-primary">{t("employeeExtraTitle")}</h2>

      {canVerifyAi && (
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            disabled={verifyAiMutation.isPending}
            onClick={handleVerifyAi}
            className="flex h-11 items-center justify-center gap-2 rounded-[16px] border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary/15 disabled:opacity-50"
          >
            {verifyAiMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {verifyAiMutation.isPending ? t("verifyingAi") : t("verifyAi")}
          </button>
        </div>
      )}

      {/* Comments */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">{t("commentsTitle")}</h3>
        </div>

        <div className="flex flex-col gap-3">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noComments")}</p>
          )}

          {comments.map((comment) => (
            <div
              key={String(comment.id)}
              className="rounded-[18px] border border-border bg-background p-4"
            >
              <p className="text-sm leading-6 text-foreground">{comment.comment}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {comment.author ? `${comment.author} · ` : ""}
                  {comment.created_at ?? ""}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateComment(comment)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:underline"
                  >
                    <Pencil className="size-3.5" />
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-destructive transition hover:underline"
                  >
                    <Trash2 className="size-3.5" />
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder={t("commentPlaceholder")}
            disabled={addCommentMutation.isPending}
            className="min-h-[90px] w-full rounded-[18px] border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          />
          <button
            type="button"
            disabled={!newComment.trim() || addCommentMutation.isPending}
            onClick={handleAddComment}
            className="h-10 self-end rounded-[14px] bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {addCommentMutation.isPending ? t("processing") : t("addComment")}
          </button>
        </div>
      </div>
    </section>
  );
}

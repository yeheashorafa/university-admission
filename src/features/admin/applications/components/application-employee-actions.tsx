"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MessageSquare, Send, Sparkles, Trash2, Pencil, X } from "lucide-react";
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
  const { user } = useCurrentAuth();
  const isEmployee =
    user?.role === userRoles.admissionEmployee || user?.role === userRoles.admin;

  const {
    verifyAiMutation,
    reForwardMutation,
    addCommentMutation,
    updateCommentMutation,
    deleteCommentMutation,
  } = useEmployeeWorkflowMutations();

  const [comments, setComments] = useState<EmployeeComment[]>(initialComments ?? []);
  const [newComment, setNewComment] = useState("");

  const [isReForwardOpen, setIsReForwardOpen] = useState(false);

  const canReForward = isEmployee && status !== "cancelled" && status !== "rejected";

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

  async function handleReForward() {
    try {
      await reForwardMutation.mutateAsync({ id: applicationId });
      setIsReForwardOpen(false);
      await Swal.fire({
        title: t("successTitle"),
        text: t("reForwardSuccess"),
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

        <button
          type="button"
          disabled={!canReForward || reForwardMutation.isPending}
          onClick={() => setIsReForwardOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-secondary text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-50"
        >
          {reForwardMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {reForwardMutation.isPending ? t("processing") : t("reForward")}
        </button>
      </div>

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

      {/* Re-forward modal */}
      {isReForwardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary">{t("reForward")}</h3>
              <button
                type="button"
                onClick={() => setIsReForwardOpen(false)}
                className="text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mb-5 text-sm leading-6 text-muted-foreground">
              {t("reForwardConfirmDescription")}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReForward}
                disabled={reForwardMutation.isPending}
                className="h-11 flex-1 rounded-[16px] bg-secondary text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-50"
              >
                {reForwardMutation.isPending ? t("processing") : t("confirmReForward")}
              </button>
              <button
                type="button"
                onClick={() => setIsReForwardOpen(false)}
                className="h-11 flex-1 rounded-[16px] border border-border bg-background text-sm font-bold text-foreground transition hover:bg-background/80"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

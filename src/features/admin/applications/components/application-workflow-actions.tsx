"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import { userRoles } from "@/constants/roles";
import {
  useEmployeeWorkflowMutations,
  useHeadWorkflowMutations,
} from "@/hooks/queries/use-admin-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";

type ApplicationWorkflowActionsProps = {
  applicationId: string | number;
  status: string;
  role?: string | null;
  onSuccessAction?: () => void;
};

export function ApplicationWorkflowActions({
  applicationId,
  status,
  role,
  onSuccessAction,
}: ApplicationWorkflowActionsProps) {
  const t = useTranslations("admin.applicationWorkflow");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    forwardMutation,
    requestRevisionMutation,
    rejectMutation: employeeRejectMutation,
  } = useEmployeeWorkflowMutations();

  const {
    acceptMutation,
    rejectMutation: headRejectMutation,
    returnToEmployeeMutation,
  } = useHeadWorkflowMutations();

  const isEmployee = role === userRoles.admissionEmployee || role === userRoles.admin;
  const isDepartmentHead = role === userRoles.departmentHead || role === userRoles.admin;

  const showEmployeeActions =
    isEmployee && (status === "under_review" || status === "returned_to_employee" || status === "submitted");
  const showDepartmentHeadActions =
    isDepartmentHead && status === "forwarded_to_department_head";

  async function handleEmployeeForward() {
    const res = await Swal.fire({
      title: t("confirmTitle"),
      text: t("confirmDescription"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await forwardMutation.mutateAsync({ id: applicationId });
      setNote("");
      await Swal.fire({ title: t("successTitle"), text: "تم تحويل الطلب بنجاح", icon: "success" });
      onSuccessAction?.();
    } catch (err) {
      await Swal.fire({ title: "خطأ", text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmployeeRequestRevision() {
    const res = await Swal.fire({
      title: t("confirmTitle"),
      text: t("confirmDescription"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await requestRevisionMutation.mutateAsync({ id: applicationId });
      setNote("");
      await Swal.fire({ title: t("successTitle"), text: "تم طلب التعديل من الطالب بنجاح", icon: "success" });
      onSuccessAction?.();
    } catch (err) {
      await Swal.fire({ title: "خطأ", text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmployeeReject() {
    if (!note.trim()) {
      await Swal.fire({ title: "سبب الرفض مطلوب", text: "يرجى كتابة سبب رفض الطلب", icon: "warning" });
      return;
    }
    const res = await Swal.fire({
      title: "تأكيد الرفض",
      text: "هل أنت تأكد من رفض هذا الطلب؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، ارفض",
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await employeeRejectMutation.mutateAsync({ id: applicationId, reason: note });
      setNote("");
      await Swal.fire({ title: t("successTitle"), text: "تم رفض الطلب بنجاح", icon: "success" });
      onSuccessAction?.();
    } catch (err) {
      await Swal.fire({ title: "خطأ", text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleHeadAccept() {
    const res = await Swal.fire({
      title: "تأكيد القبول",
      text: "هل أنت متأكد من قبول هذا الطلب؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "قبول",
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await acceptMutation.mutateAsync({ id: applicationId });
      setNote("");
      await Swal.fire({ title: t("successTitle"), text: "تم قبول الطلب بنجاح", icon: "success" });
      onSuccessAction?.();
    } catch (err) {
      await Swal.fire({ title: "خطأ", text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleHeadReject() {
    const res = await Swal.fire({
      title: "تأكيد الرفض",
      text: "هل أنت متأكد من رفض هذا الطلب؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "رفض",
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await headRejectMutation.mutateAsync({ id: applicationId });
      setNote("");
      await Swal.fire({ title: t("successTitle"), text: "تم رفض الطلب بنجاح", icon: "success" });
      onSuccessAction?.();
    } catch (err) {
      await Swal.fire({ title: "خطأ", text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleHeadReturnToEmployee() {
    const res = await Swal.fire({
      title: "تأكيد الإرجاع",
      text: "هل أنت متأكد من إرجاع الطلب لموظف القبول؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "إرجاع",
      cancelButtonText: t("cancel"),
    });
    if (!res.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await returnToEmployeeMutation.mutateAsync({ id: applicationId });
      setNote("");
      await Swal.fire({ title: t("successTitle"), text: "تم إرجاع الطلب للموظف بنجاح", icon: "success" });
      onSuccessAction?.();
    } catch (err) {
      await Swal.fire({ title: "خطأ", text: getApiErrorMessage(err), icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!showEmployeeActions && !showDepartmentHeadActions) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="text-xl font-bold text-primary">{t("actionsTitle")}</h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {showEmployeeActions
          ? t("employeeActionsDescription")
          : t("headActionsDescription")}
      </p>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={t("notePlaceholder")}
        disabled={isSubmitting}
        className="mt-5 min-h-[120px] w-full rounded-[18px] border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
      />

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {showEmployeeActions && (
          <>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleEmployeeForward}
              className="h-11 rounded-[16px] bg-secondary text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "تحويل لرئيس القسم"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleEmployeeRequestRevision}
              className="h-11 rounded-[16px] border border-warning/40 bg-warning/10 text-sm font-bold text-warning transition hover:bg-warning/15 disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "طلب إعادة الرفع / تعديل"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleEmployeeReject}
              className="h-11 rounded-[16px] bg-destructive text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "رفض الطلب"}
            </button>
          </>
        )}

        {showDepartmentHeadActions && (
          <>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleHeadAccept}
              className="h-11 rounded-[16px] bg-secondary text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "قبول الطلب"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleHeadReturnToEmployee}
              className="h-11 rounded-[16px] border border-warning/40 bg-warning/10 text-sm font-bold text-warning transition hover:bg-warning/15 disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "إرجاع للموظف"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleHeadReject}
              className="h-11 rounded-[16px] bg-destructive text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "رفض الطلب"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
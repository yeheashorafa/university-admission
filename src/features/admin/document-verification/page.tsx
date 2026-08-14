"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { DocumentVerificationHeader } from "./components/document-verification-header";
import { VerificationQueue } from "./components/verification-queue";
import { DocumentComparisonPanel } from "./components/document-comparison-panel";
import {
  type VerificationQueueItem,
  type VerificationStatus,
} from "./data/document-verification.data";
import {
  flattenPendingDocumentQueue,
  type RawBackendApplication,
} from "./utils/document-verification-filter";
import {
  useEmployeeApplicationsQuery,
  useEmployeeWorkflowMutations,
} from "@/hooks/queries/use-admin-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";

type AdminDocumentVerificationPageProps = {
  applicationId?: string;
};

export function AdminDocumentVerificationPage({
  applicationId,
}: AdminDocumentVerificationPageProps) {
  const t = useTranslations("admin");

  const { data: apiApplications, isLoading } = useEmployeeApplicationsQuery();
  const { verifyDocumentMutation, requestRevisionMutation } = useEmployeeWorkflowMutations();

  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

  const queue = useMemo<VerificationQueueItem[]>(() => {
    const list = Array.isArray(apiApplications) ? apiApplications : [];
    return flattenPendingDocumentQueue(list as RawBackendApplication[]);
  }, [apiApplications]);

  // Derived active item ID: user selection > route match > first queue item > empty
  const activeId = useMemo(() => {
    if (userSelectedId && queue.some((i) => i.id === userSelectedId)) {
      return userSelectedId;
    }
    if (applicationId) {
      const match = queue.find(
        (i) => i.id === applicationId || String(i.applicationId) === applicationId
      );
      if (match) return match.id;
    }
    return queue[0]?.id ?? "";
  }, [queue, userSelectedId, applicationId]);

  const activeItem = useMemo(() => {
    return queue.find((item) => item.id === activeId) ?? queue[0];
  }, [queue, activeId]);

  function handleSelectItem(itemId: string) {
    setUserSelectedId(itemId);
  }

  async function handleChangeStatus(status: VerificationStatus) {
    if (!activeItem) return;

    const confirmText =
      status === "approved"
        ? t("documentVerification.confirmApprove")
        : status === "rejected"
          ? t("documentVerification.confirmReject")
          : t("documentVerification.confirmReupload");

    const result = await Swal.fire({
      title: t("documentVerification.confirmActionTitle"),
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("documentVerification.confirm"),
      cancelButtonText: t("documentVerification.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      const docId = activeItem.documentId;
      const appId = activeItem.applicationId;

      if (!docId || !appId) {
        await Swal.fire({
          title: "خطأ",
          text: "تعذر تحديد رقم المستند أو الطلب من الخادم",
          icon: "error",
        });
        return;
      }

      if (status === "approved" || status === "rejected") {
        // Endpoint: POST /api/v1/admission_employee/documents/{document}/verify
        await verifyDocumentMutation.mutateAsync({
          documentId: docId,
          status: status === "approved" ? "verified" : "rejected",
          reviewNotes: "تم التدقيق عبر بوابة موظف القبول",
        });
      } else {
        // Endpoint: POST /api/v1/admission_employee/applications/{id}/request-revision
        await requestRevisionMutation.mutateAsync({ id: appId });
      }

      const successText =
        status === "approved"
          ? t("documentVerification.approvedSuccessfully")
          : status === "rejected"
            ? t("documentVerification.rejectedSuccessfully")
            : t("documentVerification.reuploadRequestedSuccessfully");

      await Swal.fire({
        title: t("documentVerification.successTitle"),
        text: successText,
        icon: "success",
        confirmButtonText: t("documentVerification.ok"),
      });
    } catch (err) {
      await Swal.fire({
        title: "خطأ في التدقيق",
        text: getApiErrorMessage(err),
        icon: "error",
      });
    }
  }

  async function handleSendNote() {
    if (!activeItem) return;

    const result = await Swal.fire({
      title: t("documentVerification.sendNoteToStudent"),
      input: "textarea",
      inputPlaceholder: t("documentVerification.notePlaceholder"),
      showCancelButton: true,
      confirmButtonText: t("documentVerification.send"),
      cancelButtonText: t("documentVerification.cancel"),
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      const appId = activeItem.applicationId;
      if (!appId) {
        await Swal.fire({
          title: "خطأ",
          text: "تعذر تحديد رقم المستند أو الطلب من الخادم",
          icon: "error",
        });
        return;
      }
      await requestRevisionMutation.mutateAsync({ id: appId });

      await Swal.fire({
        title: t("documentVerification.successTitle"),
        text: t("documentVerification.noteSentSuccessfully"),
        icon: "success",
        confirmButtonText: t("documentVerification.ok"),
      });
    } catch (err) {
      await Swal.fire({
        title: "خطأ",
        text: getApiErrorMessage(err),
        icon: "error",
      });
    }
  }

  return (
    <AdminLayout activePath={routes.adminDocumentVerification}>
      <div className="flex flex-col gap-8">
        <DocumentVerificationHeader />



        {isLoading ? (
          <div className="rounded-[28px] border border-border bg-card p-12 text-center text-muted-foreground">
            جاري تحميل قائمة تدقيق المستندات من الخادم...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <aside className="xl:col-span-4">
              <VerificationQueue
                queue={queue}
                activeId={activeId}
                onSelectItem={handleSelectItem}
              />
            </aside>

            <section className="xl:col-span-8">
              <DocumentComparisonPanel
                item={activeItem}
                onApprove={() => handleChangeStatus("approved")}
                onReject={() => handleChangeStatus("rejected")}
                onRequestReupload={() => handleChangeStatus("reupload_requested")}
                onSendNote={handleSendNote}
              />
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


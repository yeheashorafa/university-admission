"use client";

import { useLocale } from "next-intl";
import { Check, X, Eye, FileCheck } from "lucide-react";
import Swal from "sweetalert2";
import { useEmployeeWorkflowMutations } from "@/hooks/queries/use-admin-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { RawBackendDocument } from "../utils/document-verification-filter";

type StudentApplicationDocumentsTableProps = {
  applicationNo: string;
  studentName: string;
  documents?: RawBackendDocument[];
};

export function StudentApplicationDocumentsTable({
  applicationNo,
  studentName,
  documents = [],
}: StudentApplicationDocumentsTableProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { verifyDocumentMutation } = useEmployeeWorkflowMutations();

  async function handleVerify(docId: string | number, status: "verified" | "rejected") {
    const actionText = status === "verified" ? (isAr ? "قبول" : "approve") : (isAr ? "رفض" : "reject");
    const result = await Swal.fire({
      title: isAr ? `تأكيد ${actionText} المستند` : `Confirm Document ${actionText}`,
      text: isAr
        ? `هل أنت متأكد من ${actionText} هذا المستند؟`
        : `Are you sure you want to ${actionText} this document?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isAr ? "تأكيد" : "Confirm",
      cancelButtonText: isAr ? "إلغاء" : "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await verifyDocumentMutation.mutateAsync({
        documentId: docId,
        status,
        reviewNotes: status === "verified" ? "تم قبول المستند بواسطة موظف القبول" : "تم رفض المستند",
      });
      await Swal.fire({
        title: isAr ? "تمت العملية بنجاح" : "Success",
        text: isAr ? `تم ${actionText} المستند بنجاح.` : `Document has been ${status}.`,
        icon: "success",
      });
    } catch (err) {
      await Swal.fire({
        title: isAr ? "خطأ" : "Error",
        text: getApiErrorMessage(err),
        icon: "error",
      });
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
            <FileCheck className="size-6 text-secondary" />
            {isAr ? "مستندات الطالب المقدمة للطلب" : "Student Submitted Documents"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr
              ? `عرض كافة مستندات الطالب ${studentName} للطلب رقم ${applicationNo}`
              : `Review documents for ${studentName} (App No: ${applicationNo})`}
          </p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {isAr
            ? "لا توجد مستندات مرفقة مسجلة لهذا الطلب حتى الآن."
            : "No documents attached for this application yet."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground">
                <th className="p-3 text-start">{isAr ? "اسم المستند" : "Document Name"}</th>
                <th className="p-3 text-start">{isAr ? "اسم الملف والتاريخ" : "File & Date"}</th>
                <th className="p-3 text-start">{isAr ? "حالة المستند" : "Status"}</th>
                <th className="p-3 text-center">{isAr ? "إجراءات الموظف" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => {
                const docName =
                  doc.documentTypeName || doc.title || doc.name || doc.type || (isAr ? "مستند" : "Document");
                const fileName = doc.fileUrl || doc.file_path || "document.pdf";
                const uploadDate = doc.uploadedAt || doc.created_at || "—";
                const docStatus = doc.verification_status || doc.status || "pending";

                return (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="p-3 font-bold text-foreground">{docName}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      <p className="font-mono text-foreground">{fileName}</p>
                      <p className="mt-0.5">{uploadDate}</p>
                    </td>
                    <td className="p-3 text-xs font-bold">
                      <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary">
                        {docStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            Swal.fire({
                              title: docName,
                              text: `${isAr ? "معاينة الملف" : "Previewing"} ${fileName}`,
                              icon: "info",
                            })
                          }
                          className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title={isAr ? "معاينة المستند" : "Preview document"}
                        >
                          <Eye className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVerify(doc.id, "verified")}
                          className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-500/20"
                          title={isAr ? "قبول المستند" : "Approve"}
                        >
                          <Check className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVerify(doc.id, "rejected")}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive transition hover:bg-destructive/20"
                          title={isAr ? "رفض المستند" : "Reject"}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

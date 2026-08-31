"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  FilePlus,
  UploadCloud,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useDocumentTypesQuery } from "@/hooks/queries/use-public-catalog-queries";
import { useMyDocumentsQuery, useUploadDocumentMutation, useDeleteDocumentMutation } from "@/hooks/queries/use-documents-queries";
import { isVerificationError } from "@/lib/api/api-error";
import { isAccountVerificationBypassed } from "@/lib/auth-verification";

export function AdditionalDocumentsSection() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: documentTypes } = useDocumentTypesQuery();
  const { data: myDocs } = useMyDocumentsQuery();
  const uploadMutation = useUploadDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const [selectedTypeId, setSelectedTypeId] = useState<string | number>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      await Swal.fire({
        title: isAr ? "يرجى اختيار ملف" : "Please select a file",
        text: isAr
          ? "اختر ملف المستند المراد رفعه أولاً."
          : "Choose a document file to upload first.",
        icon: "warning",
        confirmButtonText: isAr ? "حسناً" : "OK",
      });
      return;
    }

    const typeIdToUse = selectedTypeId || documentTypes?.[0]?.id || 1;

    try {
      await uploadMutation.mutateAsync({
        documentType: String(typeIdToUse),
        file: selectedFile,
      });
      setSelectedFile(null);

      await Swal.fire({
        title: isAr ? "تم رفع المستند الإضافي" : "Additional Document Uploaded",
        text: isAr
          ? "تمت إضافة المستند بنجاح إلى ملفك في الخادم."
          : "The document has been uploaded to the backend successfully.",
        icon: "success",
        confirmButtonText: isAr ? "ممتاز" : "Great",
      });
    } catch (err: unknown) {
      const typedErr = err as { status?: number; message?: string };
      const status = typedErr?.status;
      const isVerification = isVerificationError(err);
      let errorMsg = typedErr?.message || (isAr ? "فشل في رفع المستند" : "Failed to upload document");

      if (status === 403) {
        if (isVerification && isAccountVerificationBypassed()) {
          errorMsg = isAr
            ? "الباك ما زال يطلب تفعيل الحساب، لذلك لا يمكن رفع المستند حاليًا."
            : "Backend still requires account verification, so the document cannot be uploaded right now.";
        } else {
          errorMsg = isAr
            ? "ليس لديك صلاحية لرفع هذا المستند."
            : "You do not have permission to upload this document.";
        }
      } else if (status === 422) {
        errorMsg = typedErr?.message || (isAr ? "بيانات غير صالحة" : "Invalid data");
      } else if (status === 413) {
        errorMsg = isAr ? "حجم الملف أكبر من المسموح." : "File size is too large.";
      } else if ((status ?? 0) >= 500 || !status) {
        errorMsg = isAr ? "تعذر رفع المستند. حاول مرة أخرى." : "Could not upload document. Try again.";
      }

      await Swal.fire({
        title: isAr ? "خطأ في الرفع" : "Upload Error",
        text: errorMsg,
        icon: "error",
        confirmButtonText: isAr ? "حسناً" : "OK",
      });
    }
  }

  async function handleRemove(docId: string | number) {
    const result = await Swal.fire({
      title: isAr ? "حذف المستند الإضافي؟" : "Remove Additional Document?",
      text: isAr
        ? "هل أنت تأكد من رغبتك في حذف هذا المستند؟"
        : "Are you sure you want to remove this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isAr ? "نعم، احذف" : "Yes, remove",
      cancelButtonText: isAr ? "إلغاء" : "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(String(docId));
      } catch {
        // Handled by react query error toast
      }
    }
  }

  const activeDocTypes = documentTypes || [
    { id: 1, name: "Other Document", display_name_ar: "مستند إضافي آخر", display_name_en: "Other Document" }
  ];

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-primary">
            <FilePlus className="size-6 text-secondary" />
            {isAr ? "مستندات إضافية (اختيارية)" : "Additional Documents (Optional)"}
          </h2>
          <p className="mt-1 leading-6 text-muted-foreground text-sm">
            {isAr
              ? "يمكنك رفع مستندات إضافية اختيارية لتوفير إثباتات داعمة لطلب القبول (مثل شهادة وفاة الأب، إثبات دخل الأسرة، أو تقرير طبي)."
              : "You can optionally upload supplementary documents to support your application (e.g. Father's Death Certificate, Family Income Proof, Medical Report)."}
          </p>
        </div>
        <span className="w-max rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
          {isAr ? "اختياري - غير إجباري" : "Optional"}
        </span>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <label className="mb-2 block text-xs font-bold text-foreground">
            {isAr ? "نوع المستند الإضافي" : "Document Type"}
          </label>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{isAr ? "-- اختر نوع المستند --" : "-- Select Document Type --"}</option>
            {activeDocTypes.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {isAr ? opt.display_name_ar || opt.name : opt.display_name_en || opt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-5">
          <label className="mb-2 block text-xs font-bold text-foreground">
            {isAr ? "اختر الملف (PDF / PNG / JPG)" : "Select File (PDF / PNG / JPG)"}
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="w-full rounded-xl border border-border bg-background p-1.5 text-xs text-muted-foreground file:me-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-primary hover:file:bg-primary/20"
          />
        </div>

        <div className="flex items-end lg:col-span-2">
          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            {isAr ? "رفع المستند" : "Upload"}
          </button>
        </div>
      </form>

      {/* Uploaded Optional Documents Table / List */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-bold text-primary">
          {isAr ? "المستندات المرفوعة في الخادم" : "Uploaded Documents"} ({myDocs?.length || 0})
        </h3>

        {(!myDocs || myDocs.length === 0) ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/40 p-5 text-center text-xs text-muted-foreground">
            {isAr
              ? "لم يتم رفع أي مستندات إضافية حتى الآن."
              : "No additional documents uploaded yet."}
          </p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-background">
            {myDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {doc.title || doc.documentTypeName || doc.type || `Document #${doc.id}`}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {doc.fileUrl || (doc.uploadedAt ? `Uploaded: ${doc.uploadedAt}` : "")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {doc.ai_check_status || (isAr ? "مرفوع" : "Uploaded")}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemove(doc.id)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
                    title={isAr ? "حذف المستند" : "Remove document"}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

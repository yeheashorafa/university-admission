"use client";

import { useLocale } from "next-intl";
import { Loader2, AlertTriangle, FileText, Upload, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { routes } from "@/constants/routes";
import { DocumentsHeader } from "./components/documents-header";
import { ListSkeleton } from "@/components/common/loading/list-skeleton";
import { PortalNavbar } from "../../components/layouts/portal-navbar";
import { UploadGuidelinesCard } from "./components/upload-guidelines-card";
import { DocumentsSubmitCard } from "./components/documents-submit-card";
import { AdditionalDocumentsSection } from "./components/additional-documents-section";
import { PortalFooter } from "../../components/layouts/portal-footer";
import { useMyDocumentsQuery, useUploadDocumentMutation, useDeleteDocumentMutation } from "@/hooks/queries/use-documents-queries";
import { useDocumentTypesQuery } from "@/hooks/queries/use-public-catalog-queries";
import { isVerificationError } from "@/lib/api/api-error";
import { isAccountVerificationBypassed } from "@/lib/auth-verification";

export function DocumentsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: myDocs, isLoading: loadingDocs, isError: docsError, error: docsErr, refetch } = useMyDocumentsQuery();
  const { data: docTypes, isLoading: loadingTypes } = useDocumentTypesQuery();

  const uploadMutation = useUploadDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const [selectedTypeId, setSelectedTypeId] = useState<string | number>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!selectedTypeId || !selectedFile) {
      toast.error(isAr ? "يرجى اختيار نوع المستند والملف" : "Please select document type and file");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        documentType: String(selectedTypeId),
        file: selectedFile,
      });
      toast.success(isAr ? "تم رفع المستند بنجاح" : "Document uploaded successfully");
      setSelectedFile(null);
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

      toast.error(errorMsg);
    }
  }

  async function handleDelete(docId: string | number) {
    try {
      await deleteMutation.mutateAsync(String(docId));
      toast.success(isAr ? "تم حذف المستند بنجاح" : "Document deleted successfully");
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || (isAr ? "فشل في حذف المستند" : "Failed to delete document");
      toast.error(errorMsg);
    }
  }

  const safeDocTypes = Array.isArray(docTypes) ? docTypes : [];
  const safeMyDocs = Array.isArray(myDocs) ? myDocs : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.documents} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        <DocumentsHeader />

        {loadingDocs || loadingTypes ? (
          <ListSkeleton items={5} />
        ) : docsError && isVerificationError(docsErr) && isAccountVerificationBypassed() ? (
          <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-6 text-center space-y-3 dark:border-amber-900/30 dark:bg-amber-950/20">
            <AlertTriangle className="size-8 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              {isAr ? "تعذر تحميل المستندات" : "Failed to load documents"}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              {isAr
                ? "الباك ما زال يطلب تفعيل الحساب. يرجى تفعيل التجاوز المؤقت من جهة الباك."
                : "Backend still requires account verification. Please ask the backend team to enable the temporary verification bypass."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : docsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center space-y-3">
            <AlertTriangle className="size-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-800">
              {isAr ? "فشل التعرف على مستندات الطالب" : "Failed to load documents"}
            </h3>
            <p className="text-xs text-red-600">
              {(docsErr as Error)?.message || (isAr ? "تعذر الاتصال بالخادم" : "Server connection error")}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="flex flex-col gap-6 lg:col-span-8">
              {/* Direct Upload Form */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-foreground">
                  {isAr ? "رفع مستند جديد" : "Upload New Document"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      {isAr ? "نوع المستند" : "Document Type"}
                    </label>
                    <select
                      value={selectedTypeId}
                      onChange={(e) => setSelectedTypeId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                    >
                      <option value="">{isAr ? "-- اختر نوع المستند --" : "-- Select Document Type --"}</option>
                      {safeDocTypes.map((dt) => {
                        const displayName = isAr
                          ? dt.display_name_ar || dt.name
                          : dt.display_name_en || dt.name;
                        const isReq = dt.is_required ?? dt.isRequired;

                        return (
                          <option key={dt.id} value={dt.id}>
                            {displayName} {isReq ? `(${isAr ? "مطلوب" : "Required"})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      {isAr ? "اختر الملف (PDF / JPG / PNG)" : "Choose File (PDF / JPG / PNG)"}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition disabled:opacity-50"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {isAr ? "رفع إلى الخادم" : "Upload to Backend"}
                </button>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground">
                  {isAr ? "المستندات المرفوعة حالياً" : "Currently Uploaded Documents"}
                </h3>

                {safeMyDocs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                    {isAr ? "لا توجد مستندات مرفوعة بعد." : "No uploaded documents found yet."}
                  </div>
                ) : (
                  safeMyDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="size-6 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {doc.title || doc.documentTypeName || doc.type || `Document #${doc.id}`}
                          </p>
                          <p className="text-2xs text-muted-foreground mt-0.5">
                            {doc.notes || doc.fileUrl || (doc.uploadedAt ? `Uploaded: ${doc.uploadedAt}` : "")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-2xs font-bold text-emerald-700">
                          <Check className="size-3" />
                          {doc.ai_check_status || "Uploaded"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-muted-foreground hover:text-red-600 transition"
                          title={isAr ? "حذف المستند" : "Delete document"}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <aside className="flex flex-col gap-6 lg:col-span-4">
              <UploadGuidelinesCard />
              <DocumentsSubmitCard />
            </aside>
          </div>
        )}

        <AdditionalDocumentsSection />
      </main>

      <PortalFooter />
    </div>
  );
}
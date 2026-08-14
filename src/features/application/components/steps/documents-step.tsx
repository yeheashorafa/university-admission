"use client";

import { useLocale } from "next-intl";
import { useState, useRef } from "react";
import { Upload, Check, AlertCircle, FileText, Loader2 } from "lucide-react";
import { useDocumentTypesQuery } from "@/hooks/queries/use-public-catalog-queries";
import { uploadDocument, attachDocumentToApplication } from "@/services/documents.service";
import { toast } from "sonner";
import type { ApplicationDocument } from "../../types/application-form.types";

type DocumentsStepProps = {
  documents: ApplicationDocument[];
  onChange: (updatedDocs: ApplicationDocument[]) => void;
  applicationId?: string | number | null;
};

export function DocumentsStep({ documents, onChange, applicationId }: DocumentsStepProps) {
  const locale = useLocale();
  const [loadingDocId, setLoadingDocId] = useState<string | number | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: documentTypes, isLoading: isLoadingTypes } = useDocumentTypesQuery();

  const activeDocTypes = Array.isArray(documentTypes) ? documentTypes : [];

  const handleFileSelect = async (
    docTypeId: string | number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingDocId(docTypeId);
    try {
      const uploadedDoc = await uploadDocument({
        file,
        document_type_id: docTypeId,
      });

      const uploadedDocId = uploadedDoc.id ?? (uploadedDoc as { id?: string | number }).id;

      if (applicationId) {
        // Strict: Do not swallow attach error
        await attachDocumentToApplication(applicationId, uploadedDocId);
      }

      const docTypeIdStr = String(docTypeId);
      const nextDocs = [...documents];
      const existingIdx = nextDocs.findIndex((d) => String(d.documentTypeId) === docTypeIdStr);

      const updatedItem: ApplicationDocument = {
        documentTypeId: docTypeIdStr,
        uploadedDocumentId: uploadedDocId,
        uploaded: true,
        pledge: false,
        fileName: file.name,
      };

      if (existingIdx >= 0) {
        nextDocs[existingIdx] = updatedItem;
      } else {
        nextDocs.push(updatedItem);
      }

      onChange(nextDocs);
      toast.success(locale === "ar" ? "تم رفع المستند وتأكيده بنجاح" : "Document uploaded and attached successfully");
    } catch (err) {
      const msg = (err as Error)?.message || (locale === "ar" ? "فشل رفع أومواصفة المستند" : "Failed to upload or attach document");
      toast.error(msg);
    } finally {
      setLoadingDocId(null);
    }
  };

  const handlePledgeToggle = (docTypeId: string | number) => {
    const docTypeIdStr = String(docTypeId);
    const nextDocs = [...documents];
    const existingIdx = nextDocs.findIndex((d) => String(d.documentTypeId) === docTypeIdStr);

    if (existingIdx >= 0) {
      const curr = nextDocs[existingIdx];
      const nextPledge = !curr.pledge;
      nextDocs[existingIdx] = {
        ...curr,
        pledge: nextPledge,
        uploaded: nextPledge ? false : curr.uploaded,
        fileName: nextPledge ? undefined : curr.fileName,
      };
    } else {
      nextDocs.push({
        documentTypeId: docTypeIdStr,
        uploaded: false,
        pledge: true,
      });
    }

    onChange(nextDocs);
  };

  const handlePledgeAll = () => {
    const nextDocs = activeDocTypes.map((dt) => {
      const existing = documents.find((d) => String(d.documentTypeId) === String(dt.id));
      if (existing?.uploaded) return existing;
      return {
        documentTypeId: String(dt.id),
        uploaded: false,
        pledge: true,
      };
    });
    onChange(nextDocs);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {locale === "ar" ? "8. المستندات والأوراق الثبوتية" : "8. Application Documents"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "ar"
              ? "يرجى رفع المستندات المطلوبة، أو اختيار التعهد بالرفع اللاحق لتأجيلها."
              : "Please upload the required files, or select the pledge option to submit later."}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePledgeAll}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-primary px-4 text-xs font-bold text-primary hover:bg-primary/5 transition shrink-0"
        >
          {locale === "ar" ? "تعهد بالرفع اللاحق للجميع" : "Pledge All Unuploaded"}
        </button>
      </div>

      {isLoadingTypes ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : activeDocTypes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-2">
          <AlertCircle className="size-8 text-muted-foreground mx-auto" />
          <p className="font-bold text-foreground text-sm">
            {locale === "ar"
              ? "لا تتوفر قائمة أنواع المستندات المطلوبة حالياً من الخادم."
              : "No document types available from the server currently."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-start font-bold text-muted-foreground w-1/2">
                    {locale === "ar" ? "اسم المستند" : "Document Name"}
                  </th>
                  <th className="p-4 text-start font-bold text-muted-foreground">
                    {locale === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="p-4 text-center font-bold text-muted-foreground">
                    {locale === "ar" ? "خيارات التعهد" : "Pledge Option"}
                  </th>
                  <th className="p-4 text-end font-bold text-muted-foreground">
                    {locale === "ar" ? "الإجراء" : "Action"}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {activeDocTypes.map((dt) => {
                  const docState = documents.find((d) => String(d.documentTypeId) === String(dt.id));
                  const isUploaded = !!docState?.uploaded;
                  const isPledged = !!docState?.pledge;
                  const isUploading = loadingDocId === dt.id;

                  const displayName =
                    locale === "ar"
                      ? dt.display_name_ar || dt.name
                      : dt.display_name_en || dt.name;

                  return (
                    <tr key={dt.id} className="hover:bg-muted/10 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-primary shrink-0" />
                          <div>
                            <span className="font-bold text-foreground block">
                              {displayName}
                            </span>
                            {docState?.fileName && (
                              <span className="text-xs text-muted-foreground block mt-0.5 font-mono">
                                {docState.fileName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {isUploaded ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                            <Check className="size-3.5" />
                            {locale === "ar" ? "مرفوع" : "Uploaded"}
                          </div>
                        ) : isPledged ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700 border border-yellow-200">
                            <AlertCircle className="size-3.5" />
                            {locale === "ar" ? "تعهد بالرفع" : "Pledge to upload"}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                            {dt.is_required
                              ? locale === "ar"
                                ? "مطلوب"
                                : "Required"
                              : locale === "ar"
                              ? "اختياري"
                              : "Optional"}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPledged}
                            onChange={() => handlePledgeToggle(dt.id)}
                            className="size-4 rounded text-primary border-border focus:ring-primary"
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            {locale === "ar" ? "تعهد بالرفع لاحقاً" : "Upload Later"}
                          </span>
                        </label>
                      </td>

                      <td className="p-4 text-end">
                        <input
                          ref={(el) => {
                            fileInputRefs.current[String(dt.id)] = el;
                          }}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleFileSelect(dt.id, e)}
                        />

                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRefs.current[String(dt.id)]?.click()}
                          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-bold transition ${
                            isUploaded
                              ? "bg-muted text-muted-foreground hover:bg-muted/80"
                              : "bg-primary text-primary-foreground hover:bg-primary/95"
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <span className="size-3.5 rounded-full border border-primary-foreground border-t-transparent animate-spin" />
                              {locale === "ar" ? "رفع..." : "Uploading..."}
                            </>
                          ) : (
                            <>
                              <Upload className="size-3.5" />
                              {isUploaded
                                ? locale === "ar"
                                  ? "تعديل الملف"
                                  : "Replace File"
                                : locale === "ar"
                                ? "رفع المستند"
                                : "Upload Document"}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pledge Banner Info */}
      <div className="flex gap-4 p-4 rounded-xl border border-yellow-100 bg-yellow-50/50">
        <AlertCircle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-yellow-800">
            {locale === "ar" ? "تعهد الالتزام برفع الأوراق والوثائق المطلوبة" : "Pledge of Commitment to Upload Required Documents"}
          </h4>
          <p className="text-xs text-yellow-700 leading-relaxed">
            {locale === "ar"
              ? "في حال عدم توفر بعض المستندات الثبوتية حالياً، يمكنك تفعيل خيار (تعهد بالرفع لاحقاً) لتخطي مرحلة الرفع مؤقتاً واستكمال تعبئة الطلب، على أن تلتزم برفعها في حسابك خلال مدة أقصاها أسبوعين من تاريخ تقديم الطلب."
              : "If some required certificates are not currently in your possession, check 'Upload Later' to bypass upload restrictions temporarily. You must commit to uploading them in your portal within 14 days."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import { useLocale } from "next-intl";
import { useState, useRef } from "react";
import { Camera, Upload, Check, AlertCircle } from "lucide-react";
import { useDocumentTypesQuery } from "@/hooks/queries/use-public-catalog-queries";
import { uploadDocument, attachDocumentToApplication } from "@/services/documents.service";
import { toast } from "sonner";

type PhotoStepProps = {
  photoUrl: string | null;
  onChange: (url: string | null) => void;
  applicationId?: string | number | null;
};

export function PhotoStep({ photoUrl, onChange, applicationId }: PhotoStepProps) {
  const locale = useLocale();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documentTypes } = useDocumentTypesQuery();

  const photoDocType = documentTypes?.find(
    (dt) =>
      dt.name.toLowerCase().includes("photo") ||
      dt.name.toLowerCase().includes("personal") ||
      dt.name.includes("صورة") ||
      dt.name.includes("شخصية")
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!photoDocType) {
      toast.error(
        locale === "ar"
          ? "نوع مستند الصورة الشخصية غير متوفر من الباكند حاليًا"
          : "Personal photo document type is currently not available from the backend"
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const doc = await uploadDocument({
        file,
        document_type_id: photoDocType.id,
        notes: "Personal Photo",
      });
      const uploadedDocId = doc.id ?? (doc as { id?: string | number }).id;

      if (applicationId && uploadedDocId) {
        await attachDocumentToApplication(applicationId, uploadedDocId);
      }

      onChange(doc.fileUrl || URL.createObjectURL(file));
      toast.success(
        locale === "ar" ? "تم رفع الصورة الشخصية وتأكيدها بنجاح" : "Personal photo uploaded and attached successfully"
      );
    } catch (err) {
      const msg = (err as Error)?.message || (locale === "ar" ? "فشل رفع الصورة" : "Photo upload failed");
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "7. تحميل الصورة الشخصية للطالب" : "7. Student Personal Photo"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى تحميل صورة شخصية حديثة للبطاقة الجامعية وسجلات القبول الرسمية."
            : "Please upload a recent personal photo for the university ID card and official logs."}
        </p>
      </div>

      {!photoDocType && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-bold shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-red-600" />
          <span>
            {locale === "ar"
              ? "نوع مستند الصورة الشخصية غير متوفر من الباكند حاليًا"
              : "Personal photo document type is currently not available from the backend"}
          </span>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-12 md:items-start">
        {/* Instructions */}
        <div className="space-y-4 md:col-span-7 bg-muted/40 p-6 rounded-2xl border border-border">
          <h4 className="font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="size-5 text-primary shrink-0" />
            {locale === "ar" ? "تعليمات وشروط الصورة الشخصية" : "Photo Guidelines & Requirements"}
          </h4>

          <ul className="space-y-2.5 text-sm text-muted-foreground list-disc ps-5 leading-relaxed">
            <li>
              {locale === "ar"
                ? "يجب أن تكون الصورة الشخصية واضحة وحديثة."
                : "The photo must be clear and recently taken."}
            </li>
            <li>
              {locale === "ar"
                ? "يفضل أن تكون خلفية الصورة بيضاء بالكامل."
                : "A solid white background is preferred."}
            </li>
            <li>
              {locale === "ar"
                ? "يجب أن يكون الوجه مقابلاً ومكشوفاً بالكامل ومرئياً بوضوح."
                : "The face must be centered, fully visible, and facing the camera."}
            </li>
            <li>
              {locale === "ar"
                ? "الحد الأقصى لحجم الملف هو 5 ميجابايت (صيغة JPG أو PNG)."
                : "Maximum file size is 5MB in JPG or PNG format."}
            </li>
          </ul>
        </div>

        {/* Upload Box */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 border border-border bg-card rounded-2xl shadow-sm space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="relative size-32 rounded-full border-4 border-muted bg-muted/20 overflow-hidden flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student Avatar"
                className="size-full object-cover"
              />
            ) : (
              <Camera className="size-12 text-muted-foreground" />
            )}
          </div>

          <div className="w-full space-y-2">
            {!photoUrl ? (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    {locale === "ar" ? "جاري الرفع..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    {locale === "ar" ? "اختر صورة شخصية" : "Select Personal Photo"}
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2 w-full">
                <div className="h-11 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center justify-center gap-2 text-sm font-bold">
                  <Check className="size-5" />
                  {locale === "ar" ? "تم تحديد الصورة" : "Photo selected"}
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full h-10 text-xs font-bold text-red-500 hover:underline"
                >
                  {locale === "ar" ? "حذف الصورة / تغيير" : "Delete Photo / Change"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bell,
  X,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes, withLocale } from "@/constants/routes";
import { useImportSecondarySchoolRecordsMutation } from "@/hooks/queries/use-admin-secondary-school-records-queries";
import { extractApiError } from "@/lib/api/api-error";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function AdminSecondarySchoolRecordsPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const importMutation = useImportSecondarySchoolRecordsMutation();

  function validateFile(file: File): boolean {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      const msg = t("invalidFileFormatOrSize");
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      const msg = t("invalidFileFormatOrSize");
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    }
    return true;
  }

  function handleFileSelect(file: File | null) {
    setErrorMessage(null);
    setIsSuccess(false);
    setSuccessMessage(null);

    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setErrorMessage(null);
    setIsSuccess(false);
    setSuccessMessage(null);

    try {
      const res = await importMutation.mutateAsync(selectedFile);
      const displayMsg = res?.message || t("fileReceivedProcessing");
      setSuccessMessage(displayMsg);
      setIsSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success(displayMsg);
    } catch (error: unknown) {
      const apiErr = extractApiError(error);
      if (apiErr.status === 403) {
        const msg = t("unauthorizedUpload");
        setErrorMessage(msg);
        toast.error(msg);
      } else if (apiErr.status === 422 || apiErr.errors?.file) {
        const msg = apiErr.errors?.file?.[0] || t("invalidFileFormatOrSize");
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        const msg = apiErr.message || t("invalidFileFormatOrSize");
        setErrorMessage(msg);
        toast.error(msg);
      }
    }
  }

  return (
    <AdminLayout activePath={routes.adminSecondarySchoolRecords}>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[0px_10px_35px_rgba(0,77,64,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileSpreadsheet className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary md:text-3xl">
                {t("tawjihiImportTitle")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("tawjihiImportDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Card (202 Response) */}
        {isSuccess && (
          <div className="space-y-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="size-8 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  {locale === "ar" ? "تم استلام الملف بنجاح!" : "File Received Successfully!"}
                </h3>
                <p className="text-sm leading-relaxed text-emerald-700 dark:text-emerald-400 font-semibold">
                  {successMessage || t("fileReceivedProcessing")}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={withLocale(locale, routes.adminNotifications)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-md"
              >
                <Bell className="size-4" />
                <span>{t("viewAdminNotifications")}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Upload Form Card */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[0px_10px_35px_rgba(0,77,64,0.05)] space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              isDragOver
                ? "border-primary bg-primary/10"
                : selectedFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <FileCheck className="size-7" />
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-foreground text-base">
                    {selectedFile.name}
                  </span>
                  <span className="block text-xs text-muted-foreground font-semibold">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline"
                >
                  <X className="size-4" />
                  <span>{locale === "ar" ? "إزالة الملف" : "Remove File"}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110">
                  <Upload className="size-7" />
                </div>
                <div>
                  <span className="block font-bold text-foreground text-base">
                    {t("dragDropOrClick")}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {t("fileFormatNotice")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || importMutation.isPending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-extrabold text-primary-foreground shadow-md transition hover:bg-primary/95 hover:shadow-lg disabled:opacity-50"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>{t("uploading")}</span>
                </>
              ) : (
                <>
                  <Upload className="size-5" />
                  <span>{t("uploadButton")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

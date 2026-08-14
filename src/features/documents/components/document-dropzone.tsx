"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, CloudUpload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentDropzoneProps = {
  onUploadComplete: (fileName: string) => void;
};

export function DocumentDropzone({ onUploadComplete }: DocumentDropzoneProps) {
  const t = useTranslations("documents");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  function handleFile(file?: File) {
    if (!file) return;

    setIsUploading(true);
    setIsUploaded(false);

    window.setTimeout(() => {
      setIsUploading(false);
      setIsUploaded(true);
      onUploadComplete(file.name);
    }, 900);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    handleFile(file);
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "cursor-pointer rounded-lg border-2 border-dashed border-border bg-card p-8 text-center transition hover:border-primary hover:bg-muted",
        isDragging && "border-primary bg-muted"
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleInputChange}
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center text-primary">
          <Loader2 className="mb-3 size-10 animate-spin" />
          <p className="text-lg font-bold">{t("uploadingFile")}</p>
        </div>
      ) : isUploaded ? (
        <div className="flex flex-col items-center justify-center text-primary">
          <CheckCircle2 className="mb-3 size-10" />
          <p className="text-lg font-bold">{t("uploadedSuccessfully")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pendingReview")}
          </p>
        </div>
      ) : (
        <>
          <CloudUpload className="mx-auto mb-3 size-10 text-muted-foreground" />

          <p className="text-lg font-bold text-foreground">
            {t("dragDropFile")}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("clickToChoose")}
          </p>

          <button
            type="button"
            className="mt-5 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {t("browseFiles")}
          </button>

          <p className="mt-4 text-xs text-muted-foreground">
            {t("supportedFormats")}
          </p>
        </>
      )}
    </div>
  );
}
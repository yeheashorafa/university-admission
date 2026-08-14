"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import type { VerificationQueueItem } from "../data/document-verification.data";

type DocumentViewerProps = {
  item: VerificationQueueItem;
};

export function DocumentViewer({ item }: DocumentViewerProps) {
  const t = useTranslations("admin");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <FileText className="size-5 text-secondary" />
        {t("documentVerification.uploadedDocument")}
      </h3>

      {item.fileUrl ? (
        <div className="relative flex min-h-[460px] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {item.fileUrl.toLowerCase().endsWith(".pdf") ? (
            <iframe src={item.fileUrl} className="h-full w-full min-h-[460px]" title={item.fileName} />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.fileUrl} alt={item.fileName} className="max-h-full max-w-full object-contain" />
            </>
          )}
        </div>
      ) : (
        <div className="relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-muted p-6 text-center">
          <FileText className="mb-4 size-10 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">معاينة الملف غير متاحة من الخادم</p>
        </div>
      )}
    </div>
  );
}
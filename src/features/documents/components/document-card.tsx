"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Badge,
  CheckCircle2,
  GraduationCap,
  RefreshCcw,
  Upload,
  UserCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentStatus, RequiredDocument } from "../data/documents.data";
import { DocumentDropzone } from "./document-dropzone";

type DocumentCardProps = {
  document: RequiredDocument;
};

const documentIconMap: Record<RequiredDocument["id"], LucideIcon> = {
  identity: Badge,
  "personal-photo": UserCircle2,
  "tawjihi-certificate": GraduationCap,
};

const statusConfig: Record<
  DocumentStatus,
  {
    labelKey: string;
    className: string;
    icon: LucideIcon;
  }
> = {
  checking: {
    labelKey: "checking",
    className: "bg-secondary/10 text-secondary",
    icon: RefreshCcw,
  },
  verified: {
    labelKey: "verified",
    className: "bg-primary/10 text-primary",
    icon: CheckCircle2,
  },
  needs_reupload: {
    labelKey: "needsReuploadFull",
    className: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

export function DocumentCard({ document }: DocumentCardProps) {
  const t = useTranslations("documents");
  const [status, setStatus] = useState<DocumentStatus>(document.status);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const Icon = documentIconMap[document.id];
  const statusItem = statusConfig[status];
  const StatusIcon = statusItem.icon;

  function handleUploadComplete(fileName: string) {
    setUploadedFileName(fileName);
    setStatus("checking");
  }

  const hasDropzone = status === "needs_reupload";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] transition hover:shadow-[0px_4px_20px_rgba(0,77,64,0.08)]",
        status === "needs_reupload" ? "border-destructive" : "border-border"
      )}
    >
      {status === "needs_reupload" && (
        <div className="absolute inset-y-0 start-0 w-1 bg-destructive" />
      )}

      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-lg",
              status === "needs_reupload"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-primary"
            )}
          >
            <Icon className="size-7" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">
                {t(`items.${document.id}.title`)}
              </h2>

              {document.required && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {t("required")}
                </span>
              )}
            </div>

            <p className="mt-2 leading-7 text-muted-foreground">
              {t(`items.${document.id}.description`)}
            </p>

            <div
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold",
                statusItem.className
              )}
            >
              <StatusIcon className="size-4" />
              {t(statusItem.labelKey)}
            </div>

            {uploadedFileName && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("uploadedFile")}:{" "}
                <span className="font-medium text-foreground">
                  {uploadedFileName}
                </span>
              </p>
            )}
          </div>
        </div>

        {status !== "needs_reupload" && (
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-36">
            {status === "checking" && (
              <button
                type="button"
                onClick={() => setStatus("needs_reupload")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 text-sm font-medium text-foreground transition hover:bg-muted/70"
              >
                <Upload className="size-4" />
                {t("reupload")}
              </button>
            )}

            <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {document.preview ? (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                  <Icon className="size-10 opacity-80" />
                </div>
              ) : (
                <Icon className="size-10 text-muted-foreground" />
              )}
            </div>
          </div>
        )}
      </div>

      {hasDropzone && (
        <div className="mt-6">
          <DocumentDropzone onUploadComplete={handleUploadComplete} />
        </div>
      )}
    </article>
  );
}
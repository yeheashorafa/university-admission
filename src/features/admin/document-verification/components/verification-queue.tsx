"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, FileText, PenLine, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  VerificationIssueType,
  VerificationQueueItem,
  VerificationStatus,
} from "../data/document-verification.data";

type VerificationQueueProps = {
  queue: VerificationQueueItem[];
  activeId: string;
  onSelectItem: (itemId: string) => void;
};

const issueIcon: Record<VerificationIssueType, React.ElementType> = {
  grade_mismatch: AlertTriangle,
  unclear_image: FileText,
  missing_signature: PenLine,
};

const statusConfig: Record<
  VerificationStatus,
  {
    labelKey: string;
    className: string;
  }
> = {
  pending: {
    labelKey: "documentVerification.status.pending",
    className: "bg-muted text-muted-foreground",
  },
  approved: {
    labelKey: "documentVerification.status.approved",
    className: "bg-primary/10 text-primary",
  },
  rejected: {
    labelKey: "documentVerification.status.rejected",
    className: "bg-destructive/10 text-destructive",
  },
  reupload_requested: {
    labelKey: "documentVerification.status.reupload_requested",
    className: "bg-secondary/10 text-secondary",
  },
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}

export function VerificationQueue({
  queue,
  activeId,
  onSelectItem,
}: VerificationQueueProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");

  const filteredQueue = useMemo(() => {
    const searchValue = normalizeSearchText(search);

    if (!searchValue) return queue;

    return queue.filter((item) => {
      const searchableText = normalizeSearchText(
        [
          item.applicationNo,
          t(`documentVerification.documents.${item.documentKey}`),
          t(`documentVerification.students.${item.studentKey}`),
          t(`documentVerification.issueLabels.${item.issueKey}`),
          t(`documentVerification.issues.${item.issueType}`),
          t(`documentVerification.status.${item.status}`),
        ].join(" "),
      );

      return searchableText.includes(searchValue);
    });
  }, [queue, search, t]);

  const pendingCount = queue.length;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-primary">
          {t("documentVerification.currentQueue")}
        </h2>

        <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-bold text-destructive">
          {t("documentVerification.documentsCount", { count: pendingCount })}
        </span>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("documentVerification.searchPlaceholder")}
          className="h-11 w-full rounded-lg border border-input bg-card px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredQueue.map((item) => {
          const Icon = issueIcon[item.issueType];
          const isActive = item.id === activeId;
          const status = statusConfig[item.status];
          const documentTitle =
            item.documentTypeName ||
            t(`documentVerification.documents.${item.documentKey}`);
          const studentName =
            item.studentName ||
            t(`documentVerification.students.${item.studentKey}`);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className={cn(
                "relative w-full overflow-hidden rounded-lg border p-4 text-start transition hover:bg-muted",
                isActive
                  ? "border-secondary bg-secondary/10"
                  : "border-border bg-card",
              )}
            >
              {isActive && (
                <div className="absolute inset-y-0 start-0 w-1 bg-primary" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground">{documentTitle}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("documentVerification.applicationNo", {
                      number: item.applicationNo,
                    })}
                  </p>
                </div>

                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    item.issueType === "grade_mismatch"
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {studentName}
                </span>

                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-bold",
                    item.issueType === "grade_mismatch"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {t(`documentVerification.issues.${item.issueType}`)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-1 text-xs font-bold",
                    status.className,
                  )}
                >
                  {t(status.labelKey)}
                </span>

              </div>
            </button>
          );
        })}

        {filteredQueue.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {search.trim() !== ""
                ? t("documentVerification.noResultsDescription")
                : t("documentVerification.noPendingDocuments")}
            </p>
            {search.trim() !== "" && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-bold text-primary underline hover:text-primary/80"
              >
                {t("documentVerification.clearSearch")}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

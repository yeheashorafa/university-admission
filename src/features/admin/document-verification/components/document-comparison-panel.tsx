"use client";

import { useTranslations } from "next-intl";
import { Maximize2 } from "lucide-react";
import type { VerificationQueueItem } from "../data/document-verification.data";
import type { RawBackendDocument } from "../utils/document-verification-filter";
import { DocumentViewer } from "./document-viewer";
import { ExtractedDataPanel } from "./extracted-data-panel";
import { VerificationActionFooter } from "./verification-action-footer";
import { AiVerificationSummaryCard } from "./ai-verification-summary-card";
import { StudentApplicationDocumentsTable } from "./student-application-documents-table";

type DocumentComparisonPanelProps = {
  item?: VerificationQueueItem;
  onApprove: () => void;
  onReject: () => void;
  onRequestReupload: () => void;
  onSendNote: () => void;
};

export function DocumentComparisonPanel({
  item,
  onApprove,
  onReject,
  onRequestReupload,
  onSendNote,
}: DocumentComparisonPanelProps) {
  const t = useTranslations("admin");

  if (!item) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        {t("documentVerification.noDocumentSelected")}
      </section>
    );
  }

  const studentNameStr = item.studentName || t(`documentVerification.students.${item.studentKey}`);
  const documentNameStr = item.documentTypeName || t(`documentVerification.documents.${item.documentKey}`);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
        <div className="flex flex-col justify-between gap-4 border-b border-border bg-muted p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {documentNameStr}
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {studentNameStr} ·{" "}
              {t("documentVerification.applicationNo", {
                number: item.applicationNo,
              })}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-max items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-primary transition hover:bg-background"
          >
            <Maximize2 className="size-4" />
            {t("documentVerification.zoom")}
          </button>
        </div>

        <div className="space-y-6 p-6">
          <AiVerificationSummaryCard item={item} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DocumentViewer item={item} />

            <ExtractedDataPanel fields={item.extractedFields ?? []} />
          </div>
        </div>

        <VerificationActionFooter
          status={item.status}
          onApprove={onApprove}
          onReject={onReject}
          onRequestReupload={onRequestReupload}
          onSendNote={onSendNote}
        />
      </section>

      {/* Student Uploaded Documents Verification Table */}
      <StudentApplicationDocumentsTable
        applicationNo={item.applicationNo}
        studentName={studentNameStr}
        documents={
          Array.isArray((item.rawApplication as { documents?: unknown })?.documents)
            ? ((item.rawApplication as { documents?: RawBackendDocument[] }).documents ?? [])
            : []
        }
      />
    </div>
  );
}
"use client";

import { useTranslations } from "next-intl";
import { Check, MessageSquare, RotateCcw, X } from "lucide-react";
import type { VerificationStatus } from "../data/document-verification.data";

type VerificationActionFooterProps = {
  status: VerificationStatus;
  onApprove: () => void;
  onReject: () => void;
  onRequestReupload: () => void;
  onSendNote: () => void;
};

export function VerificationActionFooter({
  status,
  onApprove,
  onReject,
  onRequestReupload,
  onSendNote,
}: VerificationActionFooterProps) {
  const t = useTranslations("admin");
  const isFinal = status === "approved" || status === "rejected";

  return (
    <div className="flex flex-col justify-between gap-4 border-t border-border bg-muted p-5 md:flex-row md:items-center">
      <button
        type="button"
        onClick={onSendNote}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-primary transition hover:bg-card"
      >
        <MessageSquare className="size-5" />
        {t("documentVerification.sendNoteToStudent")}
      </button>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRequestReupload}
          disabled={isFinal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-secondary px-5 text-sm font-bold text-secondary transition hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="size-5" />
          {t("documentVerification.requestReupload")}
        </button>

        <button
          type="button"
          onClick={onReject}
          disabled={isFinal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-destructive px-5 text-sm font-bold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X className="size-5" />
          {t("documentVerification.rejectDocument")}
        </button>

        <button
          type="button"
          onClick={onApprove}
          disabled={isFinal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="size-5" />
          {t("documentVerification.approveAndUpdate")}
        </button>
      </div>
    </div>
  );
}
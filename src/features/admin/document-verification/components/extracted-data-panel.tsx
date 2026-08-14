"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Code2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractedField } from "../data/document-verification.data";

type ExtractedDataPanelProps = {
  fields: ExtractedField[];
};

export function ExtractedDataPanel({ fields = [] }: ExtractedDataPanelProps) {
  const t = useTranslations("admin");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Code2 className="size-5 text-secondary" />
        {t("documentVerification.extractedDataTitle")}
      </h3>

      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted p-6 text-center">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              PENDING_AI_DETAILS
            </span>
            <p className="text-sm font-semibold">
              بيانات المستند المستخرجة آلياً غير متوفرة من الخادم حالياً
            </p>
          </div>
        ) : (
          fields.map((field) => (
            <ExtractedFieldCard key={field.id} field={field} />
          ))
        )}
      </div>
    </div>
  );
}

type ExtractedFieldCardProps = {
  field: ExtractedField;
};

function ExtractedFieldCard({ field }: ExtractedFieldCardProps) {
  const t = useTranslations("admin");
  const [correctedValue, setCorrectedValue] = useState(
    field.correctedValue ?? ""
  );

  if (field.status === "mismatch") {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-destructive">
            {t(`documentVerification.fields.${field.id}`)}
          </p>

          <XCircle className="size-5 text-destructive" />
        </div>

        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <ValueBox
            label={t("documentVerification.extractedFromImage")}
            value={field.extractedValue}
            error
          />

          <span className="text-center text-muted-foreground">→</span>

          <ValueBox
            label={t("documentVerification.submittedInApplication")}
            value={field.submittedValue}
          />
        </div>

        <input
          type="text"
          value={correctedValue}
          onChange={(event) => setCorrectedValue(event.target.value)}
          placeholder={t("documentVerification.correctValuePlaceholder")}
          className="mt-4 h-11 w-full rounded-lg border border-input bg-card px-3 text-center outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    );
  }

  if (field.status === "missing") {
    return (
      <div className="rounded-lg border border-warning bg-warning/10 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-warning">
            {t(`documentVerification.fields.${field.id}`)}
          </p>

          <XCircle className="size-5 text-warning" />
        </div>

        <ValueBox
          label={t("documentVerification.submittedInApplication")}
          value={field.submittedValue ?? "-"}
        />

        <input
          type="text"
          value={correctedValue}
          onChange={(event) => setCorrectedValue(event.target.value)}
          placeholder={t("documentVerification.correctValuePlaceholder")}
          className="mt-4 h-11 w-full rounded-lg border border-input bg-card px-3 text-center outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {t(`documentVerification.fields.${field.id}`)}
        </p>

        <CheckCircle2 className="size-5 text-primary" />
      </div>

      <p className="text-lg font-semibold text-foreground">
        {field.extractedValue}
      </p>
    </div>
  );
}

type ValueBoxProps = {
  label: string;
  value?: string;
  error?: boolean;
};

function ValueBox({ label, value, error }: ValueBoxProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>

      <p
        className={cn(
          "text-lg font-bold",
          error ? "text-destructive line-through" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}
"use client";

import { useTranslations } from "next-intl";
import { Check, Lightbulb } from "lucide-react";
import { uploadGuidelines } from "../data/documents.data";

export function UploadGuidelinesCard() {
  const t = useTranslations("documents");

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="size-6 text-primary" />

        <h2 className="text-xl font-bold text-primary">
          {t("guidelinesTitle")}
        </h2>
      </div>

      <ul className="space-y-4">
        {uploadGuidelines.map((_, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="mt-1 size-4 shrink-0 text-secondary" />

            <span className="leading-7 text-muted-foreground">
              {t(`guidelines.${index}`)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
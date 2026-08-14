"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AiRecommendation,
  RiskLevel,
  VerificationQueueItem,
} from "../data/document-verification.data";

type AiVerificationSummaryCardProps = {
  item: VerificationQueueItem;
};

const recommendationConfig: Record<
  AiRecommendation,
  {
    icon: LucideIcon;
    className: string;
  }
> = {
  auto_approved: {
    icon: CheckCircle2,
    className: "border-secondary/30 bg-secondary/10 text-secondary",
  },
  manual_review: {
    icon: AlertTriangle,
    className: "border-warning/40 bg-warning/10 text-warning",
  },
  auto_rejected: {
    icon: XCircle,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

const riskConfig: Record<RiskLevel, string> = {
  low: "bg-secondary/10 text-secondary",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

export function AiVerificationSummaryCard({
  item,
}: AiVerificationSummaryCardProps) {
  const t = useTranslations("admin");

  if (!item.recommendation || !item.riskLevel) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
        <div className="flex items-center gap-2 text-xl font-bold text-primary">
          <Bot className="size-6 text-secondary" />
          {t("documentVerification.aiSummaryTitle")}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">PENDING_AI_DETAILS</p>
            <p className="mt-1 text-xs">
              تفاصيل ورأي التدقيق الآلي ومستوى المخاطر غير متوفرة من الخادم لهذا المستند حالياً.
            </p>
          </div>
        </div>

        {item.uploadedAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("documentVerification.uploadedAt", { date: item.uploadedAt })}
          </p>
        )}
      </section>
    );
  }

  const config = recommendationConfig[item.recommendation];
  const Icon = config.icon;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-primary">
            <Bot className="size-6 text-secondary" />
            {t("documentVerification.aiSummaryTitle")}
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("documentVerification.aiSummaryDescription")}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
            riskConfig[item.riskLevel]
          )}
        >
          <ShieldAlert className="size-4" />
          {t(`documentVerification.risk.${item.riskLevel}`)}
        </span>
      </div>

      <div className={cn("rounded-xl border p-4", config.className)}>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-card/70">
            <Icon className="size-6" />
          </div>

          <div>
            <p className="font-extrabold">
              {t(`documentVerification.recommendations.${item.recommendation}.title`)}
            </p>

            <p className="mt-1 text-sm leading-6">
              {t(
                `documentVerification.recommendations.${item.recommendation}.description`
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {t("documentVerification.uploadedAt", { date: item.uploadedAt })}
      </p>
    </section>
  );
}

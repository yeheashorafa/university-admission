"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import { applicationStatuses } from "@/constants/application-workflow";

type Props = {
  application?: WorkflowApplication;
};

export function PaymentStatusCard({ application }: Props) {
  const t = useTranslations("payment");

  const isPaid =
    application?.paymentReference ||
    application?.currentStatus === applicationStatuses.completed ||
    application?.currentStatus === applicationStatuses.socialResearchRequired;

  const isFailed = application?.currentStatus === applicationStatuses.paymentFailed;

  if (isPaid) {
    return (
      <section className="rounded-xl border p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] border-primary/20 bg-primary/10 text-primary">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card/70">
            <CheckCircle2 className="size-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("paymentCompleted")}</h2>
            <p className="mt-2 max-w-2xl leading-7">
              {t("paymentCompletedDescription")}
            </p>
            {application?.paymentReference && (
              <p className="mt-2 text-xs font-mono font-extrabold">
                {t("reference")}: {application.paymentReference}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (isFailed) {
    return (
      <section className="rounded-xl border p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] border-destructive/20 bg-destructive/10 text-destructive">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card/70">
            <XCircle className="size-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("paymentFailed")}</h2>
            <p className="mt-2 max-w-2xl leading-7">
              {t("paymentFailedDescription")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card/70">
          <Clock3 className="size-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t("paymentPending")}</h2>
          <p className="mt-2 max-w-2xl leading-7">
            {t("paymentPendingDescription")}
          </p>
          {application && (
            <p className="mt-2 text-xs font-bold">
              {application.applicationNo} - {application.selectedProgram} ({application.faculty})
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
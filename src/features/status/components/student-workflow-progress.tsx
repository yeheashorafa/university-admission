"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import { studentStatusSteps } from "../constants/student-status-steps";
import {
  getActiveStepIndex,
  getStepState,
  isRejectedStatus,
} from "../utils/student-status-workflow";

type StudentWorkflowProgressProps = {
  application: WorkflowApplication;
};

export function StudentWorkflowProgress({
  application,
}: StudentWorkflowProgressProps) {
  const t = useTranslations("studentStatusWorkflow");

  const activeIndex = getActiveStepIndex(application.currentStatus);
  const isRejected = isRejectedStatus(application.currentStatus);

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary">{t("progressTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("progressDescription")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {studentStatusSteps.map((step, index) => {
          const Icon = step.icon;

          const state = getStepState({
            index,
            activeIndex,
            isRejected,
          });

          return (
            <div
              key={step.key}
              className={cn(
                "rounded-[20px] border p-4 transition",
                state === "done" &&
                  "border-secondary/30 bg-secondary/10 text-secondary",
                state === "active" &&
                  "border-primary/40 bg-primary/10 text-primary",
                state === "rejected" &&
                  "border-destructive/30 bg-destructive/10 text-destructive",
                state === "pending" &&
                  "border-border bg-background text-muted-foreground"
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[14px]",
                    state === "done" && "bg-secondary/15",
                    state === "active" && "bg-primary/15",
                    state === "rejected" && "bg-destructive/15",
                    state === "pending" && "bg-muted"
                  )}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="size-5" />
                  ) : state === "rejected" ? (
                    <XCircle className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>

                <span className="text-xs font-bold">
                  {index + 1}/{studentStatusSteps.length}
                </span>
              </div>

              <p className="font-bold text-foreground">
                {t(`steps.${step.key}.title`)}
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(`steps.${step.key}.description`)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
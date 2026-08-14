"use client";

import { useTranslations } from "next-intl";
import {
  Bot,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  IdCard,
  UserCheck,
  UserCog,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ApplicationStatus,
  ApplicationWorkflowLog,
  WorkflowActor,
} from "@/constants/application-workflow";
import { isRejectedStatus } from "../utils/student-status-workflow";

type StudentWorkflowTimelineProps = {
  logs: ApplicationWorkflowLog[];
  currentStatus: ApplicationStatus;
};

const actorIcons: Record<WorkflowActor, typeof FileText> = {
  student: FileText,
  ai: Bot,
  admission_employee: UserCog,
  department_head: UserCheck,
  payment_system: CircleDollarSign,
  system: IdCard,
};

export function StudentWorkflowTimeline({
  logs,
  currentStatus,
}: StudentWorkflowTimelineProps) {
  const t = useTranslations("studentStatusWorkflow");
  const workflowT = useTranslations("admin.applicationWorkflow");

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary">{t("timelineTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("timelineDescription")}
        </p>
      </div>

      <div className="mb-6 rounded-[20px] border border-border bg-background p-4">
        <p className="text-sm text-muted-foreground">{t("currentStatus")}</p>
        <p className="mt-1 font-bold text-primary">
          {workflowT(`statuses.${currentStatus}`)}
        </p>
      </div>

      <div className="relative space-y-6 border-s-2 border-border ps-6">
        {logs.map((log) => {
          const Icon = actorIcons[log.actor];
          const isRejected = isRejectedStatus(log.status);

          return (
            <div key={log.id} className="relative">
              <div
                className={cn(
                  "absolute -start-[37px] top-0 flex size-10 items-center justify-center rounded-full border-4 border-card",
                  isRejected
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                {isRejected ? (
                  <XCircle className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>

              <div className="rounded-[20px] border border-border bg-background p-4">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                  <div>
                    <p className="font-bold text-foreground">
                      {workflowT(`statuses.${log.status}`)}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {workflowT(`actors.${log.actor}`)}
                      {log.actorName ? ` - ${log.actorName}` : ""}
                    </p>
                  </div>

                  <span className="text-xs font-medium text-muted-foreground">
                    {log.createdAt}
                  </span>
                </div>

                {log.note && (
                  <p className="mt-3 rounded-[14px] bg-muted p-3 text-sm leading-6 text-muted-foreground">
                    {log.note}
                  </p>
                )}

                {log.decision && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <CheckCircle2 className="size-4" />
                    {workflowT(`decisions.${log.decision}`)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Plus, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgramOption } from "../data/application.data";

type ProgramOptionRowProps = {
  program: ProgramOption;
  isSelected: boolean;
  onAdd: () => void;
};

export function ProgramOptionRow({
  program,
  isSelected,
  onAdd,
}: ProgramOptionRowProps) {
  const t = useTranslations("application");
  const Icon = program.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition",
        program.eligible && "hover:bg-muted",
        !program.eligible && "cursor-not-allowed opacity-70"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            program.eligible
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-5" />
        </div>

        <div>
          <h3 className="font-bold text-foreground">
            {t(`programOptions.${program.id}.title`)}
          </h3>

          <p className="text-sm text-muted-foreground">
            {t(`programOptions.${program.id}.faculty`)}
            {program.minimumRate
              ? ` • ${t("minimumRate")} ${program.minimumRate}%`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {program.eligible ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <CheckCircle2 className="size-4" />
            {t("eligible")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            <XCircle className="size-4" />
            {t("notEligible")}
          </span>
        )}

        {program.eligible && (
          <button
            type="button"
            onClick={onAdd}
            disabled={isSelected}
            className="flex size-9 items-center justify-center rounded-full border border-secondary text-secondary transition hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
            aria-label={t("addProgram", {
              program: t(`programOptions.${program.id}.title`),
            })}
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import type { ProgramOption } from "../data/application.data";

type SelectedPreferencesCardProps = {
  selectedPrograms: ProgramOption[];
  onRemove: (programId: string) => void;
  onMove: (programId: string, direction: "up" | "down") => void;
};

export function SelectedPreferencesCard({
  selectedPrograms,
  onRemove,
  onMove,
}: SelectedPreferencesCardProps) {
  const t = useTranslations("application");

  return (
    <section className="sticky top-6 rounded-xl border border-border bg-card p-6">
      <h2 className="mb-2 text-xl font-bold text-primary">
        {t("selectedPreferences")}
      </h2>

      <p className="mb-6 text-sm leading-6 text-muted-foreground">
        {t("selectedPreferencesDescription")}
      </p>

      <div className="flex min-h-[220px] flex-col gap-3">
        {selectedPrograms.map((program, index) => (
          <div
            key={program.id}
            className="rounded-lg border border-border bg-muted p-4"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="size-5 shrink-0 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">
                  {index + 1}. {t(`programOptions.${program.id}.title`)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t(`programOptions.${program.id}.faculty`)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(program.id, "up")}
                  disabled={index === 0}
                  className="rounded-md p-1 text-muted-foreground transition hover:bg-card hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={t("moveUp")}
                >
                  <ArrowUp className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onMove(program.id, "down")}
                  disabled={index === selectedPrograms.length - 1}
                  className="rounded-md p-1 text-muted-foreground transition hover:bg-card hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={t("moveDown")}
                >
                  <ArrowDown className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(program.id)}
                  className="rounded-md p-1 text-destructive transition hover:bg-destructive/10"
                  aria-label={t("removeProgram", {
                    program: t(`programOptions.${program.id}.title`),
                  })}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {Array.from({ length: Math.max(0, 3 - selectedPrograms.length) }).map(
          (_, index) => (
            <div
              key={index}
              className="flex h-[70px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-sm text-muted-foreground"
            >
              {t("emptyPreferenceSlot")}
            </div>
          )
        )}
      </div>
    </section>
  );
}
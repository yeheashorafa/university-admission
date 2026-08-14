"use client";

import { useTranslations } from "next-intl";
import { BookOpen, Clock, Layers, Percent } from "lucide-react";
import type { ProgramViewModel } from "../../types";

type ProgramInfoCardsProps = {
  program: ProgramViewModel;
};

export function ProgramInfoCards({ program }: ProgramInfoCardsProps) {
  const t = useTranslations("programsDetails");

  const safeBranches = Array.isArray(program?.branches)
    ? program.branches
    : typeof program?.branches === "string"
    ? [program.branches]
    : [];

  const cards = [
    ...(program.durationYears
      ? [
          {
            label: t("duration"),
            value: `${program.durationYears} ${t("years")}`,
            icon: Clock,
          },
        ]
      : []),
    ...(program.degree
      ? [
          {
            label: t("degree"),
            value: program.degree,
            icon: BookOpen,
          },
        ]
      : []),
    {
      label: t("minimumRate"),
      value: `${program.minimumAverage}%`,
      icon: Percent,
    },
    ...(safeBranches.length > 0
      ? [
          {
            label: t("branches"),
            value: safeBranches.join(" / "),
            icon: Layers,
          },
        ]
      : []),
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]"
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-6" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {card.label}
            </p>

            <p className="mt-1 text-lg font-bold text-foreground">
              {card.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
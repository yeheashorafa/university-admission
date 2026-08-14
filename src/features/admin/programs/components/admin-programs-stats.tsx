"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, CheckCircle2, LockKeyhole, Users } from "lucide-react";
import type { AdminProgram } from "../data/admin-programs.data";

const icons = [BookOpen, CheckCircle2, LockKeyhole, Users];

type AdminProgramsStatsProps = {
  programs: AdminProgram[];
};

export function AdminProgramsStats({ programs }: AdminProgramsStatsProps) {
  const t = useTranslations("admin");

  const stats = useMemo(() => {
    const totalPrograms = programs.length;
    const activePrograms = programs.filter(
      (program) => program.status === "active"
    ).length;
    const closedPrograms = programs.filter(
      (program) => program.status === "closed"
    ).length;
    const totalCapacity = programs.reduce(
      (sum, program) => sum + program.capacity,
      0
    );

    return [
      {
        key: "totalPrograms",
        value: totalPrograms.toLocaleString(),
      },
      {
        key: "activePrograms",
        value: activePrograms.toLocaleString(),
      },
      {
        key: "closedPrograms",
        value: closedPrograms.toLocaleString(),
      },
      {
        key: "totalCapacity",
        value: totalCapacity.toLocaleString(),
      },
    ];
  }, [programs]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index];

        return (
          <article
            key={stat.key}
            className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-6" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {t(`programs.stats.${stat.key}`)}
            </p>

            <p className="mt-1 text-3xl font-bold text-primary">
              {stat.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
"use client";

import { useTranslations } from "next-intl";
import type { ProgramViewModel } from "../../types";

type ProgramContentSectionsProps = {
  program: ProgramViewModel;
};

export function ProgramContentSections({ program }: ProgramContentSectionsProps) {
  const t = useTranslations("programsDetails");
  const safeBranches = Array.isArray(program?.branches)
    ? program.branches
    : typeof program?.branches === "string"
    ? [program.branches]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {program.description && (
        <ContentCard title={t("programOverview")}>
          <p className="leading-8 text-muted-foreground">
            {program.description}
          </p>
        </ContentCard>
      )}

      {safeBranches.length > 0 && (
        <ContentCard title={t("branches")}>
          <div className="flex flex-wrap gap-2">
            {safeBranches.map((branch) => (
              <span
                key={branch}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
              >
                {branch}
              </span>
            ))}
          </div>
        </ContentCard>
      )}
    </div>
  );
}

type ContentCardProps = {
  title: string;
  children: React.ReactNode;
};

function ContentCard({ title, children }: ContentCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 border-b border-border pb-4 text-xl font-bold text-primary">
        {title}
      </h2>

      {children}
    </section>
  );
}
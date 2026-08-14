"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Archive, CheckCircle2, FileText, PencilLine } from "lucide-react";
import type { LegalPolicy } from "../data/legal-policies.data";

const icons = [FileText, CheckCircle2, PencilLine, Archive];

type LegalPolicyStatsProps = {
  policies: LegalPolicy[];
};

export function LegalPolicyStats({ policies }: LegalPolicyStatsProps) {
  const t = useTranslations("admin");

  const stats = useMemo(() => {
    return [
      {
        key: "totalPolicies",
        value: policies.length.toLocaleString(),
      },
      {
        key: "published",
        value: policies
          .filter((policy) => policy.status === "published")
          .length.toLocaleString(),
      },
      {
        key: "drafts",
        value: policies
          .filter((policy) => policy.status === "draft")
          .length.toLocaleString(),
      },
      {
        key: "archived",
        value: policies
          .filter((policy) => policy.status === "archived")
          .length.toLocaleString(),
      },
    ];
  }, [policies]);

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
              {t(`legalPolicies.stats.${stat.key}`)}
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
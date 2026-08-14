"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Clock3, ShieldCheck, UserCheck, Users } from "lucide-react";
import type { AuthUser } from "@/services/auth.service";

const icons = [Users, ShieldCheck, UserCheck, Clock3];

type UsersStatsProps = {
  users: AuthUser[];
};

export function UsersStats({ users }: UsersStatsProps) {
  const t = useTranslations("admin");

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeStaff = users.filter(
      (user) => user.role !== "student"
    ).length;
    const studentAccounts = users.filter((user) => user.role === "student").length;
    const pendingAccounts = 0; // removed status check

    return [
      {
        key: "totalUsers",
        value: totalUsers.toLocaleString(),
      },
      {
        key: "activeStaff",
        value: activeStaff.toLocaleString(),
      },
      {
        key: "studentAccounts",
        value: studentAccounts.toLocaleString(),
      },
      {
        key: "pendingAccounts",
        value: pendingAccounts.toLocaleString(),
      },
    ];
  }, [users]);

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
              {t(`users.stats.${stat.key}`)}
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
"use client";

import { useTranslations } from "next-intl";
import { Edit, Power, PowerOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AcademicBranch,
  AdminProgram,
  AdminProgramStatus,
} from "../data/admin-programs.data";

type AdminProgramsTableRowProps = {
  program: AdminProgram;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
};

const statusConfig: Record<
  AdminProgramStatus,
  {
    labelKey: string;
    className: string;
  }
> = {
  active: {
    labelKey: "programs.statuses.active",
    className: "bg-primary/10 text-primary",
  },
  inactive: {
    labelKey: "programs.statuses.inactive",
    className: "bg-muted text-muted-foreground",
  },
  closed: {
    labelKey: "programs.statuses.closed",
    className: "bg-destructive/10 text-destructive",
  },
};

const branchConfig: Record<
  AcademicBranch,
  {
    labelKey: string;
    className: string;
  }
> = {
  scientific: {
    labelKey: "programs.branches.scientific",
    className: "bg-secondary/10 text-secondary",
  },
  literary: {
    labelKey: "programs.branches.literary",
    className: "bg-accent/40 text-accent-foreground",
  },
  industrial: {
    labelKey: "programs.branches.industrial",
    className: "bg-primary/10 text-primary",
  },
};

export function AdminProgramsTableRow({
  program,
  onEdit,
  onDelete,
  onToggleStatus,
}: AdminProgramsTableRowProps) {
  const t = useTranslations("admin");
  const status = statusConfig[program.status];

  return (
    <tr className="group transition hover:bg-muted/60">
      <td className="px-5 py-4">
        <div>
          <p className="font-bold text-foreground">{program.title}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {program.faculty}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {t("programs.degreeBachelor")} · {program.duration}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {program.branches.map((branch) => {
            const config = branchConfig[branch];

            return (
              <span
                key={branch}
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-bold",
                  config.className
                )}
              >
                {t(config.labelKey)}
              </span>
            );
          })}
        </div>
      </td>

      <td className="px-5 py-4 text-center">
        <span className="font-bold text-primary">{program.minimumRate}%</span>
      </td>

      <td className="px-5 py-4 text-center">
        <span className="font-semibold text-foreground">
          {program.capacity}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <span className="font-semibold text-foreground">
          {program.applicationsCount}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <span className="font-semibold text-foreground">
          {program.acceptedCount}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-bold",
            status.className
          )}
        >
          {t(status.labelKey)}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            title={t("programs.editProgram")}
            className="rounded-lg p-2 text-primary transition hover:bg-primary/10"
          >
            <Edit className="size-5" />
          </button>

          <button
            type="button"
            onClick={onToggleStatus}
            title={
              program.status === "active"
                ? t("programs.disableProgram")
                : t("programs.enableProgram")
            }
            className={cn(
              "rounded-lg p-2 transition",
              program.status === "active"
                ? "text-destructive hover:bg-destructive/10"
                : "text-primary hover:bg-primary/10"
            )}
          >
            {program.status === "active" ? (
              <PowerOff className="size-5" />
            ) : (
              <Power className="size-5" />
            )}
          </button>

          <button
            type="button"
            onClick={onDelete}
            title={t("programs.deleteProgram")}
            className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
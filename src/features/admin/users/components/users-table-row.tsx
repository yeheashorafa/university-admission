"use client";

import { useTranslations } from "next-intl";
import {
  Edit,
  Shield,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser, UserRole } from "@/services/auth.service";
import { userRoles } from "@/constants/roles";

type UsersTableRowProps = {
  user: AuthUser;
  onEdit: () => void;
  onDelete: () => void;
};

const roleConfig: Record<
  UserRole,
  {
    label: string;
    className: string;
  }
> = {
  [userRoles.admin]: {
    label: "Admin",
    className: "bg-destructive/10 text-destructive",
  },
  [userRoles.admissionDean]: {
    label: "Admission Dean",
    className: "bg-primary/10 text-primary",
  },
  [userRoles.departmentHead]: {
    label: "Department Head",
    className: "bg-secondary/10 text-secondary",
  },
  [userRoles.admissionEmployee]: {
    label: "Admission Employee",
    className: "bg-accent/40 text-accent-foreground",
  },
  [userRoles.student]: {
    label: "Student",
    className: "bg-muted text-muted-foreground",
  },
};

export function UsersTableRow({
  user,
  onEdit,
  onDelete,
}: UsersTableRowProps) {
  const t = useTranslations("admin");



  const role = roleConfig[user.role] || roleConfig.student;

  return (
    <tr className="group transition hover:bg-muted/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCircle2 className="size-6" />
          </div>

          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
            role.className
          )}
        >
          <Shield className="size-4" />
          {role.label}
        </span>
      </td>

      <td className="px-5 py-4 text-center text-sm text-muted-foreground">
        —
      </td>

      <td className="px-5 py-4 text-sm text-muted-foreground">
        -
      </td>

      <td className="px-5 py-4 text-sm text-muted-foreground">
        -
      </td>

      <td className="px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            title={t("users.editUser")}
            className="rounded-lg p-2 text-secondary transition hover:bg-secondary/10"
          >
            <Edit className="size-5" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title={t("users.deleteUser")}
            className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
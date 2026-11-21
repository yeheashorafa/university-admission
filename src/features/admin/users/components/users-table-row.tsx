"use client";

import { useTranslations } from "next-intl";
import {
  Edit,
  KeyRound,
  Shield,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser, UserRole } from "@/services/auth.service";
import { userRoles } from "@/constants/roles";

type UsersTableRowProps = {
  user: AuthUser;
  onResetPassword: () => void;
  onEdit: () => void;
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
    label: "Faculty Head",
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
  onResetPassword,
  onEdit,
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
          {user.role !== userRoles.student && user.role !== userRoles.admin && (
            <button type="button" onClick={onResetPassword} aria-label={t("users.resetStaffPassword")} className="rounded-lg p-2 text-secondary transition hover:bg-secondary/10">
              <KeyRound className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            title={t("users.editUser")}
            className="rounded-lg p-2 text-secondary transition hover:bg-secondary/10"
          >
            <Edit className="size-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

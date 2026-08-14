"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Eye, EyeOff } from "lucide-react";
import { AdminCustomSelect } from "@/components/ui/admin-custom-select";
import type { AuthUser, UserRole } from "@/services/auth.service";
import type { AdminUserPayload } from "@/services/admin-users.service";
import { userRoles } from "@/constants/roles";

type UserFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  user?: AuthUser | null;
  onClose: () => void;
  onSubmit: (user: AdminUserPayload, id?: string | number) => void;
};

const roles: UserRole[] = [
  userRoles.student,
  userRoles.admissionEmployee,
  userRoles.departmentHead,
  userRoles.admissionDean,
  userRoles.admin,
];

export function UserFormModal({
  open,
  mode,
  user,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  if (!open) return null;

  return (
    <UserFormModalContent
      key={`${mode}-${user?.id ?? "new"}`}
      mode={mode}
      user={user}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

type UserFormModalContentProps = {
  mode: "create" | "edit";
  user?: AuthUser | null;
  onClose: () => void;
  onSubmit: (payload: AdminUserPayload, id?: string | number) => void;
};

function UserFormModalContent({
  mode,
  user,
  onClose,
  onSubmit,
}: UserFormModalContentProps) {
  const t = useTranslations("admin");

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? userRoles.student);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: AdminUserPayload = {
      name,
      email,
      phone,
      roles: [role],
    };

    if (password) {
      payload.password = password;
    }

    onSubmit(payload, user?.id);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === "create" ? t("users.createUser") : t("users.updateUser")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("users.userFormDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 p-6">
          <FormField label={t("users.form.name")}>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </FormField>

          <FormField label={t("users.form.email")}>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </FormField>

          <FormField label="Phone Number">
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </FormField>

          {(mode === "create" || password.length > 0) ? (
            <FormField label={t("users.form.password") || "Password"}>
              <div className="relative">
                <input
                  required={mode === "create"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "edit" ? "Leave empty to keep current" : ""}
                  className="h-12 w-full rounded-xl border border-border bg-card px-4 pe-11 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 end-3 flex items-center text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </FormField>
          ) : (
            <FormField label={t("users.form.password") || "Password"}>
               <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Leave empty to keep current"
                  className="h-12 w-full rounded-xl border border-border bg-card px-4 pe-11 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 end-3 flex items-center text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </FormField>
          )}

          <div className="grid gap-5">
            <AdminCustomSelect
              id="role"
              label={t("users.form.role")}
              value={role}
              onChange={(value) => setRole(value as UserRole)}
              options={roles.map((item) => ({
                value: item,
                label: item,
              }))}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {t("users.cancel")}
            </button>

            <button
              type="submit"
              className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {mode === "create" ? t("users.create") : t("users.save")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
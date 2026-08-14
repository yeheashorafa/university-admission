"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/reset-password.schema";
import { routes, withLocale } from "@/constants/routes";

export function ResetPasswordForm() {
  const locale = useLocale();
  const t = useTranslations("auth");

  const [isDone, setIsDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  function onSubmit(values: ResetPasswordFormValues) {
    void values;
    setIsDone(true);
  }

  return (
    <main className="z-10 flex w-full flex-1 flex-col justify-center overflow-y-auto bg-card px-4 py-8 shadow-[-4px_0_12px_rgba(0,0,0,0.04)] md:w-1/2 md:px-10 lg:w-5/12">
      <div className="mx-auto w-full max-w-md">
        {!isDone ? (
          <>
            <div className="mb-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Building2 className="size-6" />
              </div>

              <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
                {t("resetPasswordTitle")}
              </h1>

              <p className="leading-7 text-muted-foreground">
                {t("resetPasswordDescription")}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  {t("newPassword")}
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-lg border border-input bg-card px-4 pe-12 ps-10 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="passwordConfirmation"
                  className="text-sm font-medium text-foreground"
                >
                  {t("confirmPassword")}
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-lg border border-input bg-card px-4 pe-12 ps-10 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    {...register("passwordConfirmation")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordConfirmation((current) => !current)
                    }
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                     aria-label={
                      showPasswordConfirmation
                        ? t("hidePassword")
                        : t("showPassword")
                    }
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>

                {errors.passwordConfirmation && (
                  <p className="text-sm text-destructive">
                    {errors.passwordConfirmation.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{t("saveNewPassword")}</span>
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                 {t("rememberPassword")}{" "}
                  <Link
                    href={withLocale(locale, routes.login)}
                    className="font-bold text-primary hover:underline"
                  >
                    {t("login")}
                  </Link>
                </p>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm">
              <CheckCircle2 className="size-10" />
            </div>

            <h1 className="mb-3 text-3xl font-bold text-primary">
              {t("passwordUpdated")}
            </h1>

            <p className="mb-8 leading-7 text-muted-foreground">
              {t("passwordUpdatedDescription")}
            </p>

            <Link
              href={withLocale(locale, routes.login)}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              {t("signInNow")}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
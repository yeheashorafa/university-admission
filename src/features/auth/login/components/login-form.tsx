"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, Mail, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { routes, withLocale } from "@/constants/routes";
import { extractApiError, getApiErrorMessage } from "@/lib/api/api-error";
import { useAuthStore } from "@/stores/auth.store";
import { useLocale, useTranslations } from "next-intl";
import { SubmitHandler } from "@/lib/utils";
import { getDashboardRouteByRole } from "@/constants/role-navigation";


export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function redirectByRole(role: string) {
    const targetRoute = getDashboardRouteByRole(role);
    router.replace(withLocale(locale, targetRoute));
  }



  async function handleSubmit(event: SubmitHandler) {
    event.preventDefault();
    setFormError(null);

    if (!email || !password) {
      const missingMsg = t("emailPasswordRequired");
      setFormError(missingMsg);
      toast.error(missingMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login({
        email,
        password,
      });

      toast.success(t("loggedInSuccessfully"));
      redirectByRole(user.role);
    } catch (error) {
      const apiError = extractApiError(error);
      const errorMessage =
        apiError.status === 401
          ? locale === "ar"
            ? "بيانات الدخول غير صحيحة"
            : "Invalid email or password"
          : getApiErrorMessage(error);

      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full rounded-[28px] border border-border bg-card p-6 shadow-[0px_10px_35px_rgba(118,188,33,0.08)] md:p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-primary">{t("loginTitle")}</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("loginShortDescription")}
        </p>
      </div>




      {formError && (
        <div className="mb-6 flex items-center gap-3 rounded-[18px] border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("emailAddress")}
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email address"
              className="h-12 w-full rounded-[16px] border border-input bg-card px-4 ps-10 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground"
            >
              {t("password")}
            </label>

            <Link
              href={withLocale(locale, routes.forgotPassword)}
              className="text-sm font-bold text-secondary transition hover:text-secondary/80"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 w-full rounded-[16px] border border-input bg-card px-4 pe-11 ps-10 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              aria-label={t("togglePasswordVisibility")}
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {t("signingIn")}
            </>
          ) : (
            <>
              <LogIn className="size-5" />
              {t("loginTitle")}
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("dontHaveAccount")}{" "}
        <Link
          href={withLocale(locale, routes.register)}
          className="font-bold text-secondary transition hover:text-secondary/80"
        >
          {t("createAccount")}
        </Link>
      </p>
    </section>
  );
}

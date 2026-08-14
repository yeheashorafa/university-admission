"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { routes, withLocale } from "@/constants/routes";
import { forgotPassword } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { SubmitHandler } from "@/lib/utils";

export function ForgotPasswordForm() {
  const locale = useLocale();
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitHandler) {
    event.preventDefault();

    if (!email) {
      toast.error(t("emailPasswordRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      toast.success(t("resetLinkSent"));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-[0px_8px_30px_rgba(0,77,64,0.08)] md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {t("forgotPasswordTitle")}
        </h1>

        <p className="mt-3 leading-7 text-muted-foreground">
          {t("forgotPasswordDescription")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
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
              placeholder="student@example.com"
              className="h-12 w-full rounded-lg border border-input bg-card px-4 ps-10 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {t("sending")}
            </>
          ) : (
            t("sendResetLink")
          )}
        </button>
      </form>

      <Link
        href={withLocale(locale, routes.login)}
        className="mt-6 inline-flex text-sm font-bold text-secondary transition hover:text-secondary/80"
      >
        {t("backToLogin")}
      </Link>
    </section>
  );
}

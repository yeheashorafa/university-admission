"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { verifyEmailLink } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api/api-error";

export function VerifyEmailContent() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = searchParams.get("id") ?? searchParams.get("user");
    const hash = searchParams.get("hash") ?? "";

    if (!id || !hash) {
      setStatus("error");
      setMessage(
        locale === "ar"
          ? "رابط التحقق غير صالح"
          : "Invalid verification link"
      );
      return;
    }

    verifyEmailLink(id, hash)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getApiErrorMessage(err));
      });
  }, [searchParams, locale]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 size-10 animate-spin text-primary" />
            <h1 className="text-xl font-bold text-primary">
              {t("verifyingEmail")}
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 size-12 text-primary" />
            <h1 className="text-xl font-bold text-primary">
              {t("emailVerified")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("emailVerifiedDescription")}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 size-12 text-destructive" />
            <h1 className="text-xl font-bold text-destructive">
              {t("emailVerifyFailed")}
            </h1>
            {message && (
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            )}
          </>
        )}

        <Link
          href={withLocale(locale, routes.login)}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          {t("login")}
        </Link>
      </div>
    </main>
  );
}

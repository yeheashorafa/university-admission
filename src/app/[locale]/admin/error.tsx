"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { AlertTriangle, LayoutDashboard, RefreshCcw } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

type AdminErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground md:ps-72">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-4 py-10 md:px-10">
        <section className="w-full max-w-3xl rounded-2xl border border-border bg-card p-8 text-center shadow-[0px_8px_30px_rgba(0,77,64,0.08)] md:p-12">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-11" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-destructive">
            Admin Error
          </p>

          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            We could not load this admin page
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">
            An unexpected error occurred while loading admin data. Please try
            again or return to the admin dashboard.
          </p>

          {error.digest && (
            <p className="mt-4 rounded-lg border border-border bg-muted px-4 py-3 font-mono text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              <RefreshCcw className="size-5" />
              Try Again
            </button>

            <Link
              href={withLocale(locale, routes.admin)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-6 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              <LayoutDashboard className="size-5" />
              Admin Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
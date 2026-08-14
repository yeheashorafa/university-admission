"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextLocale = locale === "ar" ? "en" : "ar";

  const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, "");
  const nextPathname = `/${nextLocale}${pathnameWithoutLocale || ""}`;

  const queryString = searchParams.toString();
  const href = queryString ? `${nextPathname}?${queryString}` : nextPathname;

  return (
    <Link
      href={href}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-bold uppercase text-primary transition hover:bg-muted"
      aria-label="Change language"
    >
      {nextLocale.toUpperCase()}
    </Link>
  );
}
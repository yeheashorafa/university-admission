"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { routes, withLocale } from "@/constants/routes";
import { clearCurrentAuth, useCurrentAuth } from "@/hooks/use-current-auth";
import { cn } from "@/lib/utils";
import { IugLogo } from "@/components/shared/iug-logo";
import { getAdminNavigationItems } from "@/constants/admin-navigation";

type AdminSidebarProps = {
  activePath?: string;
};

export function AdminSidebar({ activePath = routes.admin }: AdminSidebarProps) {
  const router = useRouter();
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const { user } = useCurrentAuth();
  const navigationItems = getAdminNavigationItems(user?.role);
  const t = useTranslations("admin");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function handleLogout() {
    clearCurrentAuth();
    setMobileOpen(false);
    setAccountOpen(false);
    router.push(withLocale(locale, routes.login));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed start-4 top-4 z-50 inline-flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label={tCommon("accessibility.closeSidebar")}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-e border-border bg-card transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : (locale === "ar" ? "translate-x-full" : "-translate-x-full"),
        )}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href={withLocale(locale, routes.admin)}
              onClick={() => setMobileOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="border-b border-border p-5">
                <IugLogo />
              </div>

              {/* <div className="min-w-0">
                <p className="truncate font-bold text-primary">
                  {tNav("adminPortal")}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {tCommon("admissionPortalBrand")}
                </p>
              </div> */}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>

            {user && (
              <div className="relative ">
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-2 text-foreground transition hover:bg-muted"
                >
                  <UserCircle2 className="size-5 text-primary" />

                  <div className="hidden max-w-[120px] text-start xl:block">
                    <p className="truncate text-xs font-bold leading-4 text-primary">
                      {user.name}
                    </p>
                    <p className="truncate text-[11px] font-medium uppercase leading-4 text-muted-foreground">
                      {user.role}
                    </p>
                  </div>

                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 left-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-[0px_12px_40px_rgba(0,0,0,0.12)]">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-bold text-primary">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase text-secondary">
                        {user.role}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <LogOut className="size-5" />
                        {tCommon("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="mt-4 flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === routes.admin
                ? activePath === routes.admin
                : activePath === item.href || activePath.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={withLocale(locale, item.href)}
                className={cn(
                  "flex items-center gap-3 mx-4 rounded-[16px] px-4 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-primary",
                )}
              >
                <Icon className="size-5" />
                {t(`sidebar.${item.labelKey}`)}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

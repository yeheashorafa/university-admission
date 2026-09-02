"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserCircle2,
  UserPlus,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { useLogout } from "@/hooks/use-logout";
import { getAccessToken, getStoredUser } from "@/lib/api/auth-token";
import type { AuthUser } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import { IugLogo } from "@/components/shared/iug-logo";
import { isAdminRole, isStudentRole } from "@/constants/roles";
import { useAuthStore } from "@/stores/auth.store";
import { useMyNotificationsQuery } from "@/hooks/queries/use-notifications-queries";
import { getNotificationTitle } from "@/services/notifications.service";
import {
  getLogoRouteByRole,
  getUserDropdownItemsByRole,
} from "@/constants/role-navigation";

type PortalNavbarProps = {
  activePath?: string;
};

export function PortalNavbar({ activePath = routes.home }: PortalNavbarProps) {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");

  const storeToken = useAuthStore((state) => state.token);
  const storeUser = useAuthStore((state) => state.user);
  const storeRole = useAuthStore((state) => state.role);

  const { user: currentAuthUser, role: currentAuthRole, isAuthenticated: currentAuthIsAuth, isHydrated } = useCurrentAuth();

  const effectiveToken = isHydrated
    ? storeToken || (currentAuthIsAuth ? "valid" : null) || getAccessToken()
    : null;

  const effectiveUser = isHydrated
    ? storeUser || currentAuthUser || getStoredUser<AuthUser>()
    : null;

  const user = effectiveUser;
  const role = storeRole || currentAuthRole || effectiveUser?.role || null;

  const isAuthenticated = Boolean(effectiveToken && effectiveUser);
  const isGuest = !isAuthenticated;
  const isAdmin = isAuthenticated && isAdminRole(role);
  const isStudent = isAuthenticated && isStudentRole(role);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        setAccountMenuOpen(false);
      } else {
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
        setStudentMenuOpen(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);


  const logout = useLogout();

  async function handleLogout() {
    setMobileOpen(false);
    setStudentMenuOpen(false);
    setAccountMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
    await logout();
  }

  const mainNavItems = [
    {
      label: tCommon("home"),
      href: routes.home,
    },
    {
      label: tCommon("faculties"),
      href: routes.faculties,
    },
  ];

  const studentMenuItems = [
    {
      label: tCommon("dashboard"),
      href: routes.dashboard,
      icon: LayoutDashboard,
    },
    {
      label: locale === "ar" ? "طلباتي" : "My Applications",
      href: routes.applications,
      icon: FileText,
    },
    {
      label: locale === "ar" ? "تقديم طلب جديد" : "Submit New Application",
      href: routes.newApplication,
      icon: UserPlus,
    },
    {
      label: tCommon("documents"),
      href: routes.documents,
      icon: FileCheck2,
    },
    {
      label: locale === "ar" ? "الإشعارات" : "Notifications",
      href: routes.notifications,
      icon: Bell,
    },
    {
      label: locale === "ar" ? "تتبع الطلب" : "Application Status",
      href: routes.status,
      icon: CheckCircle2,
    },
    {
      label: tCommon("profile"),
      href: routes.profile,
      icon: UserCircle2,
    },
  ];

  const accountItems = [
    {
      label: tCommon("login"),
      href: routes.login,
      icon: LogIn,
    },
    {
      label: tCommon("createStudentAccount"),
      href: routes.register,
      icon: UserPlus,
    },
  ];

  const isStudentMenuActive = studentMenuItems.some(
    (item) => item.href === activePath
  );

  const isAccountMenuActive = accountItems.some(
    (item) => item.href === activePath
  );

  const { data: userNotifications } = useMyNotificationsQuery(undefined, {
    enabled: Boolean(isAuthenticated && isStudent && effectiveToken),
  });
  const unreadCount = userNotifications?.filter((n) => !n.readAt && !n.read_at)?.length ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="app-container flex h-16 items-center justify-between gap-4">
        <Link
          href={withLocale(
            locale,
            getLogoRouteByRole(isAuthenticated ? role : null)
          )}
          className="flex items-center gap-3"
        >
          <IugLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={withLocale(locale, item.href)}
              label={item.label}
              active={activePath === item.href}
            />
          ))}

          {isStudent && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setStudentMenuOpen((current) => !current);
                  setAccountMenuOpen(false);
                  setUserDropdownOpen(false);
                  setNotificationsOpen(false);
                }}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold transition",
                  isStudentMenuActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tNav("studentMenu")}
                <ChevronDown className="size-4" />
              </button>

              {studentMenuOpen && (
                <DropdownMenu
                  title={tNav("studentPagesTitle")}
                  subtitle={tNav("studentPagesSubtitle")}
                >
                  {studentMenuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <DropdownLink
                        key={item.href}
                        href={withLocale(locale, item.href)}
                        label={item.label}
                        icon={Icon}
                        active={activePath === item.href}
                        onClick={() => setStudentMenuOpen(false)}
                      />
                    );
                  })}
                </DropdownMenu>
              )}
            </div>
          )}

          {isAdmin && (
            <NavLink
              href={withLocale(locale, routes.admin)}
              label={tNav("adminPanel")}
              active={activePath === routes.admin}
            />
          )}

          {isGuest && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen((current) => !current);
                  setStudentMenuOpen(false);
                  setUserDropdownOpen(false);
                  setNotificationsOpen(false);
                }}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold transition",
                  isAccountMenuActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tNav("account")}
                <ChevronDown className="size-4" />
              </button>

              {accountMenuOpen && (
                <DropdownMenu
                  title={tNav("account")}
                  subtitle={tNav("accountSubtitle")}
                >
                  {accountItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <DropdownLink
                        key={item.href}
                        href={withLocale(locale, item.href)}
                        label={item.label}
                        icon={Icon}
                        active={activePath === item.href}
                        onClick={() => setAccountMenuOpen(false)}
                      />
                    );
                  })}
                </DropdownMenu>
              )}
            </div>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isStudent && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((current) => !current);
                  setAccountMenuOpen(false);
                  setStudentMenuOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="relative inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-border bg-card px-3 text-foreground transition hover:bg-muted"
                aria-label={tCommon("notifications")}
              >
                <Bell className="size-5 text-primary" />

                {unreadCount > 0 && (
                  <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute end-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-[0px_12px_40px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-bold text-primary">
                      {tCommon("notifications")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {locale === "ar"
                        ? "آخر التحديثات على طلبك"
                        : "Latest updates about your application"}
                    </p>
                  </div>

                  <div className="divide-y divide-border max-h-64 overflow-y-auto">
                    {Array.isArray(userNotifications) &&
                    userNotifications.length > 0 ? (
                      userNotifications.slice(0, 3).map((notification) => (
                        <Link
                          key={notification.id}
                          href={withLocale(locale, routes.notifications)}
                          onClick={() => setNotificationsOpen(false)}
                          className="block px-4 py-3 transition hover:bg-muted"
                        >
                          <div className="mb-1 flex items-start justify-between gap-3">
                            <p className="text-sm font-bold text-foreground">
                              {getNotificationTitle(
                                notification,
                                locale === "ar"
                              )}
                            </p>

                            {(notification.createdAt ||
                              notification.created_at) && (
                              <span className="shrink-0 text-[10px] text-muted-foreground font-mono">
                                {notification.createdAt ||
                                  notification.created_at}
                              </span>
                            )}
                          </div>

                          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {notification.message}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                        {locale === "ar"
                          ? "لا توجد إشعارات حالياً."
                          : "No notifications available."}
                      </div>
                    )}
                  </div>

                  <Link
                    href={withLocale(locale, routes.notifications)}
                    onClick={() => setNotificationsOpen(false)}
                    className="flex h-11 items-center justify-center border-t border-border text-sm font-bold text-primary transition hover:bg-muted"
                  >
                    {locale === "ar"
                      ? "عرض كل الإشعارات"
                      : "View all notifications"}
                  </Link>
                </div>
              )}
            </div>
          )}

          <LanguageToggle />
          <ThemeToggle />

          {isAuthenticated && user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen((current) => !current);
                  setAccountMenuOpen(false);
                  setStudentMenuOpen(false);
                  setNotificationsOpen(false);
                }}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={tNav("accountMenu")}
              >
                <UserCircle2 className="size-6 text-primary" />
              </button>

              {userDropdownOpen && (
                <div className="absolute end-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-[0px_12px_40px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-border bg-muted/30 px-4 py-3">
                    <p className="truncate text-sm font-bold text-primary">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <span className="mt-1.5 inline-block rounded-full bg-secondary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-secondary">
                      {role}
                    </span>
                  </div>

                  <div className="p-2 space-y-1">
                    {getUserDropdownItemsByRole(role, locale).map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownLink
                          key={item.href}
                          href={withLocale(locale, item.href)}
                          label={item.label}
                          icon={Icon}
                          active={activePath === item.href}
                          onClick={() => setUserDropdownOpen(false)}
                        />
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
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

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="app-container py-4">
            {isAuthenticated && user && (
              <div className="mb-4 rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <UserCircle2 className="size-6 text-primary" />

                  <div>
                    <p className="font-bold text-primary">{user.name}</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs font-bold uppercase text-secondary mt-0.5">
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {mainNavItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={withLocale(locale, item.href)}
                  label={item.label}
                  active={activePath === item.href}
                  onClick={() => setMobileOpen(false)}
                />
              ))}

              {isAuthenticated &&
                getUserDropdownItemsByRole(role, locale).map((item) => (
                  <MobileNavLink
                    key={item.href}
                    href={withLocale(locale, item.href)}
                    label={item.label}
                    active={activePath === item.href}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}

              {isGuest &&
                accountItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    href={withLocale(locale, item.href)}
                    label={item.label}
                    active={activePath === item.href}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="size-5" />
                  {tCommon("logout")}
                </button>
              )}
            </div>

            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              {isStudent && (
                <MobileNavLink
                  href={withLocale(locale, routes.notifications)}
                  label={`${tCommon("notifications")} (${unreadCount})`}
                  active={activePath === routes.notifications}
                  onClick={() => setMobileOpen(false)}
                />
              )}
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

type NavLinkProps = {
  href: string;
  label: string;
  active: boolean;
};

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center rounded-lg px-3 text-sm font-bold transition",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

type DropdownMenuProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function DropdownMenu({ title, subtitle, children }: DropdownMenuProps) {
  return (
    <div className="absolute end-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-[0px_12px_40px_rgba(0,0,0,0.12)]">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-bold text-primary">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="p-2">{children}</div>
    </div>
  );
}

type DropdownLinkProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
};

function DropdownLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: DropdownLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

type MobileNavLinkProps = NavLinkProps & {
  onClick: () => void;
};

function MobileNavLink({ href, label, active, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center rounded-lg px-3 text-sm font-bold transition",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

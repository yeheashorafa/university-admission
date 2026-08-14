"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
  type AppTheme,
  isAppTheme,
} from "@/constants/theme";

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split("; ");

  const targetCookie = cookies.find((cookie) =>
    cookie.startsWith(`${name}=`)
  );

  if (!targetCookie) {
    return null;
  }

  return decodeURIComponent(targetCookie.split("=")[1]);
}

function saveThemeCookie(theme: AppTheme) {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

function getThemeSnapshot(): AppTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (isAppTheme(storedTheme)) {
    return storedTheme;
  }

  const cookieTheme = getCookieValue(THEME_COOKIE_NAME);

  if (isAppTheme(cookieTheme)) {
    return cookieTheme;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): AppTheme {
  return "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("theme-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function applyTheme(theme: AppTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");

  localStorage.setItem(THEME_STORAGE_KEY, theme);
  saveThemeCookie(theme);

  window.dispatchEvent(new Event("theme-change"));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerSnapshot
  );

  const isDark = theme === "dark";

  function toggleTheme() {
    applyTheme(isDark ? "light" : "dark");
  }

return (
  <button
    type="button"
    onClick={toggleTheme}
    className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground transition hover:bg-muted"
    aria-label="Toggle theme"
    suppressHydrationWarning
  >
    {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
  </button>
);
}
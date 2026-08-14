export type AppTheme = "light" | "dark";

export const THEME_COOKIE_NAME = "app_theme";
export const THEME_STORAGE_KEY = "theme";

export function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}
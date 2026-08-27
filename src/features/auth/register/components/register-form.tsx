"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  IdCard,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { routes, withLocale } from "@/constants/routes";
import { extractApiError } from "@/lib/api/api-error";
import { useAuthStore } from "@/stores/auth.store";
import { useLocale, useTranslations } from "next-intl";
import { SubmitHandler } from "@/lib/utils";
import { getDashboardRouteByRole } from "@/constants/role-navigation";
import { isUserVerified, type RegisterPayload } from "@/services/auth.service";

type FieldErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  password?: string;
  passwordConfirmation?: string;
};

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const register = useAuthStore((state) => state.register);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) {
      setFormError(null);
    }
  };

  async function handleSubmit(event: SubmitHandler) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const newFieldErrors: FieldErrors = {};

    if (!fullName.trim()) {
      newFieldErrors.fullName = t("nameRequired");
    }

    if (!email.trim()) {
      newFieldErrors.email = t("emailRequired");
    } else if (!email.includes("@") || !email.includes(".")) {
      newFieldErrors.email =
        locale === "ar"
          ? "صيغة البريد الإلكتروني غير صحيحة"
          : "Invalid email format";
    }

    if (!phone.trim()) {
      newFieldErrors.phone = locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    }

    if (!nationalId.trim()) {
      newFieldErrors.nationalId = locale === "ar" ? "رقم الهوية مطلوب" : "National ID is required";
    } else if (nationalId.trim().length > 20) {
      newFieldErrors.nationalId =
        locale === "ar" ? "رقم الهوية يجب ألا يتجاوز 20 خانة" : "National ID cannot exceed 20 characters";
    }

    if (!password) {
      newFieldErrors.password = t("passwordRequired");
    } else if (password.length < 8) {
      newFieldErrors.password = t("passwordMin");
    }

    if (!passwordConfirmation) {
      newFieldErrors.passwordConfirmation = t("passwordConfirmationRequired");
    } else if (password !== passwordConfirmation) {
      newFieldErrors.passwordConfirmation = t("passwordsDoNotMatch");
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      const generalMsg = t("checkHighlightedFields");
      setFormError(generalMsg);
      toast.error(generalMsg);
      return;
    }

    setIsSubmitting(true);

    const payload: RegisterPayload = {
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      national_id: nationalId.trim(),
      password: password,
      password_confirmation: passwordConfirmation,
    };

    try {
      const user = await register(payload);

      toast.success(t("accountCreatedSuccessfully"));

      if (!isUserVerified(user)) {
        router.replace(withLocale(locale, routes.verifyOtp));
        return;
      }

      const targetRoute = getDashboardRouteByRole(user.role);
      router.replace(withLocale(locale, targetRoute));
    } catch (error) {
      const apiError = extractApiError(error);
      const backendErrors = apiError.errors;

      const mappedFieldErrors: FieldErrors = {};

      if (backendErrors) {
        if (backendErrors.name?.[0]) {
          mappedFieldErrors.fullName = backendErrors.name[0];
        }
        if (backendErrors.email?.[0]) {
          mappedFieldErrors.email = backendErrors.email[0];
        }
        if (backendErrors.phone?.[0]) {
          mappedFieldErrors.phone = backendErrors.phone[0];
        }
        if (backendErrors.national_id?.[0]) {
          const msg = backendErrors.national_id[0];
          const isDuplicate = msg.toLowerCase().includes("taken") || msg.includes("مستخدم") || msg.includes("موجود");
          mappedFieldErrors.nationalId = isDuplicate
            ? (locale === "ar" ? "رقم الهوية مستخدم من قبل." : "National ID has already been taken.")
            : msg;
        }
        if (backendErrors.password?.[0]) {
          mappedFieldErrors.password = backendErrors.password[0];
        }
        if (backendErrors.password_confirmation?.[0]) {
          mappedFieldErrors.passwordConfirmation =
            backendErrors.password_confirmation[0];
        }
      }

      setFieldErrors(mappedFieldErrors);

      const hasMappedFieldErrors = Object.keys(mappedFieldErrors).length > 0;
      const generalMsg = hasMappedFieldErrors
        ? t("checkHighlightedFields")
        : apiError.message || t("registerFailed");

      setFormError(generalMsg);
      toast.error(generalMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full rounded-3xl border border-border bg-card p-6 shadow-[0px_10px_35px_rgba(0,77,64,0.08)] md:p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-primary">
          {t("registerTitle")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("registerShortDescription")}
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
            htmlFor="full-name"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("fullName")}
          </label>

          <div className="relative">
            <UserRound className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                clearFieldError("fullName");
              }}
              placeholder="Ahmed Mohammad Hassan"
              className={`h-12 w-full rounded-lg border bg-card px-4 ps-10 text-base outline-none transition ${
                fieldErrors.fullName
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
          </div>
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.fullName}
            </p>
          )}
        </div>

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
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              placeholder="student@example.com"
              className={`h-12 w-full rounded-lg border bg-card px-4 ps-10 text-base outline-none transition ${
                fieldErrors.email
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-destructive font-medium">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("phoneNumber")}
          </label>

          <div className="relative">
            <Phone className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                clearFieldError("phone");
              }}
              placeholder="+970 59 123 4567"
              className={`h-12 w-full rounded-lg border bg-card px-4 ps-10 text-base outline-none transition ${
                fieldErrors.phone
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
          </div>
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-destructive font-medium">
              {fieldErrors.phone}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="national-id"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("nationalId")}
          </label>

          <div className="relative">
            <IdCard className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="national-id"
              type="text"
              maxLength={20}
              value={nationalId}
              onChange={(event) => {
                setNationalId(event.target.value);
                clearFieldError("nationalId");
              }}
              placeholder="123456789"
              className={`h-12 w-full rounded-lg border bg-card px-4 ps-10 text-base outline-none transition ${
                fieldErrors.nationalId
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
          </div>
          {fieldErrors.nationalId && (
            <p className="mt-1 text-xs text-destructive font-medium">
              {fieldErrors.nationalId}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("password")}
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              placeholder={t("passwordHint")}
              className={`h-12 w-full rounded-lg border bg-card px-4 pe-11 ps-10 text-base outline-none transition ${
                fieldErrors.password
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              aria-label={t("togglePasswordVisibility")}
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-destructive font-medium">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password-confirmation"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("confirmPassword")}
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="password-confirmation"
              type={showPassword ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(event) => {
                setPasswordConfirmation(event.target.value);
                clearFieldError("passwordConfirmation");
              }}
              placeholder={t("reEnterPassword")}
              className={`h-12 w-full rounded-lg border bg-card px-4 ps-10 text-base outline-none transition ${
                fieldErrors.passwordConfirmation
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
          </div>
          {fieldErrors.passwordConfirmation && (
            <p className="mt-1 text-xs text-destructive font-medium">
              {fieldErrors.passwordConfirmation}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {t("creatingAccount")}
            </>
          ) : (
            <>
              <UserPlus className="size-5" />
              {t("registerTitle")}
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href={withLocale(locale, routes.login)}
          className="font-bold text-secondary transition hover:text-secondary/80"
        >
          {t("login")}
        </Link>
      </p>
    </section>
  );
}


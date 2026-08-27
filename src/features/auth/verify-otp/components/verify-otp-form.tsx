"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { routes, withLocale } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { extractApiError, getApiErrorMessage } from "@/lib/api/api-error";
import { sendOtp, verifyOtp } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { getDashboardRouteByRole } from "@/constants/role-navigation";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 90;
type OtpChannel = "email" | "sms";

export function VerifyOtpForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("auth");

  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  const displayPhone = useMemo(() => {
    const phone = user?.phone;
    if (!phone) return "+970 59-123-4567";
    return phone.startsWith("+") ? phone : `+${phone}`;
  }, [user?.phone]);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [channel, setChannel] = useState<OtpChannel>("email");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isComplete = otp.every(Boolean);
  const canResend = secondsLeft === 0;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [secondsLeft]);

  async function requestOtp(activeChannel: OtpChannel) {
    setIsSending(true);
    setError("");
    try {
      const result = await sendOtp({ channel: activeChannel });
      if (result.alreadyVerified) {
        toast.success(t("accountAlreadyVerified"));
        completeVerification();
        return;
      }
      toast.success(
        activeChannel === "email"
          ? t("otpSentToEmail")
          : t("otpSentToPhone")
      );
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(getApiErrorMessage(err));
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    requestOtp("email");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timerText = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return `(${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )})`;
  }, [secondsLeft]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(0, 1);

    const nextOtp = [...otp];
    nextOtp[index] = digit;

    setOtp(nextOtp);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextOtp = Array(OTP_LENGTH).fill("");

    pasted.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    setError("");

    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  }

  async function handleResend() {
    if (!canResend || isSending) return;

    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    await requestOtp(channel);
  }

  async function completeVerification() {
    try {
      await fetchCurrentUser();
    } catch {
      // ignore — route anyway, guards will re-check
    }
    const updatedUser = useAuthStore.getState().user;
    router.replace(withLocale(locale, getDashboardRouteByRole(updatedUser?.role)));
  }

  async function handleVerify() {
    if (!isComplete) {
      setError(t("otpRequired"));
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      await verifyOtp({ code: otp.join("") });
      toast.success(t("verificationSuccessful"));
      setIsSuccess(true);
      await completeVerification();
    } catch (err) {
      const apiError = extractApiError(err);
      const message = apiError.status === 429
        ? t("otpTooManyAttempts")
        : apiError.message || t("otpInvalid");
      setError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }

  if (isSuccess) {
    return (
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-10" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-primary">
          {t("verificationSuccessful")}
        </h1>

        <p className="mb-8 leading-7 text-muted-foreground">
          {t("verificationSuccessDescription")}
        </p>

        <Link
          href={withLocale(locale, routes.dashboard)}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {t("goToDashboard")}
        </Link>
      </section>
    );
  }

  return (
    <section className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="pointer-events-none absolute -end-20 -top-20 size-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <LockKeyhole className="size-8" />
          </div>

          <h1 className="mb-3 text-2xl font-bold text-primary">
            {t("verifyYourCode")}
          </h1>

          <p className="leading-7 text-muted-foreground">
            {t("enterCodeSentTo")}
            <br />
            <strong className="mt-1 block font-semibold text-primary" dir="ltr">
              {displayPhone}
            </strong>
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("sendOtpVia")}
            </span>
            <div className="inline-flex overflow-hidden rounded-lg border border-border">
              {(["email", "sms"] as OtpChannel[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChannel(value)}
                  disabled={isSending}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition disabled:opacity-60",
                    channel === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {value === "email" ? t("sendOtpEmail") : t("sendOtpSms")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between gap-2" dir="ltr">
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                value={value}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${index + 1}`}
                placeholder="-"
                onChange={(event) =>
                  handleOtpChange(index, event.target.value)
                }
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className={cn(
                  "h-14 w-12 rounded-lg border border-input bg-muted text-center text-xl font-semibold outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20",
                  error && "border-destructive focus:border-destructive"
                )}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || isSending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>{t("verifying")}</span>
              </>
            ) : (
              <>
                <span>{t("verifyCode")}</span>
                <ArrowLeft className="size-5" />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            {t("didntReceiveCode")}
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isSending}
              className="inline-flex items-center gap-1 text-sm font-bold text-secondary transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
            >
              <RotateCcw className="size-4" />
              {t("resendCode")}
            </button>

            {!canResend && (
              <span className="font-mono text-sm text-muted-foreground" dir="ltr">
                {timerText}
              </span>
            )}
          </div>
        </div>

        <Link
          href={withLocale(locale, routes.register)}
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="size-4 rotate-180" />
          {t("backToEditPhone")}
        </Link>
      </div>
    </section>
  );
}
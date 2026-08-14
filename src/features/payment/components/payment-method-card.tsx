"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  UploadCloud,
} from "lucide-react";

import Swal from "sweetalert2";

import { paymentMethodsMock, type PaymentMethod } from "../data/payment.data";
import { cn } from "@/lib/utils";

const methodIcons: Record<PaymentMethod, React.ElementType> = {
  card: CreditCard,
  bank_transfer: Building2,
  cash_office: Banknote,
};

export function PaymentMethodCard() {
  const t = useTranslations("payment");
  const locale = useLocale();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const isAr = locale === "ar";

  async function handleSuccess() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: isAr
        ? "نظام الدفع غير متصل حالياً بالخادم. الدفع معطل لحين إتاحة نقاط النهاية."
        : "Payment endpoints are not connected yet. Payment is disabled.",
      icon: "info",
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-primary">
          {t("paymentMethod")}
        </h2>

        <p className="mt-2 leading-7 text-muted-foreground">
          {t("paymentMethodDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {paymentMethodsMock.map((method) => {
          const Icon = methodIcons[method.id];
          const selected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={cn(
                "relative rounded-xl border p-5 text-start transition hover:bg-muted",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              {selected && (
                <CheckCircle2 className="absolute end-4 top-4 size-5 text-primary" />
              )}

              <div
                className={cn(
                  "mb-4 flex size-11 items-center justify-center rounded-lg",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-primary"
                )}
              >
                <Icon className="size-6" />
              </div>

              <h3 className="font-bold text-foreground">
                {t(`methods.${method.id}.title`)}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(`methods.${method.id}.description`)}
              </p>
            </button>
          );
        })}
      </div>

      {selectedMethod === "card" && <CardPaymentForm />}
      {selectedMethod === "bank_transfer" && <BankTransferForm />}
      {selectedMethod === "cash_office" && <CashOfficeInfo />}

      <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleSuccess}
          disabled
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition opacity-50 cursor-not-allowed shadow-md"
        >
          {t("continuePayment")} (PENDING_BACKEND_API)
        </button>
      </div>
    </section>
  );
}

function CardPaymentForm() {
  const t = useTranslations("payment");

  return (
    <div className="mt-6 rounded-xl border border-border bg-muted p-5">
      <h3 className="mb-4 font-bold text-primary">{t("cardDetails")}</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PaymentInput label={t("cardholderName")} placeholder="Ahmed Mohammad Hassan" disabled />
        <PaymentInput label={t("cardNumber")} placeholder="0000 0000 0000 0000" disabled />
        <PaymentInput label={t("expiryDate")} placeholder="MM / YY" disabled />
        <PaymentInput label={t("cvv")} placeholder="123" disabled />
      </div>
    </div>
  );
}

function BankTransferForm() {
  const t = useTranslations("payment");

  return (
    <div className="mt-6 rounded-xl border border-border bg-muted p-5">
      <h3 className="mb-4 font-bold text-primary">
        {t("bankTransferDetails")}
      </h3>

      <div className="mb-5 rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{t("bankAccount")}</p>
        <p className="mt-1 font-bold text-foreground">
          {t("bankAccountName")}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <span className="text-muted-foreground">{t("iban")}: </span>
            <span className="font-bold text-foreground">PS92 0000 1234 5678 9012 3456</span>
          </div>

          <div>
            <span className="text-muted-foreground">{t("swiftCode")}: </span>
            <span className="font-bold text-foreground">PALSPS22</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
        <UploadCloud className="mx-auto size-10 text-muted-foreground" />

        <p className="mt-2 text-sm font-bold text-foreground">
          {t("uploadReceipt")}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {t("receiptDescription")}
        </p>

        <button
          type="button"
          disabled
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground opacity-50 cursor-not-allowed"
        >
          {t("selectFile")} (PENDING_BACKEND_API)
        </button>
      </div>
    </div>
  );
}

function CashOfficeInfo() {
  const t = useTranslations("payment");

  return (
    <div className="mt-6 rounded-xl border border-border bg-muted p-5">
      <h3 className="mb-2 font-bold text-primary">{t("cashOfficeTitle")}</h3>

      <p className="text-sm leading-6 text-muted-foreground">
        {t("cashOfficeDescription")}
      </p>

      <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm font-bold text-foreground">
        {t("referenceCodeNote")}
      </div>
    </div>
  );
}

type PaymentInputProps = {
  label: string;
  placeholder: string;
  disabled?: boolean;
};

function PaymentInput({ label, placeholder, disabled }: PaymentInputProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-foreground">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
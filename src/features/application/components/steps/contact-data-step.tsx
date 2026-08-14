"use client";

import { useLocale } from "next-intl";
import { useMemo } from "react";
import type { ContactData } from "../../types/application-form.types";
import {
  governorates,
  citiesByGovernorate,
  neighborhoodsByCity,
} from "../../data/palestine-addresses.data";

type ContactDataStepProps = {
  data: ContactData;
  onChange: (updated: Partial<ContactData>) => void;
};

export function ContactDataStep({ data, onChange }: ContactDataStepProps) {
  const locale = useLocale();

  const availableCities = useMemo(() => {
    if (!data.governorate) return [];
    return citiesByGovernorate[data.governorate] || [];
  }, [data.governorate]);

  const availableNeighborhoods = useMemo(() => {
    if (!data.city) return [];
    return neighborhoodsByCity[data.city] || [];
  }, [data.city]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "5. بيانات العنوان والاتصال" : "5. Address & Contact Data"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى اختيار المحافظة والمدينة والحي لتحديد عنوانك بالتفصيل."
            : "Please select your governorate, city, and neighborhood to define your details."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "المحافظة *" : "Governorate *"}
          </label>
          <select
            value={data.governorate}
            onChange={(e) => {
              const nextGov = e.target.value;
              onChange({
                governorate: nextGov,
                city: "",
                neighborhood: "",
              });
            }}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">{locale === "ar" ? "اختر المحافظة" : "Select Governorate"}</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {locale === "ar" ? g.nameAr : g.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "المدينة *" : "City / Town *"}
          </label>
          <select
            value={data.city}
            disabled={!data.governorate}
            onChange={(e) => {
              const nextCity = e.target.value;
              onChange({
                city: nextCity,
                neighborhood: "",
              });
            }}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:bg-muted"
          >
            <option value="">{locale === "ar" ? "اختر المدينة" : "Select City"}</option>
            {availableCities.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "الحي / المنطقة *" : "Neighborhood *"}
          </label>
          <select
            value={data.neighborhood}
            disabled={!data.city}
            onChange={(e) => onChange({ neighborhood: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50 disabled:bg-muted"
          >
            <option value="">{locale === "ar" ? "اختر الحي" : "Select Neighborhood"}</option>
            {availableNeighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {locale === "ar" ? n.nameAr : n.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "الشارع / تفاصيل إضافية" : "Street / Additional Details"}
          </label>
          <input
            type="text"
            value={data.street}
            onChange={(e) => onChange({ street: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={locale === "ar" ? "مثال: شارع الجلاء، بجوار مسجد الهداية" : "Example: Jalaa Street, near Hidayah mosque"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "البريد الإلكتروني *" : "Email Address *"}
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="student@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "رقم الهاتف الأرضي" : "Landline Phone"}
          </label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "") })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="0828XXXXX"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "رقم الجوال الشخصي *" : "Mobile Phone *"}
          </label>
          <input
            type="text"
            value={data.mobile}
            onChange={(e) => onChange({ mobile: e.target.value.replace(/\D/g, "") })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="059XXXXXXX"
          />
        </div>
      </div>
    </div>
  );
}

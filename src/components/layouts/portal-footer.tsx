"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Phone, Mail } from "lucide-react";
import { withLocale } from "@/constants/routes";
import { IugLogo } from "@/components/shared/iug-logo";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  getFooterQuickLinksByRole,
  getFooterServicesByRole,
  getLogoRouteByRole,
} from "@/constants/role-navigation";

export function PortalFooter() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { role } = useCurrentAuth();


  const quickLinks = getFooterQuickLinksByRole(role, locale);
  const servicesLinks = getFooterServicesByRole(role, locale);

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="app-container grid gap-8 py-12 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        {/* Brand & Description */}
        <div className="space-y-4">
          <Link
            href={withLocale(locale, getLogoRouteByRole(role))}
            className="inline-flex items-center gap-3"
          >
            <IugLogo />
          </Link>

          <p className="max-w-md text-xs md:text-sm leading-relaxed text-muted-foreground">
            {isAr
              ? "بوابة القبول الإلكتروني بالجامعة الإسلامية بغزة - عمادة القبول والتسجيل. منصة متكاملة لتقديم الطلبات، رفع المستندات والتحقق الذكي، سداد الرسوم، واستكمال طلبات المنح."
              : "Islamic University of Gaza Admission Portal. Integrated portal for application submission, AI document verification, fee payment, and scholarship research."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-sm font-extrabold text-[#76BC21]">
            {isAr ? "روابط سريعة" : "Quick Links"}
          </h3>

          <ul className="space-y-2.5">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={withLocale(locale, item.href)}
                  className="text-xs text-muted-foreground transition hover:text-[#76BC21]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Student Services */}
        <div>
          <h3 className="mb-4 text-sm font-extrabold text-[#76BC21]">
            {isAr ? "الخدمات الطلابية" : "Student Services"}
          </h3>

          <ul className="space-y-2.5">
            {servicesLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={withLocale(locale, item.href)}
                  className="text-xs text-muted-foreground transition hover:text-[#76BC21]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Institutional Contact Info */}
        <div>
          <h3 className="mb-4 text-sm font-extrabold text-[#76BC21]">
            {isAr ? "عمادة القبول والتسجيل" : "Admission & Registration"}
          </h3>

          <ul className="space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="size-4 shrink-0 text-[#76BC21] mt-0.5" />
              <span>
                {isAr
                  ? "غزة، الرمال - الجامعة الإسلامية"
                  : "Gaza, Rimal - Islamic University"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-[#76BC21]" />
              <span className="font-mono text-xs">+970 8 2860700</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-[#76BC21]" />
              <span className="font-mono text-xs">admission@iugaza.edu.ps</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <div className="app-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          {isAr
            ? "الجامعة الإسلامية بغزة - عمادة القبول والتسجيل. جميع الحقوق محفوظة."
            : "Islamic University of Gaza - Deanship of Admission & Registration. All rights reserved."}
        </div>
      </div>
    </footer>
  );
}
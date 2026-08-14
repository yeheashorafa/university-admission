"use client";

import { useLocale } from "next-intl";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Cpu,
  UserCheck,
  CheckCircle2,
  Info,
} from "lucide-react";

export function LandingAiVerificationPreview() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="space-y-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        {/* Text / Feature Highlights Section */}
        <div className="space-y-5 lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1 text-xs font-black text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <Sparkles className="size-4 text-purple-500" />
            <span>{isAr ? "محرك التدقيق والتحقق بالذكاء الاصطناعي" : "AI Verification Engine"}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#12360b] dark:text-[#8bd63a] leading-tight">
            {isAr
              ? "تحقق فورائي ودقيق من صحة كشوف درجات الثانوية والمستندات الرسمية"
              : "Instant AI Document & Transcript Verification System"}
          </h2>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "يعتمد النظام تقنيات الذكاء الاصطناعي لقراءة كشوف علامات الثانوية العامة، استخراج المعدلات والدرجات آلياً، ومطابقتها بشروط القبول فور إرفاقها. وفي حال انخفاض دقة الصورة، يُحال الملف فوراً للمراجعة اليدوية لضمان الدقة الكاملة."
              : "Our AI Engine instantly analyzes high school transcript scans, extracts Tawjihi averages, and matches program criteria. Low resolution uploads automatically trigger manual employee verification."}
          </p>

          {/* Info Banner Accent (#0396E9) */}
          <div className="rounded-xl bg-[#0396E9]/10 p-3.5 border border-[#0396E9]/25 flex items-start gap-3">
            <Info className="size-5 shrink-0 text-[#0396E9] mt-0.5" />
            <p className="text-2xs sm:text-xs font-semibold text-foreground leading-relaxed">
              {isAr
                ? "يساعد التدقيق الآلي في اختصار وقت المعالجة من أيام إلى ثوانٍ معدودة مع الحفاظ على أعلى مستويات الأمان والدقة."
                : "Automated AI checks reduce verification processing time from days to seconds while maintaining maximum accuracy."}
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#76BC21]/15 text-[#76BC21]">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {isAr ? "مطابقة معدل التوجيهي آلياً" : "Automatic Tawjihi Average Matching"}
                </p>
                <p className="text-2xs text-muted-foreground">
                  {isAr ? "قراءة الدرجات واستخراج نسبة النجاح مباشرة من كشف الدرجات" : "Direct OCR extraction of marks and percentages from uploaded scans."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0396E9]/15 text-[#0396E9]">
                <UserCheck className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {isAr ? "مظلة أمان للمراجعة اليدوية" : "Manual Review Safety Net"}
                </p>
                <p className="text-2xs text-muted-foreground">
                  {isAr ? "إذا كانت صورة الكشف غير واضحة، يتم تحويل الطلب لموظف القبول فوراً" : "Low confidence scans automatically route to admission staff."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Verification Cards Column */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card 1: High Confidence AI Verification */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-extrabold text-foreground">
                  {isAr ? "كشف علامات الثانوية العامة - فلسطين" : "Tawjihi Transcript Scan"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#76BC21]/15 px-2.5 py-0.5 text-2xs font-extrabold text-[#76BC21] border border-[#76BC21]/30">
                <ShieldCheck className="size-3" />
                96% {isAr ? "موثق آلياً" : "AI Verified"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-2xs rounded-xl bg-background/80 p-3 border border-border">
              <div>
                <span className="text-muted-foreground">{isAr ? "المعدل المستخرج:" : "Extracted Average:"} </span>
                <span className="font-mono font-bold text-[#76BC21]">91.5%</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isAr ? "رقم الجلوس:" : "Seat Number:"} </span>
                <span className="font-mono font-bold text-foreground">104928</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isAr ? "الفرع:" : "Branch:"} </span>
                <span className="font-bold text-foreground">{isAr ? "العلمي" : "Scientific"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isAr ? "سنة التخرج:" : "Year:"} </span>
                <span className="font-bold text-foreground">2026</span>
              </div>
            </div>
          </div>

          {/* Card 2: Manual Review Trigger */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-extrabold text-foreground">
                  {isAr ? "صورة الهوية الشخصية (دقة غير كافية)" : "National ID Scan (Low Resolution)"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-2xs font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Cpu className="size-3" />
                62% {isAr ? "تحويل للمراجعة اليدوية" : "Manual Review Required"}
              </span>
            </div>

            <p className="text-2xs text-muted-foreground leading-relaxed bg-background/80 p-3 rounded-xl border border-border">
              {isAr
                ? "تم تحويل المستند آلياً إلى قائمة التدقيق اليدوي لموظف القبول والتسجيل للتأكد من مطابقة اسم الطالب ورقم الهوية."
                : "Document automatically transferred to admission employee review queue for identity check."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

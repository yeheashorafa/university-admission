"use client";

import { useLocale } from "next-intl";
import {
  FileText,
  Sparkles,
  UserCheck,
  CreditCard,
  IdCard,
  ClipboardList,
  CheckCircle2,
  GitCommit,
} from "lucide-react";

export function LandingAdmissionWorkflow() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const steps = [
    {
      num: "01",
      title: isAr ? "تقديم الطلب الإلكتروني" : "Submit Online Application",
      desc: isAr
        ? "إدخال البيانات الشخصية والأكاديمية واختيار الرغبات في الكليات والتخصصات المتاحة."
        : "Fill personal, academic information and select your faculty preferences online.",
      icon: FileText,
      tag: isAr ? "الخطوة الأولى" : "Step 1",
      color: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
    },
    {
      num: "02",
      title: isAr ? "التدقيق الآلي بالذكاء الاصطناعي" : "AI Document Verification",
      desc: isAr
        ? "فحص آلي وقراءة كشوف علامات الثانوية العامة والهوية بمحرك الذكاء الاصطناعي ومطابقة الشروط."
        : "Automatic OCR scanning of transcripts and IDs with instant criteria matching.",
      icon: Sparkles,
      tag: isAr ? "معالجة ذكية" : "AI Processed",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
    {
      num: "03",
      title: isAr ? "المراجعة الإدارية والأكاديمية" : "Manual & Dept Head Review",
      desc: isAr
        ? "تدقيق موظف القبول للمستندات غير الواضحة ثم اعتماد رئيس القسم الأكاديمي للطلب."
        : "Admission employee verification for low-confidence scans and department head sign-off.",
      icon: UserCheck,
      tag: isAr ? "مراجعة بشرية" : "Human Review",
      color: "bg-[#0396E9]/10 text-[#0396E9] border-[#0396E9]/30",
    },
    {
      num: "04",
      title: isAr ? "سداد رسوم القبول" : "Admission Fee Payment",
      desc: isAr
        ? "تسديد رسوم تثبيت القبول عبر الفيزا، الماستركارد، أو التحويل البنكي وحفظ الإيصال."
        : "Online fee settlement via card or bank transfer to confirm seat reservation.",
      icon: CreditCard,
      tag: isAr ? "دفع آمن" : "Secure Payment",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      num: "05",
      title: isAr ? "إصدار الرقم الجامعي" : "University Student ID Issued",
      desc: isAr
        ? "توليد الرقم الجامعي الرسمي فور نجاح عملية السداد وإنشاء السجل الأكاديمي."
        : "Automated student ID number generation (2026xxxx) upon payment confirmation.",
      icon: IdCard,
      tag: isAr ? "رقم جامعي" : "Student ID",
      color: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
    },
    {
      num: "06",
      title: isAr ? "نموذج البحث الاجتماعي" : "Social Research Form",
      desc: isAr
        ? "تعبئة بيانات الحالة الاجتماعية والاقتصادية للأسرة للاستفادة من منح الجامعة."
        : "Complete household economic survey for scholarship eligibility evaluation.",
      icon: ClipboardList,
      tag: isAr ? "دعم المنح" : "Scholarship",
      color: "bg-[#0396E9]/10 text-[#0396E9] border-[#0396E9]/30",
    },
    {
      num: "07",
      title: isAr ? "القبول النهائي والاعتماد" : "Final Admission Completed",
      desc: isAr
        ? "مبارك! أصبح ملف قبولك الجامعي مكتظاً ومعتمداً بالكامل في الجامعة الإسلامية."
        : "Congratulations! Your university admission file is officially verified and active.",
      icon: CheckCircle2,
      tag: isAr ? "قبول نهائي" : "Active Student",
      color: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
    },
  ];

  return (
    <section className="space-y-8 rounded-3xl border border-border bg-gradient-to-b from-card to-muted/40 p-6 md:p-10 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#76BC21]/10 px-4 py-1 text-xs font-black text-[#76BC21]">
          <GitCommit className="size-4" />
          <span>{isAr ? "دورة حياة الطلب الشاملة" : "Full Admission Lifecycle Timeline"}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#12360b] dark:text-[#8bd63a]">
          {isAr
            ? "خطوات شفافة ومؤتمتة من التقديم حتى إصدار الرقم الجامعي"
            : "Transparent Workflow from Application to Student ID Generation"}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {isAr
            ? "يمر كل طلب يقدّمه الطالب بمراحل منظمة ومحكومة تتيح لك متابعة التحديثات، نتائج التدقيق الآلي، الإجراءات المطلوبة، وسداد الرسوم لحظة بلحظة."
            : "Every application flows through distinct, automated checkpoints giving you clear real-time updates at every single stage."}
        </p>
      </div>

      {/* Timeline Steps Grid Layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-2xs hover:border-[#76BC21]/40 hover:shadow-md transition duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#76BC21]/10 text-[#76BC21]">
                    <Icon className="size-6" />
                  </div>
                  <span className="font-mono text-xl font-black text-muted-foreground/30">
                    {step.num}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-base font-extrabold text-foreground leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <span
                    className={`inline-block my-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${step.color}`}
                  >
                    {step.tag}
                  </span>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

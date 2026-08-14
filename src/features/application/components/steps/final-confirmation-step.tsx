"use client";

import { useLocale } from "next-intl";
import { AlertTriangle } from "lucide-react";
import type { FinalConfirmationData } from "../../types/application-form.types";

type FinalConfirmationStepProps = {
  data: FinalConfirmationData;
  onChange: (updated: Partial<FinalConfirmationData>) => void;
};

export function FinalConfirmationStep({ data, onChange }: FinalConfirmationStepProps) {
  const locale = useLocale();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "10. الاعتماد النهائي لطلب الالتحاق" : "10. Final Application Confirmation"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى الموافقة على التعهد والإقرار بصحة البيانات المسجلة لإرسال الطلب نهائياً."
            : "Please review the pledge and confirm accuracy of your inputs to submit."}
        </p>
      </div>

      <div className="space-y-6">
        {/* Pledge Box */}
        <div className="flex gap-4 p-5 rounded-2xl border border-yellow-100 bg-yellow-50/30">
          <AlertTriangle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-yellow-800">
              {locale === "ar" ? "تعهد وإقرار صحة البيانات" : "Declaration and Data Validity Pledge"}
            </h4>
            <p className="text-sm text-yellow-700 leading-relaxed">
              {locale === "ar"
                ? "أقر أنا مقدم الطلب بأن جميع البيانات التي أدخلتها والمستندات التي قمت برفعها صحيحة ودقيقة وتحت مسؤوليتي الكاملة. وفي حال تبين خلاف ذلك، يحق للجامعة الإسلامية بغزة إلغاء طلبي أو قبولي في أي مرحلة من المراحل دون أي التزامات مالية أو قانونية تجاه الجامعة."
                : "I hereby declare that all information provided and files uploaded are accurate and complete to the best of my knowledge. If any detail is found false or misleading, the Islamic University of Gaza reserves the right to cancel my admission at any stage."}
            </p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.confirmData}
              onChange={(e) => onChange({ confirmData: e.target.checked })}
              className="size-5 rounded text-primary border-border focus:ring-primary mt-0.5"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-foreground block">
                {locale === "ar" ? "أؤكد وأقر بأن جميع البيانات والمستندات المدخلة صحيحة ومطابقة *" : "I confirm that all entered details and documents are correct *"}
              </span>
              <span className="text-xs text-muted-foreground block">
                {locale === "ar" ? "يجب وضع علامة لتأكيد صحة مدخلاتك." : "Must be checked to confirm validity."}
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.agreeTerms}
              onChange={(e) => onChange({ agreeTerms: e.target.checked })}
              className="size-5 rounded text-primary border-border focus:ring-primary mt-0.5"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-foreground block">
                {locale === "ar" ? "أوافق على شروط وأحكام الالتحاق والسياسات الأكاديمية للجامعة *" : "I agree to the university admission terms and academic regulations *"}
              </span>
              <span className="text-xs text-muted-foreground block">
                {locale === "ar" ? "يجب وضع علامة لقبول الشروط والأحكام." : "Must be checked to accept terms."}
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

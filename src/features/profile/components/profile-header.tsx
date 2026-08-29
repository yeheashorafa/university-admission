"use client";
 
import { useLocale } from "next-intl";
import { UserCircle2, Loader2 } from "lucide-react";
import { useMyProfileQuery } from "@/hooks/queries/use-profile-queries";
import { useAuthStore } from "@/stores/auth.store";
import {
  getStudentDisplayName,
  getStudentNationalId,
} from "@/lib/adapters/student-profile-adapter";

export function ProfileHeader() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading, isError } = useMyProfileQuery();

  if (isError) {
    return (
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] md:p-8">
        <div className="flex items-center gap-5">
           <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
             <UserCircle2 className="size-12" />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-destructive md:text-3xl">
               {isAr ? "تعذر تحميل بيانات الملف الشخصي." : "Unable to load profile data."}
             </h1>
           </div>
        </div>
      </section>
    );
  }

  const fullName = getStudentDisplayName(profile, user, locale);
  const nationalId = getStudentNationalId(profile, user, locale);

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] md:p-8">
      <div className="pointer-events-none absolute -end-20 -top-20 size-56 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {isLoading ? <Loader2 className="size-8 animate-spin" /> : <UserCircle2 className="size-12" />}
          </div>

          <div>
            <p className="mb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isAr ? "الملف الشخصي للطالب" : "Student Profile"}
            </p>

            <h1 className="text-2xl font-bold text-primary md:text-3xl">
              {fullName}
            </h1>

            <p className="mt-1 text-xs text-muted-foreground font-mono">
              {isAr ? "رقم الهوية" : "National ID"}: {nationalId}
            </p>
          </div>
        </div>

        <span className="w-max rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
          {profile?.email || user?.email || (isAr ? "مستخدم مفعل" : "Active Student")}
        </span>
      </div>
    </section>
  );
}
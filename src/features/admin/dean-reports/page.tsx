"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { ReportsFilterBar } from "@/features/admin/reports/components/reports-filter-bar";

export function DeanReportsPage() {
  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  return (
    <AdminLayout activePath={routes.adminDeanReports}>
      <div className="flex flex-col gap-8">
        <header className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-primary">Dean Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            System-wide admission statistics scoped by date range.
          </p>
        </header>
        
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-800 dark:text-amber-300">
          <span>تنبيه النظام (PENDING_BACKEND_API):</span>
          <span>واجهة التقارير تعتمد على الـ Backend، وهي غير متاحة حالياً.</span>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-[28px] border border-border shadow-sm">
          <h3 className="text-xl font-bold text-muted-foreground mb-2">Pending Backend API</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            لم يتم تفعيل روابط التقارير في الخلفية بعد. ستظهر الإحصائيات والرسوم البيانية هنا بمجرد توفر البيانات.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

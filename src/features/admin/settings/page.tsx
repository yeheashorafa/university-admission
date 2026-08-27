import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { AdminSettingsHeader } from "./components/admin-settings-header";
import { GeneralSettingsCard } from "./components/general-settings-card";
import { AdmissionSettingsCard } from "./components/admission-settings-card";
import { AiSettingsCard } from "./components/ai-settings-card";
import { NotificationSettingsCard } from "./components/notification-settings-card";
import { SecuritySettingsCard } from "./components/security-settings-card";
import { SettingsSaveBar } from "./components/settings-save-bar";
import { AdminFunctionalChecklistCard } from "./components/admin-functional-checklist-card";
import { BackendPendingBanner } from "@/components/common/backend-pending-banner";

export function AdminSettingsPage() {
  return (
    <AdminLayout activePath={routes.adminSettings}>
      <div className="flex flex-col gap-8">
        <AdminSettingsHeader />

        <BackendPendingBanner description="إعدادات النظام العامة واجهة تجريبية (لا توجد endpoints لحفظ الإعدادات في التوثيق النهائي للباك إند)." />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="flex flex-col gap-6 xl:col-span-8">
            <GeneralSettingsCard />
            <AdmissionSettingsCard />
            <AiSettingsCard />
            <NotificationSettingsCard />
          </section>

          <aside className="xl:col-span-4">
            <SecuritySettingsCard />
          </aside>
        </div>

        <AdminFunctionalChecklistCard />

        <SettingsSaveBar />
      </div>
    </AdminLayout>
  );
}
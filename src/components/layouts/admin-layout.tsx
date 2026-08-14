import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { routes } from "@/constants/routes";
import { CompleteProfileAlert } from "@/components/shared/complete-profile-alert";
type AdminLayoutProps = {
  children: React.ReactNode;
  activePath?: string;
};

export function AdminLayout({
  children,
  activePath = routes.admin,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar activePath={activePath} />

      <main className="min-h-screen w-full md:ps-72">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-10 md:py-10">
          <CompleteProfileAlert />
          {children}
        </div>
      </main>
    </div>
  );
}

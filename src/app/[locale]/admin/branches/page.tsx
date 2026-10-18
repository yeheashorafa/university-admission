import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminBranchesPage } from "@/features/admin/branches/page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "admin.branches" });

  return {
    title: t("managementTitle"),
    description: t("managementDescription"),
  };
}

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <AdminBranchesPage />
    </RoleGuard>
  );
}

import { RoleGuard } from "@/components/auth/role-guard";
import { adminRoles } from "@/constants/roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={adminRoles}>
      {children}
    </RoleGuard>
  );
}
"use client";

import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole, isStudentRole } from "@/lib/auth-helpers";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return {
    user,
    token,
    status,
    role,
    isAuthenticated,
    isLoading,
    isAdmin: isAdminRole(role),
    isStudent: isStudentRole(role),
  };
}
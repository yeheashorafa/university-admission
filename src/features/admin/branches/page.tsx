"use client";

import { useState, useMemo } from "react";
import { AdminBranchesHeader } from "./components/admin-branches-header";
import { AdminBranchesTable } from "./components/admin-branches-table";
import { AdminBranchFormModal } from "./components/admin-branch-form-modal";
import { AdminBranchDeleteConfirm } from "./components/admin-branch-delete-confirm";
import { useAdminBranchesQuery } from "@/hooks/queries/use-admin-branches-queries";
import type { AdminBranch } from "@/services/admin-branches.service";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";

export function AdminBranchesPage() {
  const { data: branches = [], isLoading } = useAdminBranchesQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<AdminBranch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<AdminBranch | null>(null);

  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    const lowerQuery = searchQuery.toLowerCase();
    return branches.filter(
      (b) =>
        (b.name_ar && b.name_ar.toLowerCase().includes(lowerQuery)) ||
        (b.name_en && b.name_en.toLowerCase().includes(lowerQuery))
    );
  }, [branches, searchQuery]);

  return (
    <AdminLayout activePath={routes.adminBranches}>
      <div className="space-y-6">
      <AdminBranchesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => {
          setSelectedBranch(null);
          setIsFormOpen(true);
        }}
      />
      
      <AdminBranchesTable
        branches={filteredBranches}
        isLoading={isLoading}
        onEdit={(branch) => {
          setSelectedBranch(branch);
          setIsFormOpen(true);
        }}
        onDelete={(branch) => setBranchToDelete(branch)}
      />

      <AdminBranchFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBranch(null);
        }}
        branch={selectedBranch}
      />

      <AdminBranchDeleteConfirm
        isOpen={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        branch={branchToDelete}
      />
    </div>
    </AdminLayout>
  );
}

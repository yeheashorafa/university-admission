"use client";

import type {
  LegalPolicy,
  LegalPolicyStatus,
} from "../data/legal-policies.data";
import { LegalPoliciesList } from "./legal-policies-list";
import { LegalPolicyEditor } from "./legal-policy-editor";

type LegalPoliciesWorkspaceProps = {
  policies: LegalPolicy[];
  activePolicy?: LegalPolicy;
  activePolicyId: string;
  onSelectPolicy: (policyId: string) => void;
  onUpdatePolicy: (
    policyId: string,
    updates: Partial<LegalPolicy>,
    successMessage: string
  ) => void;
  onChangeStatus: (policyId: string, status: LegalPolicyStatus) => void;
  onDeletePolicy: (policyId: string) => void;
};

export function LegalPoliciesWorkspace({
  policies,
  activePolicy,
  activePolicyId,
  onSelectPolicy,
  onUpdatePolicy,
  onChangeStatus,
  onDeletePolicy,
}: LegalPoliciesWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <aside className="xl:col-span-4">
        <LegalPoliciesList
          policies={policies}
          activePolicyId={activePolicyId}
          onSelectPolicy={onSelectPolicy}
        />
      </aside>

      <section className="xl:col-span-8">
        {activePolicy ? (
          <LegalPolicyEditor
            policy={activePolicy}
            key={activePolicy.id}
            onUpdatePolicy={onUpdatePolicy}
            onChangeStatus={onChangeStatus}
            onDeletePolicy={onDeletePolicy}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No policy selected.
          </div>
        )}
      </section>
    </div>
  );
}
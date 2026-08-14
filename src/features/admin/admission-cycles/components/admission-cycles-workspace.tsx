"use client";

import type {
  AdmissionCycle,
  AdmissionCycleStatus,
} from "../data/admission-cycles.data";
import { AdmissionCyclesList } from "./admission-cycles-list";
import { AdmissionCycleEditor } from "./admission-cycle-editor";

type AdmissionCyclesWorkspaceProps = {
  cycles: AdmissionCycle[];
  activeCycle?: AdmissionCycle;
  activeCycleId: string;
  onSelectCycle: (cycleId: string) => void;
  onUpdateCycle: (
    cycleId: string,
    updates: Partial<AdmissionCycle>,
    successMessage: string
  ) => void;
  onChangeStatus: (cycleId: string, status: AdmissionCycleStatus) => void;
  onDeleteCycle: (cycleId: string) => void;
};

export function AdmissionCyclesWorkspace({
  cycles,
  activeCycle,
  activeCycleId,
  onSelectCycle,
  onUpdateCycle,
  onChangeStatus,
  onDeleteCycle,
}: AdmissionCyclesWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <aside className="xl:col-span-4">
        <AdmissionCyclesList
          cycles={cycles}
          activeCycleId={activeCycleId}
          onSelectCycle={onSelectCycle}
        />
      </aside>

      <section className="xl:col-span-8">
        {activeCycle ? (
          <AdmissionCycleEditor
            cycle={activeCycle}
            key={activeCycle.id}
            onUpdateCycle={onUpdateCycle}
            onChangeStatus={onChangeStatus}
            onDeleteCycle={onDeleteCycle}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No admission cycle selected.
          </div>
        )}
      </section>
    </div>
  );
}
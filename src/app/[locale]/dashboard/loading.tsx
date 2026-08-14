import { DashboardSkeleton } from "@/components/common/loading/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="app-container py-10">
      <DashboardSkeleton />
    </div>
  );
}

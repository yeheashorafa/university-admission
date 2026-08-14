import { ListSkeleton } from "@/components/common/loading/list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsLoading() {
  return (
    <div className="app-container py-10 space-y-8">
      <div className="rounded-[28px] border border-border bg-card p-8 shadow-sm space-y-4">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      <ListSkeleton items={4} />
    </div>
  );
}

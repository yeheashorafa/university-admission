import { Skeleton } from "@/components/ui/skeleton";

type ListSkeletonProps = {
  items?: number;
};

export function ListSkeleton({ items = 4 }: ListSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-[20px] border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="size-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1 max-w-lg">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          </div>

          <Skeleton className="h-9 w-24 rounded-xl shrink-0 ms-4" />
        </div>
      ))}
    </div>
  );
}

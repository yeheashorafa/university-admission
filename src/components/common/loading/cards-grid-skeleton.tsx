import { Skeleton } from "@/components/ui/skeleton";

type CardsGridSkeletonProps = {
  count?: number;
};

export function CardsGridSkeleton({ count = 6 }: CardsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-[280px] flex-col rounded-[24px] border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="size-12 rounded-[18px]" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-2 h-4 w-2/3 rounded-md" />

          <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
            <Skeleton className="h-12 rounded-[16px]" />
            <Skeleton className="h-12 rounded-[16px]" />
          </div>

          <Skeleton className="mt-4 h-11 w-full rounded-[16px]" />
        </div>
      ))}
    </div>
  );
}

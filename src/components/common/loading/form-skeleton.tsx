import { Skeleton } from "@/components/ui/skeleton";

type FormSkeletonProps = {
  fields?: number;
};

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="w-full rounded-[24px] border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-12 w-full rounded-[16px]" />
          </div>
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-[16px]" />
    </div>
  );
}

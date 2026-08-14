import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Form sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg mb-4" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
        </div>

        <div className="rounded-[24px] border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40 rounded-lg mb-4" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
          <Skeleton className="h-12 w-full rounded-[16px]" />
        </div>
      </div>
    </div>
  );
}

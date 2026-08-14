import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header Bar Skeleton */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 p-4">
        <div className="app-container flex h-10 items-center justify-between">
          <Skeleton className="h-8 w-36 rounded-xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>
      </div>

      <main className="app-container py-10 flex-1 space-y-8">
        {/* Hero / Header Skeleton */}
        <div className="rounded-[28px] border border-border bg-card p-8 shadow-sm space-y-4">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-[24px]" />
          <Skeleton className="h-64 rounded-[24px]" />
          <Skeleton className="h-64 rounded-[24px]" />
        </div>
      </main>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function ProgramDetailsLoading() {
  return (
    <div className="app-container py-10 space-y-8">
      {/* Hero Skeleton */}
      <div className="rounded-[28px] border border-border bg-card p-8 shadow-sm space-y-4">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="flex flex-col gap-6 lg:col-span-8">
          {/* Info cards skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <Skeleton className="size-11 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
            ))}
          </div>

          {/* Content section skeleton */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-4/6 rounded-md" />
          </div>
        </section>

        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <Skeleton className="h-7 w-44 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </aside>
      </div>
    </div>
  );
}

import { CardsGridSkeleton } from "@/components/common/loading/cards-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function FacultiesLoading() {
  return (
    <div className="app-container py-10 space-y-8">
      <div className="rounded-[28px] border border-border bg-card p-8 shadow-sm space-y-4">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3 space-y-4">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </aside>

        <section className="lg:col-span-9">
          <CardsGridSkeleton count={6} />
        </section>
      </div>
    </div>
  );
}

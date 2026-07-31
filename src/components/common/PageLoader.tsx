import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-full space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-11 w-11 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-[320px] w-full rounded-2xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

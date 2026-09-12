import { Skeleton } from "../ui/skeleton";

// Mirrors the question bank level card: icon tile + title row, filter chip
// row, then the subject tile grid.
export function QbSecSkeleton() {
  return (
    <div className="space-y-4 rounded-xl bg-card px-5 py-6 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <Skeleton className="h-5 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-40 h-25 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "../ui/skeleton";

export function QbSecSkeleton() {
  return (
    <div className="space-y-3 bg-input rounded-2xl px-4 py-5">
      <Skeleton className="h-8 w-50 rounded-2xl" />

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-25 rounded-xl" />
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-30 h-30 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

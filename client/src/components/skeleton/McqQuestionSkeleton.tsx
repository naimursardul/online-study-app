import { Skeleton } from "@/components/ui/skeleton";

export function McqQuestionSkeleton() {
  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        {/* top row */}
        <div className="flex justify-between items-start">
          <Skeleton className="size-6 rounded" />
          <Skeleton className="size-8 rounded-full" />
        </div>

        {/* question text */}
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-4/5 rounded" />

        {/* record tag */}
        <div className="flex justify-end">
          <Skeleton className="h-7 w-36 rounded" />
        </div>

        {/* options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-3"
            >
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

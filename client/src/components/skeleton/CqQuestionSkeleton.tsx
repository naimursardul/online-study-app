import { Skeleton } from "@/components/ui/skeleton";

export function CqQuestionSkeleton() {
  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        {/* top row */}
        <div className="flex justify-between items-start">
          <Skeleton className="size-6 rounded" />
          <Skeleton className="size-8 rounded-full" />
        </div>

        {/* statement */}
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-5/6 rounded" />

        {/* record */}
        <div className="flex justify-end">
          <Skeleton className="h-7 w-36 rounded" />
        </div>

        {/* sub questions */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded px-3 py-3 space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="size-5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

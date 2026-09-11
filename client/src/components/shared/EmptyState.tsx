import type { LucideIcon } from "lucide-react";

// The shared "there is genuinely nothing here" state. Kept separate from
// ApiErrorState so a failed load can never be mistaken for an empty list.
export default function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-sidebar-border px-6 py-12 text-center">
      {Icon && <Icon className="size-8 text-muted-foreground" />}
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
    </div>
  );
}

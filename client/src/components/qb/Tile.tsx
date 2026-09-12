import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Tile({ to, name }: { to: string; name: string }) {
  return (
    <Link
      to={to}
      className="group block rounded-xl focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      <div className="flex h-25 max-lg:h-20 w-40 max-lg:w-27 flex-col items-center justify-center gap-2 rounded-xl bg-card p-4 max-lg:p-2 ring-1 ring-foreground/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-primary/30">
        <BookOpen
          className="size-5 max-lg:size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-center text-xs max-lg:text-[11px] font-medium leading-snug text-foreground line-clamp-2">
          {name}
        </span>
      </div>
    </Link>
  );
}

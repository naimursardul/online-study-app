import { Link } from "react-router-dom";
import { cn } from "@/utils/utils";

interface SiteBrandProps {
  className?: string;
  /** Renders as plain markup instead of a link — for use inside the footer. */
  asLink?: boolean;
}

export default function SiteBrand({
  className,
  asLink = true,
}: SiteBrandProps) {
  const content = (
    <>
      <img src="/favicon.svg" alt="" aria-hidden="true" className="size-6" />
      <span className="text-base font-semibold tracking-tight text-foreground">
        Poruya
      </span>
    </>
  );

  if (!asLink) {
    return (
      <div className={cn("flex items-center gap-2", className)}>{content}</div>
    );
  }

  return (
    <Link
      to="/"
      aria-label="Poruya home"
      className={cn(
        "flex items-center gap-2 rounded-lg focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none",
        className,
      )}
    >
      {content}
    </Link>
  );
}

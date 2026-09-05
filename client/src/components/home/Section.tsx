import { cn } from "@/utils/utils";

const WIDTHS = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
} as const;

interface SectionProps {
  children: React.ReactNode;
  /** Max width of the inner container. */
  width?: keyof typeof WIDTHS;
  /** Alternating band background. */
  tinted?: boolean;
  id?: string;
  className?: string;
}

export function Section({
  children,
  width = "6xl",
  tinted = false,
  id,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "px-6 py-20 max-md:py-16",
        tinted && "bg-secondary/50",
        className,
      )}
    >
      <div className={cn("mx-auto", WIDTHS[width])}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-14 max-md:mb-10",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-medium tracking-widest text-brand-text uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-foreground max-md:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

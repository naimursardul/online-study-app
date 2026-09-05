import { cn } from "@/utils/utils";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: React.ReactNode;
}

export function LegalPage({
  title,
  lastUpdated,
  intro,
  children,
}: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 max-md:py-12">
      <h1 className="text-4xl font-bold tracking-tight text-foreground max-sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
      {intro && (
        <p className="mt-6 leading-relaxed text-muted-foreground">{intro}</p>
      )}
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

interface LegalSectionProps {
  heading: string;
  children: React.ReactNode;
  className?: string;
}

export function LegalSection({
  heading,
  children,
  className,
}: LegalSectionProps) {
  return (
    <section className={cn(className)}>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-brand-text [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:ml-4 [&_ul]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

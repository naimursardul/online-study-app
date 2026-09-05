import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Capability facts, not metrics. Each one is verifiable in the app itself.
const HIGHLIGHTS = [
  { value: "6", label: "Question formats" },
  { value: "Board + year", label: "Tagged on every question" },
  { value: "Timed", label: "MCQ exams, graded instantly" },
  { value: "Per topic", label: "Weak spots tracked" },
];

export function HeroSection() {
  return (
    <section className="px-6 pt-16 pb-20 max-md:pt-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-8 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-4 py-1.5 text-sm text-brand-text">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Now in early access — free while we build
        </p>

        <h1 className="mb-5 text-5xl leading-tight font-bold tracking-tight text-foreground max-md:text-4xl max-sm:text-3xl">
          Practise real board questions until nothing surprises you.
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Poruya organises past board and admission questions by subject,
          chapter and topic — then builds you timed MCQ exams that target
          exactly what you keep getting wrong.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="brand" size="xl">
            <Link to="/signup">
              Create free account
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link to="/question-bank">
              <BookOpen className="size-4" aria-hidden="true" />
              Browse the question bank
            </Link>
          </Button>
        </div>

        <p className="mt-4 mb-16 text-xs text-muted-foreground">
          No account needed to look around.
        </p>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="bg-card px-5 py-5 text-center">
              <div className="text-base font-semibold tracking-tight text-foreground">
                {h.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {h.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

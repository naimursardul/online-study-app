import { ArrowUpRight, FileText, Search, Library } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import FadeIn from "./FadeIn";
import { Section, SectionHeading } from "./Section";

const SERVICES = [
  {
    icon: Library,
    title: "Question Bank",
    to: "/question-bank",
    desc: "Browse by level, subject, chapter and topic. Every question is tagged with the institution and year it came from.",
    tag: "Open to everyone",
  },
  {
    icon: Search,
    title: "Question Explorer",
    to: "/question-explorer",
    desc: "Filter across the whole bank at once: institution, year, chapter, topic, difficulty, question type, plus free-text search.",
    tag: "Needs an account",
  },
  {
    icon: FileText,
    title: "Mock Exams",
    to: "/exam",
    desc: "Build a timed MCQ exam from any scope you like, submit, and get scored the moment you're done.",
    tag: "Needs an account",
  },
];

export function ServiceSection() {
  return (
    <Section tinted>
      <SectionHeading
        eyebrow="What's inside"
        title="Three tools, one question bank"
        align="center"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => {
          const Icon = s.icon;
          return (
            <FadeIn key={s.title} delay={i * 80} className="h-full">
              <Link
                to={s.to}
                className="group block h-full rounded-xl focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none"
              >
                <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-brand/30 group-hover:shadow-lg">
                  <CardContent className="p-7">
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-subtle text-brand-text">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-text"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {s.tag}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}

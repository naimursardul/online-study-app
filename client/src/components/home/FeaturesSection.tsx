import {
  Bookmark,
  CalendarClock,
  FolderTree,
  Sigma,
  UserCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "./FadeIn";
import { Section, SectionHeading } from "./Section";

const FEATURES = [
  {
    icon: FolderTree,
    title: "Organised by topic, not by page",
    desc: "Level, background, subject, chapter, topic. Find the exact thing you're stuck on.",
  },
  {
    icon: CalendarClock,
    title: "Institution and year tags",
    desc: "See which board and which year a question came from, and filter by it.",
  },
  {
    icon: Zap,
    title: "Instant grading",
    desc: "Submit and see your score, the correct answers and the explanations immediately.",
  },
  {
    icon: Sigma,
    title: "Maths and figures render properly",
    desc: "LaTeX equations, markdown tables and figure references, not flattened screenshots.",
  },
  {
    icon: Bookmark,
    title: "Collections",
    desc: "Bookmark any question into a folder you name, and come back to it later.",
  },
  {
    icon: UserCheck,
    title: "Human-reviewed",
    desc: "Questions are digitised from real papers with AI assistance, then checked by an editor before they reach the bank.",
  },
];

export function FeaturesSection() {
  return (
    <Section tinted>
      <SectionHeading
        eyebrow="Details that matter"
        title="Small things, done properly"
        description="Most of these only matter once you've used a question bank that got them wrong."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <FadeIn key={f.title} delay={i * 60} className="h-full">
              <Card className="h-full transition-all duration-300 hover:ring-brand/30 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand-subtle text-brand-text">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}

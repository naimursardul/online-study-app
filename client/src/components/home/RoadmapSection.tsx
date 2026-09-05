import { Check, Hammer } from "lucide-react";
import FadeIn from "./FadeIn";
import { Section, SectionHeading } from "./Section";

const LIVE = [
  "Question bank with institution and year tagging",
  "Question explorer with full filtering and search",
  "Timed MCQ mock exams with instant grading",
  "Weak-topic exam mode",
  "Collections for saved questions",
  "Performance and weak-topic dashboard",
];

const IN_PROGRESS = [
  "Doubt — ask a question, get an answer",
  "Recorded lessons",
  "SMS verification on signup",
  "More subjects and papers in the bank",
];

export function RoadmapSection() {
  return (
    <Section width="4xl">
      <SectionHeading
        eyebrow="Where we are"
        title="We just launched. Here's exactly where we are."
        description="No student numbers, no success-rate claims and no testimonials, because we don't have them yet. This is the honest version."
        align="center"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FadeIn className="h-full">
          <div className="h-full rounded-2xl border border-border bg-card p-7">
            <h3 className="mb-5 flex items-center gap-2 font-semibold text-foreground">
              <Check className="size-4 text-brand-text" aria-hidden="true" />
              Live today
            </h3>
            <ul className="space-y-3">
              {LIVE.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={80} className="h-full">
          <div className="h-full rounded-2xl border border-dashed border-border bg-secondary/40 p-7">
            <h3 className="mb-5 flex items-center gap-2 font-semibold text-foreground">
              <Hammer
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              In progress
            </h3>
            <ul className="space-y-3">
              {IN_PROGRESS.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full border border-muted-foreground"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

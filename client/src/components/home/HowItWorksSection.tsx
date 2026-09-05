import FadeIn from "./FadeIn";
import { Section, SectionHeading } from "./Section";

const STEPS = [
  {
    title: "Pick your level and subject",
    desc: "Choose your level and background once. Poruya shows the subjects, chapters and topics that apply to you.",
  },
  {
    title: "Practise or generate an exam",
    desc: "Work through the bank question by question, or build a timed MCQ exam: pick chapters, difficulty and how many questions you want.",
  },
  {
    title: "Fix what's weak",
    desc: "Every submission updates a per-topic record of what you got right. Ask for a weak-topic exam and it pulls mostly from the topics you're behind on.",
  },
];

export function HowItWorksSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="How it works"
        title="Three steps, no setup"
        align="center"
      />

      <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="bg-card">
            <FadeIn delay={i * 80} className="h-full p-7">
              <span className="text-sm font-semibold text-brand-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </FadeIn>
          </li>
        ))}
      </ol>
    </Section>
  );
}

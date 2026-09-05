import { Target, Timer, TrendingUp } from "lucide-react";
import FadeIn from "./FadeIn";
import { Section } from "./Section";

const POINTS = [
  {
    icon: Timer,
    title: "You choose the scope",
    desc: "Pick a subject, narrow to chapters or topics, choose Easy, Medium, Hard or Mix, and set the size anywhere from 1 to 100 questions.",
  },
  {
    icon: Target,
    title: "Weak-topic mode",
    desc: "Instead of sampling evenly, it weights the draw toward the topics you're behind on — so a 20-question exam is 20 questions that matter.",
  },
  {
    icon: TrendingUp,
    title: "Progress you can read",
    desc: "Your dashboard tracks your last 20 exams — average, best, latest and whether you're improving — plus a correct-vs-total record for every topic you've touched.",
  },
];

// Illustrative only — no fetch, no real user data. Labelled as an example in
// the UI so it can't be mistaken for platform statistics.
const EXAMPLE_TOPICS = [
  { topic: "Chemical Bonding", correct: 4, total: 12 },
  { topic: "Periodic Table", correct: 9, total: 15 },
  { topic: "Mole Concept", correct: 17, total: 18 },
];

export function ExamSection() {
  return (
    <Section>
      <div className="grid items-center gap-12 md:grid-cols-2">
        <FadeIn>
          <p className="mb-3 text-xs font-medium tracking-widest text-brand-text uppercase">
            Exams &amp; analytics
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground max-md:text-2xl">
            Exams that aim at your weak spots
          </h2>

          <ul className="mt-8 space-y-6">
            {POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="flex gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {p.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 text-sm text-muted-foreground">
            You can hold two ungraded exams at a time, so exams don't pile up
            unfinished.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Example dashboard
            </p>

            <div
              className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border"
              aria-hidden="true"
            >
              {[
                { k: "Average", v: "68%" },
                { k: "Best", v: "84%" },
                { k: "Latest", v: "75%" },
              ].map((s) => (
                <div key={s.k} className="bg-card px-3 py-4 text-center">
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {s.v}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 mb-3 text-sm font-medium text-foreground">
              Weakest topics
            </p>
            <ul className="space-y-3" aria-hidden="true">
              {EXAMPLE_TOPICS.map((t) => {
                const pct = Math.round((t.correct / t.total) * 100);
                return (
                  <li key={t.topic}>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="text-foreground">{t.topic}</span>
                      <span className="text-muted-foreground">
                        {t.correct}/{t.total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 text-xs text-muted-foreground">
              Illustration — your own numbers appear once you submit an exam.
            </p>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

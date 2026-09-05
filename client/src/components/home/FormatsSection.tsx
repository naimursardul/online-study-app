import { Sigma, Table2, Image } from "lucide-react";
import FadeIn from "./FadeIn";
import { Section, SectionHeading } from "./Section";

// Mirrors QUESTION_TYPE_CODES in server/src/utils/question-types.ts
const FORMATS = [
  { code: "MCQ", label: "বহুনির্বাচনি প্রশ্ন", note: "4 options" },
  { code: "CQ", label: "সৃজনশীল প্রশ্ন", note: "4 parts" },
  { code: "Math-CQ", label: "গণিত সৃজনশীল", note: "3 parts" },
  { code: "SQ", label: "Short question", note: "Model answer" },
  { code: "EQ", label: "English question", note: "Model answer" },
  { code: "WQ", label: "Written question", note: "Model answer" },
];

const RENDERING = [
  { icon: Sigma, text: "LaTeX equations, not screenshots of equations" },
  { icon: Table2, text: "Markdown tables that stay readable on a phone" },
  { icon: Image, text: "Figure references kept with the question" },
];

export function FormatsSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Question formats"
        title="Six formats, the way your paper actually looks"
        description="Board papers aren't all multiple choice, so the bank isn't either. Creative and written questions are stored with their model answers."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FORMATS.map((f, i) => (
          <FadeIn key={f.code} delay={i * 50}>
            <div className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4">
              <div>
                <span className="font-semibold text-foreground">{f.code}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {f.label}
                </span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {f.note}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={120}>
        <p className="mt-6 rounded-xl bg-brand-subtle px-5 py-4 text-sm text-brand-text">
          Mock exams are MCQ-only for now. CQ, Math-CQ and written questions
          live in the bank with model answers for practice.
        </p>
      </FadeIn>

      <FadeIn delay={160}>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {RENDERING.map((r) => {
            const Icon = r.icon;
            return (
              <li
                key={r.text}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-foreground"
                  aria-hidden="true"
                />
                {r.text}
              </li>
            );
          })}
        </ul>
      </FadeIn>
    </Section>
  );
}

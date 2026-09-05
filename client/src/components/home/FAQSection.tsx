import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import FadeIn from "./FadeIn";
import { Separator } from "../ui/separator";
import { Section, SectionHeading } from "./Section";

const FAQS = [
  {
    q: "Is Poruya free?",
    a: "Yes, free while we're in early access. There's no payment system in the app at all yet, so there's nothing to cancel and no card to enter. If we add paid plans later, we'll say so well before we do.",
  },
  {
    q: "What's actually in the question bank right now?",
    a: "It grows as we digitise papers. Rather than quote a number, the question bank is public — open it and see the exact subjects and chapters we cover before you sign up.",
  },
  {
    q: "How do I create an account?",
    a: "With your phone number and a password. No email needed.",
  },
  {
    q: "Can I take CQ or written exams?",
    a: "Not yet. Mock exams are MCQ-only. CQ, Math-CQ, SQ, EQ and WQ are all in the bank with model answers, so you can still practise them question by question.",
  },
  {
    q: "Who writes the answers and explanations?",
    a: "Questions come from real past papers. We use AI to read and structure the papers, then an editor reviews every question and its explanation before it gets published. Nothing goes in unreviewed.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. It's a website, so there's nothing to install, and it works in both light and dark mode.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section width="3xl" tinted>
      <SectionHeading eyebrow="Answers" title="Questions we expect" align="center" />

      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <FadeIn key={f.q} delay={i * 60}>
            <Collapsible
              open={openIndex === i}
              onOpenChange={(open) => setOpenIndex(open ? i : null)}
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none">
                  <span className="text-sm font-medium text-foreground">
                    {f.q}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-4 shrink-0 transition-transform duration-200 ${
                      openIndex === i
                        ? "rotate-180 text-brand-text"
                        : "text-muted-foreground"
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <p className="px-6 py-4 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

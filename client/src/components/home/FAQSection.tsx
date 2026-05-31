import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import FadeIn from "./FadeIn";
import { Separator } from "../ui/separator";

const FAQS = [
  {
    q: "Is the platform free to use?",
    a: "We offer a generous free tier with access to a subset of questions and one mock exam per month. Premium unlocks everything.",
  },
  {
    q: "How are questions verified?",
    a: "Every question goes through a two-step review by subject-matter experts before it appears in the question bank.",
  },
  {
    q: "Can I access it on mobile?",
    a: "Yes — the platform is fully responsive and we're building a dedicated mobile app launching this year.",
  },
  {
    q: "Do you cover all boards?",
    a: "We currently support all major Bangladeshi boards including Dhaka, Chittagong, Rajshahi, and Sylhet.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Answers
          </p>
          <h2 className="text-3xl max-md:text-2xl font-bold text-foreground tracking-tight">
            Frequently Asked
          </h2>
        </FadeIn>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <FadeIn key={f.q} delay={i * 60}>
              <Collapsible
                open={openIndex === i}
                onOpenChange={(open) => setOpenIndex(open ? i : null)}
              >
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <CollapsibleTrigger className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground text-sm">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Separator />
                    <p className="px-6 py-4 text-sm text-muted-foreground leading-relaxed">
                      {f.a}
                    </p>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

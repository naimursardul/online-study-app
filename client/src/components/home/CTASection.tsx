import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FadeIn from "./FadeIn";
import { Section } from "./Section";

export function CTASection() {
  return (
    <Section width="4xl">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-16">
          {/* subtle dot pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/70">
              <GraduationCap className="size-3.5" aria-hidden="true" />
              Free while we're in early access
            </p>

            <h2 className="mb-4 text-3xl font-bold tracking-tight max-md:text-2xl">
              Start with one exam.
            </h2>

            <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-primary-foreground/60">
              Create an account with your phone number, pick a subject, and
              generate your first timed exam in under a minute. No card, no
              trial timer.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="secondary" size="xl">
                <Link to="/signup">Create free account</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="xl"
                className="border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/question-bank">Browse questions first</Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FadeIn from "./FadeIn";

export function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="rounded-3xl bg-primary text-primary-foreground px-8 md:px-16 py-16 text-center relative overflow-hidden">
            {/* subtle dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/70 text-sm mb-6 border border-primary-foreground/15">
                <GraduationCap className="w-3.5 h-3.5" />
                Start for free today
              </div>

              <h2 className="text-3xl max-md:text-2xl font-bold tracking-tight mb-4">
                Ready to ace your exams?
              </h2>

              <p className="text-primary-foreground/60 max-w-md mx-auto leading-relaxed mb-10 text-sm">
                Join over 50,000 students already using Wikeebly to study
                smarter. No credit card required.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-xl font-semibold"
                >
                  <Link to="/signup">Create free account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-xl text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10"
                >
                  <Link to="/contact">Talk to us</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

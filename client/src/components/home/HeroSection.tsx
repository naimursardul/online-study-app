import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const STATS = [
  { value: "50K+", label: "Active Students" },
  { value: "10K+", label: "Questions Solved" },
  { value: "95%", label: "Success Rate" },
  { value: "500+", label: "Expert Educators" },
];

export function HeroSection() {
  return (
    <section className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm mb-8 border border-border">
          <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
          Welcome to your learning journey
        </div>

        {/* Headline */}
        <h1 className="text-5xl max-md:text-4xl max-sm:text-3xl font-bold tracking-tight text-foreground leading-tight mb-5">
          Master Any Subject
          <br />
          <span className="text-muted-foreground">with Ease</span>
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
          Thousands of verified questions, adaptive mock exams, and expert-made
          lessons — all in one place built for Bangladeshi students.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Button asChild size="lg" className="rounded-xl font-medium">
            <Link to="/question-bank">
              <BookOpen className="w-4 h-4 mr-2" />
              Explore Questions
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-xl font-medium"
          >
            <Link to="/exam">
              Practice Exams
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card px-6 py-5 text-center">
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

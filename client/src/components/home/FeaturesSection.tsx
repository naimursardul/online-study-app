import {
  Target,
  BookOpen,
  BarChart3,
  Lightbulb,
  Zap,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FadeIn from "./FadeIn";

const FEATURES = [
  {
    icon: Target,
    title: "Adaptive Learning",
    desc: "Questions adjust to your level in real time based on your performance.",
  },
  {
    icon: BookOpen,
    title: "Curated Content",
    desc: "Hand-verified by subject experts every semester — no outdated material.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track weak topics and measure progress with detailed charts.",
  },
  {
    icon: Lightbulb,
    title: "Smart Hints",
    desc: "Step-by-step breakdowns that explain the why, not just the answer.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    desc: "Get scores and explanations the moment you submit.",
    badge: "Coming Soon",
  },
  {
    icon: CheckCircle,
    title: "Verified Accuracy",
    desc: "Every answer double-checked before it ever reaches the question bank.",
    badge: "Coming Soon",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="max-w-2xl mb-14">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Built differently
          </p>
          <h2 className="text-3xl max-md:text-2xl font-bold text-foreground tracking-tight mb-4">
            Why Choose Us?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Every feature is designed around the way real students study — not
            the way textbooks teach.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 max-sm:grid-cols-1 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={f.title} delay={i * 60}>
                <Card className="h-full border-border hover:border-foreground/20 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground mb-4">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {f.title}
                      </h3>
                      {f.badge && (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {f.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

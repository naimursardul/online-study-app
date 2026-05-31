import { Video, FileText, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FadeIn from "./FadeIn";

const SERVICES = [
  {
    icon: Video,
    title: "Recorded Classes",
    desc: "Access high-quality video lessons at your own pace, reviewed and updated every semester.",
    tag: "On-demand",
  },
  {
    icon: FileText,
    title: "Board Questions",
    desc: "Curated question banks from every major board exam, organized by year and topic.",
    tag: "10K+ Questions",
  },
  {
    icon: BadgeCheck,
    title: "Online MCQ Exams",
    desc: "Timed mock exams with instant feedback, detailed explanations, and performance tracking.",
    tag: "Live scoring",
  },
];

export function ServiceSection() {
  return (
    <section className="py-20 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            What we offer
          </p>
          <h2 className="text-3xl max-md:text-2xl font-bold text-foreground tracking-tight">
            Our Services
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeIn key={s.title} delay={i * 80}>
                <Card className="group h-full border-border hover:border-foreground/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-7">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-foreground mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="mb-4 text-xs font-medium"
                    >
                      {s.tag}
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {s.desc}
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

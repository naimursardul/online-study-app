import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FadeIn from "./FadeIn";

const TESTIMONIALS = [
  {
    name: "Rida Hossain",
    role: "HSC Candidate, Dhaka",
    quote:
      "The question bank saved me weeks of revision. I could finally focus on weak topics instead of hunting for practice papers.",
    stars: 5,
    initials: "RH",
  },
  {
    name: "Tamim Chowdhury",
    role: "Medical Aspirant",
    quote:
      "Mock exams feel exactly like the real thing. My confidence before the admission test was at an all-time high.",
    stars: 5,
    initials: "TC",
  },
  {
    name: "Nusrat Jahan",
    role: "SSC Student, Chittagong",
    quote:
      "The explanations are clear and concise. I finally understand why I was getting math questions wrong.",
    stars: 5,
    initials: "NJ",
  },
  {
    name: "Arif Rahman",
    role: "Engineering Aspirant",
    quote:
      "I love that content is updated every semester. Never studying outdated material again.",
    stars: 4,
    initials: "AR",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < count
              ? "fill-foreground text-foreground"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Student stories
          </p>
          <h2 className="text-3xl max-md:text-2xl font-bold text-foreground tracking-tight">
            What Our Students Say
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 max-sm:grid-cols-1 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 80}>
              <Card className="h-full border-border">
                <CardContent className="p-7">
                  <StarRating count={t.stars} />
                  <blockquote className="mt-4 mb-5 text-foreground/80 leading-relaxed text-sm">
                    "{t.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

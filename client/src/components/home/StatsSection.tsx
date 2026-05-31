import { Users, BookOpen, Award, TrendingUp } from "lucide-react";

const stats = [
  {
    value: "50K+",
    label: "Active Students",
    icon: Users,
  },
  {
    value: "10K+",
    label: "Questions Solved",
    icon: BookOpen,
  },
  {
    value: "95%",
    label: "Success Rate",
    icon: Award,
  },
  {
    value: "500+",
    label: "Expert Educators",
    icon: TrendingUp,
  },
];

export default function StatsSection() {
  return (
    <section className="globPad mt-16">
      <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-12 max-md:p-8">
        <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-2 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="p-3 rounded-full bg-primary/20">
                  <Icon className="text-primary size-6" />
                </div>
                <div>
                  <h3 className="text-3xl max-md:text-2xl font-bold text-primary">
                    {stat.value}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

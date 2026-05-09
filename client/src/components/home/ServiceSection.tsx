import { Video, FileText, CircleHelp, BadgeCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    title: "Recorded Class",
    icon: Video,
  },
  {
    title: "Board Question Solve",
    icon: FileText,
  },
  {
    title: "QNA",
    icon: CircleHelp,
  },
  {
    title: "Online MCQ Exam",
    icon: BadgeCheck,
  },
];

export default function ServiceSection() {
  return (
    <section className="globPad flex flex-col gap-10 items-center mt-12.5 bg-secondary rounded-3xl p-10">
      <div className="flex flex-col gap-3 justify-center text-center max-w-3xl">
        <h2 className="text-4xl font-bold text-primary">Our Services</h2>
        <p className="text-muted-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus
          voluptas reiciendis inventore laborum qui aliquam enim, tenetur fuga
          maxime neque dolores illo nesciunt consequuntur. Lorem ipsum dolor sit
          amet, consectetur adipisicing elit. Recusandae, dicta?
        </p>
      </div>

      <div className="w-full grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <Card
              key={index}
              className="cursor-pointer group bg-card border-border transition-all duration-300 hover:shadow-xl hover:bg-secondary"
            >
              <CardContent className="h-45 flex flex-col gap-4 items-center justify-center text-center px-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Icon className="text-primary size-6" />
                </div>

                <span className="text-foreground text-md max-md:text-sm font-medium">
                  {service.title}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

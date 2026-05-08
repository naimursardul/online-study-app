import { Search, CircleHelp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="globPad flex max-md:flex-col gap-25 max-md:gap-12.5 items-center">
      <div className="w-full max-md:text-center space-y-4">
        <h1 className="text-5xl max-md:text-4xl font-bold text-primary leading-tight">
          Welcome to Brand Name.
        </h1>

        <p className="text-muted-foreground text-base leading-7">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore fugiat
          illo odit sint eos. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Iste sit hic quae corrupti praesentium saepe ipsum odio quisquam
          eligendi pariatur ducimus soluta necessitatibus, accusamus voluptate
          in sequi? Nihil, inventore velit?
        </p>
      </div>

      <div className="w-full flex flex-col justify-center items-center gap-4">
        <Card className="w-full bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <CardContent>
            <Button
              asChild
              variant="ghost"
              className="w-full h-30 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold text-foreground hover:bg-secondary"
            >
              <Link to="/questions">
                <Search className="size-5 text-primary" />
                <span>Find questions</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md">
          <CardContent>
            <Button
              asChild
              variant="ghost"
              className="w-full h-30 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold text-foreground hover:bg-secondary"
            >
              <Link to="/ask-question">
                <CircleHelp className="size-5 text-primary" />
                <span>Ask questions</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

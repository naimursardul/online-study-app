import { Card, CardContent } from "@/components/ui/card";

export default function AboutProfile() {
  return (
    <Card className="bg-card border-border py-0">
      <CardContent className="flex gap-10 max-md:flex-col p-8 max-sm:p-6">
        <div className="w-full">
          <div className="relative w-62.5 h-62.5 max-sm:w-50 max-sm:h-50 mx-auto">
            <img
              src="/aboutme.png"
              alt="Naimur Rahman"
              className="rounded-full bg-secondary border border-border object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xl font-medium text-foreground">Naimur Rahman</p>

            <p className="text-muted-foreground">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Veniam
              autem eligendi fuga unde dolorum! Mollitia unde sunt sed soluta
              qui! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Voluptatibus, reprehenderit.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-primary">Contacts:</h3>

            <p className="text-muted-foreground flex flex-wrap justify-between min-w-50">
              <span className="text-foreground">Email:</span>
              naimur@gmail.com
            </p>

            <p className="text-muted-foreground flex gap-1 justify-between min-w-50">
              <span className="text-foreground">Phone:</span>
              01407348304
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Contact2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  return (
    <Card className="my-10 w-125 max-sm:w-[80%] mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-primary text-3xl font-normal">
          <Contact2 />
          <span>Contact us</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action="#" className="flex flex-col gap-4">
          <Input
            type="text"
            name="name"
            placeholder="Name"
            className="bg-secondary text-foreground border-border"
          />

          <Input
            type="email"
            name="email"
            placeholder="Email"
            className="bg-secondary text-foreground border-border"
          />

          <Textarea
            name="message"
            placeholder="Message"
            className="min-h-40 bg-secondary text-foreground border-border"
          />

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { Contact2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SubmitBtn from "@/components/submit-btn/submit-btn";
import { client } from "@/utils/utils";
import { toast } from "sonner";

// Bounds mirror the server's contact schema so the two can't disagree.
const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email(),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export default function Contact() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data } = await client.post("/contact", values);

      if (data.success) {
        toast.success(
          data.message || "Message sent. We'll get back to you soon.",
        );
        form.reset();
        return;
      }
      toast.error(data.message || "Something went wrong. Please try again.");
    } catch (error) {
      console.log(error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "There is a problem with the server.");
    }
  };

  return (
    <Card className="my-10 w-125 max-sm:w-[80%] mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-primary text-3xl font-normal">
          <Contact2 />
          <span>Contact us</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Name"
                      className="bg-secondary text-foreground border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      className="bg-secondary text-foreground border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Message"
                      className="min-h-40 bg-secondary text-foreground border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SubmitBtn loading={form.formState.isSubmitting} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

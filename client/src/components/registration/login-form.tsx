"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import SubmitBtn from "../submit-btn";
import { Card } from "../ui/card";
import Link from "next/link";
import { IRegistrationFormField } from "@/lib/type";
import { toast } from "sonner";
import { RedirectType, redirect } from "next/navigation";

// ✅ Zod Schema
const formSchema = z.object({
  phone: z.string().regex(/^01\d{9}$/, {
    message: "Phone must start with 01 and be 11 digits.",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({ ...values }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Failed to Login.");
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error("Problem with the server.");
      return;
    }
    redirect("/", RedirectType.replace);
  };

  // ✅ Form Field Configs
  const fields: IRegistrationFormField[] = [
    {
      name: "phone",
      label: "Phone",
      placeholder: "01xxxxxxxxx",
      type: "text",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "••••••••",
      type: "password",
    },
  ];

  return (
    <div className="flex justify-center mt-20">
      <Form {...form}>
        <Card className="w-[350px] p-8 max-md:w-[320px] max-md:px-6">
          {/* 🔽 Form heading */}
          <h2 className="text-xl font-semibold text-center mb-3">Login Form</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((fieldConfig) => (
              <FormField
                key={fieldConfig.name}
                control={form.control}
                name={fieldConfig.name as keyof z.infer<typeof formSchema>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fieldConfig.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={fieldConfig.type}
                        placeholder={fieldConfig.placeholder}
                        {...field}
                      />
                    </FormControl>
                    {fieldConfig?.description && (
                      <FormDescription>
                        {fieldConfig.description}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <SubmitBtn />

            {/* 🔽 Signup link for new user */}
            <p className="text-sm text-center text-muted-foreground">
              {"Don't have any account? "}
              <Link
                href="/signup"
                className="text-primary underline hover:opacity-80"
              >
                Signup
              </Link>
            </p>
          </form>
        </Card>
      </Form>
    </div>
  );
}

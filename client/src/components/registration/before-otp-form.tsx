"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import SubmitBtn from "../submit-btn";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

// ✅ Form schema
const formSchema = z.object({
  phone: z.string().regex(/^01\d{9}$/, {
    message: "Phone must start with 01 and be 11 digits.",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

// ✅✅ MAIN FUNCTION
export default function BeforeOtpForm({
  setStep,
  setPhone,
}: {
  setStep: Dispatch<SetStateAction<"0" | "-350px" | "-700px">>;
  setPhone: Dispatch<SetStateAction<string>>;
}) {
  // ✅ Form Field Configs
  const fields = [
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

  // ✅ form initialization
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  // ✅ Form submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/auth/send-otp`,
        {
          method: "POST",
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setPhone(values.phone);
        setStep("-350px");
        return;
      }
      toast.error(data.message || "Something went wrong. Please try again.");
    } catch (error) {
      console.log(error);
      toast.error("There is a problem with the server.");
    }
  };

  return (
    <Form {...form}>
      {/* 🔽 Form heading */}
      <h2 className="text-xl font-semibold text-center mb-3">Signup Form</h2>
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
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <SubmitBtn />

        {/* 🔽 Login link for existing users */}
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary underline hover:opacity-80"
          >
            Login
          </Link>
        </p>
      </form>
    </Form>
  );
}

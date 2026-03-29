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
import { toast } from "sonner";
import type { Dispatch, SetStateAction } from "react";
import { client } from "@/lib/utils";
import SubmitBtn from "../submit-btn/submit-btn";
import { Link } from "react-router-dom";

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
  setStep: Dispatch<SetStateAction<1 | 2 | 3>>;
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
    try {
      const res = await client.post(`/auth/send-otp`, { ...values });

      const { data } = res;

      if (data.success) {
        setPhone(values.phone);
        setStep(2);
        return;
      }
      toast.error(data.message || "Something went wrong. Please try again.");
      return;
    } catch (error) {
      console.log(error);
      toast.error("There is a problem with the server.");
      return;
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
          <Link to="/login" className="text-primary underline hover:opacity-80">
            Login
          </Link>
        </p>
      </form>
    </Form>
  );
}

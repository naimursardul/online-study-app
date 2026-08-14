import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
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
import { useNavigate } from "react-router-dom";
import { client } from "@/utils/utils";
import SubmitBtn from "../submit-btn/submit-btn";

// min(6) mirrors the server's password rule so the two can't disagree.
const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function NewPasswordForm({
  phone,
  otp,
}: {
  phone: string;
  otp: string;
}) {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await client.post(`/auth/reset-password`, {
        phone,
        otp,
        password: values.password,
      });

      const { data } = res;

      if (!data.success) {
        toast.error(data.message || "Failed to reset password.");
        return;
      }
      toast.success("Password reset successfully! Please log in.");
      navigate("/login", { replace: true });
      return;
    } catch (error) {
      console.log(error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "There is a problem with the server.");
      return;
    }
  };

  const fields = [
    { name: "password", label: "New Password", placeholder: "••••••••" },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      placeholder: "••••••••",
    },
  ];

  return (
    <Form {...form}>
      {/* 🔽 Form heading */}
      <h2 className="text-xl font-semibold text-center mb-3">
        Set a New Password
      </h2>
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
                    type="password"
                    placeholder={fieldConfig.placeholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <SubmitBtn loading={form.formState.isSubmitting} />
      </form>
    </Form>
  );
}

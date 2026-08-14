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
import type { Dispatch, SetStateAction } from "react";
import { client } from "@/utils/utils";
import SubmitBtn from "../submit-btn/submit-btn";
import { Link } from "react-router-dom";

// ✅ Form schema — matches the phone rule used across auth (server + client).
const formSchema = z.object({
  phone: z.string().regex(/^01\d{9}$/, {
    message: "Phone must start with 01 and be 11 digits.",
  }),
});

export default function PhoneForm({
  setStep,
  setPhone,
}: {
  setStep: Dispatch<SetStateAction<1 | 2 | 3>>;
  setPhone: Dispatch<SetStateAction<string>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await client.post(`/auth/forgot-password`, { ...values });

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
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "There is a problem with the server.");
      return;
    }
  };

  return (
    <Form {...form}>
      {/* 🔽 Form heading */}
      <h2 className="text-xl font-semibold text-center mb-3">
        Forgot Password
      </h2>
      <p className="text-sm text-center text-muted-foreground mb-4">
        Enter your phone number and we&apos;ll send you a code to reset your
        password.
      </p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="text" placeholder="01xxxxxxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitBtn loading={form.formState.isSubmitting} />

        {/* 🔽 Back to login */}
        <p className="text-sm text-center text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="text-primary underline hover:opacity-80">
            Login
          </Link>
        </p>
      </form>
    </Form>
  );
}

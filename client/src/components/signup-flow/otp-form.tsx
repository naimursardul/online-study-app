import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import type { Dispatch, SetStateAction } from "react";
import { client } from "@/lib/utils";
import SubmitBtn from "../submit-btn/submit-btn";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

export default function OtpForm({
  setStep,
  phone,
}: {
  setStep: Dispatch<SetStateAction<1 | 2 | 3>>;
  phone: string;
}) {
  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof otpSchema>) => {
    console.log("OTP Submitted:", values.otp);
    try {
      const res = await client.post(`/auth/verify-otp`, {
        phone: phone,
        otp: values.otp,
      });

      const { data } = res;

      if (!data.success) {
        toast.error(data.message || "Failed to submit OTP");
        return;
      }
      setStep(3);
      toast.success("OTP submitted successfully!");
      return;
    } catch (error) {
      console.log(error);
      toast.error("There is a problem with the server.");
    }
  };

  return (
    <div className="flex justify-center mt-20">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 justify-center items-center"
        >
          <h2 className="text-xl font-semibold text-center">
            Enter the 6-digit code
          </h2>

          <p className="text-sm text-muted-foreground text-center">
            {"We've sent a code to "}
            <span className="font-medium">+88{phone}</span>
            <Button
              type="button"
              variant="link"
              className="text-sm ml-2 p-0 h-auto"
              onClick={() => {
                setStep(1);
              }}
            >
              Edit
            </Button>
          </p>

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SubmitBtn />

          <p className="text-sm text-muted-foreground">
            {"Didn’t get the code? "}
            <button
              type="button"
              className="text-primary underline hover:opacity-80"
              onClick={() => toast.info("Resending code...")}
            >
              Resend
            </button>
          </p>
        </form>
      </Form>
    </div>
  );
}

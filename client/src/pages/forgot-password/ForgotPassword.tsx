import NewPasswordForm from "@/components/forgot-password-flow/new-password-form";
import PhoneForm from "@/components/forgot-password-flow/phone-form";
import ResetOtpForm from "@/components/forgot-password-flow/reset-otp-form";
import { Card } from "@/components/ui/card";
import { useState } from "react";

// Password recovery wizard: phone -> OTP -> new password. Mirrors the signup
// flow's sliding-card scaffold, minus the level/background lookups.
export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  // OTP is verified in step 2 and re-sent with the new password in step 3.
  const [otp, setOtp] = useState("");

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-[320px] overflow-hidden">
        <div
          className="flex gap-1 transition-transform duration-300 "
          style={{ transform: `translateX(-${(step - 1) * 324}px)` }}
        >
          {/* STEP 1 */}
          <Card className="border min-w-[320px] p-8 max-md:px-6">
            <PhoneForm setStep={setStep} setPhone={setPhone} />
          </Card>

          {/* STEP 2 */}
          <Card className="border min-w-[320px] p-8 max-md:px-6">
            <ResetOtpForm setStep={setStep} setOtp={setOtp} phone={phone} />
          </Card>

          {/* STEP 3 */}
          <Card className="border min-w-[320px] p-8 max-md:px-6">
            <NewPasswordForm phone={phone} otp={otp} />
          </Card>
        </div>
      </div>
    </div>
  );
}

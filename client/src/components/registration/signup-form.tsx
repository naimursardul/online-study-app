"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import BeforeOtpForm from "./before-otp-form";
import OtpForm from "./otp-form";
import AfterOtpForm from "./after-otp-form";
import { IBackground, ILevel } from "@/lib/type";

export default function SignupForm({
  levelOptions,
  backgroundOptions,
}: {
  levelOptions: (ILevel & { _id: string })[];
  backgroundOptions: (IBackground & { _id: string })[];
}) {
  const [step, setStep] = useState<"0" | "-350px" | "-700px">("0");
  const [phone, setPhone] = useState<string>("");

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-[350px] max-md:w-[320px] overflow-hidden">
        <div
          className="flex  -translate-x-[350px]"
          style={{ translate: `${step} 0` }}
        >
          <Card className="min-w-[350px] p-8 max-md:min-w-[320px] max-md:px-6">
            <BeforeOtpForm setStep={setStep} setPhone={setPhone} />
          </Card>

          <Card className="min-w-[350px] p-8 max-md:min-w-[320px] max-md:px-6">
            <OtpForm setStep={setStep} phone={phone} />
          </Card>

          <Card className="min-w-[350px] p-8 max-md:min-w-[320px] max-md:px-6">
            <AfterOtpForm
              levelOptions={levelOptions}
              backgroundOptions={backgroundOptions}
              phone={phone}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

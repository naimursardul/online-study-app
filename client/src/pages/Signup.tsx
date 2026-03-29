import Loader from "@/components/loader/Loader";
import AfterOtpForm from "@/components/signup-flow/after-otp-form";
import BeforeOtpForm from "@/components/signup-flow/before-otp-form";
import OtpForm from "@/components/signup-flow/otp-form";
import { Card } from "@/components/ui/card";
import { getDataForOptions } from "@/lib/helper";
import type { IBackground, ILevel } from "@/types/types";
import { useEffect, useState } from "react";

type Level = ILevel & { _id: string };
type Background = IBackground & { _id: string };

export default function Signup() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");

  const [levelOptions, setLevelOptions] = useState<Level[]>([]);
  const [backgroundOptions, setBackgroundOptions] = useState<Background[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // prevent state update after unmount

    const fetchData = async () => {
      try {
        setLoading(true);

        // 🚀 Parallel requests (FASTER)
        const [levels, backgrounds] = await Promise.all([
          getDataForOptions<Level>("level"),
          getDataForOptions<Background>("background"),
        ]);

        if (!isMounted) return;

        setLevelOptions(levels);
        setBackgroundOptions(backgrounds);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  console.log(step);

  // 🔄 Loading UI
  if (loading) return <Loader />;

  // ❌ Error UI
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="min-w-87.5 max-md:w-[320px] overflow-hidden">
        <div
          className="flex max-w-[320px] transition-transform duration-300 "
          style={{ transform: `translateX(-${(step - 1) * 350}px)` }}
        >
          {/* STEP 1 */}
          <Card className="border min-w-87.5 p-8 max-md:min-w-[320px] max-md:px-6">
            <BeforeOtpForm setStep={setStep} setPhone={setPhone} />
          </Card>

          {/* STEP 2 */}
          <Card className="border min-w-87.5 p-8 max-md:min-w-[320px] max-md:px-6">
            <OtpForm setStep={setStep} phone={phone} />
          </Card>

          {/* STEP 3 */}
          <Card className="border min-w-87.5 p-8 max-md:min-w-[320px] max-md:px-6">
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

import Loader from "@/components/loader/Loader";
import AfterOtpForm from "@/components/signup-flow/after-otp-form";
import BeforeOtpForm from "@/components/signup-flow/before-otp-form";
import OtpForm from "@/components/signup-flow/otp-form";
import { Card } from "@/components/ui/card";
import ApiErrorState from "@/components/shared/ApiErrorState";
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
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true; // prevent state update after unmount

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [levels, backgrounds] = await Promise.all([
          getDataForOptions<Level>("level"),
          getDataForOptions<Background>("background"),
        ]);

        if (!isMounted) return;

        setLevelOptions(levels);
        setBackgroundOptions(backgrounds);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [reloadToken]);

  // 🔄 Loading UI
  if (loading) return <Loader />;

  // ❌ Error UI — reachable now that getDataForOptions throws; without the
  // retry the only way past a failed load was a full page reload.
  if (error)
    return (
      <div className="mx-auto max-w-sm">
        <ApiErrorState
          message={error}
          onRetry={() => setReloadToken((t) => t + 1)}
        />
      </div>
    );

  return (
    <div className="flex justify-center items-center">
      <div className="w-[320px] overflow-hidden">
        <div
          className="flex gap-1 transition-transform duration-300 "
          style={{ transform: `translateX(-${(step - 1) * 324}px)` }}
        >
          {/* STEP 1 */}
          <Card className="border min-w-[320px] p-8 max-md:px-6">
            <BeforeOtpForm setStep={setStep} setPhone={setPhone} />
          </Card>

          {/* STEP 2 */}
          <Card className="border min-w-[320px] p-8 max-md:px-6">
            <OtpForm setStep={setStep} phone={phone} />
          </Card>

          {/* STEP 3 */}
          <Card className="border min-w-[320px] p-8 max-md:px-6">
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

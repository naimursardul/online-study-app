import SignupForm from "@/components/registration/signup-form";
import { getDataForOptions } from "@/lib/helper";

export default async function page() {
  const levelOptionsPromise = getDataForOptions("level");
  const backgroundOptionsPromise = getDataForOptions("background");

  const [levelOptions, backgroundOptions] = await Promise.all([
    levelOptionsPromise,
    backgroundOptionsPromise,
  ]);
  return (
    <div>
      <SignupForm
        levelOptions={levelOptions}
        backgroundOptions={backgroundOptions}
      />
    </div>
  );
}

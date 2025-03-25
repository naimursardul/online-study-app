"use client";

import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";

export default function SubmitBtn({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending}
      className={"cursor-pointer" + " " + className}
    >
      {pending ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[--text]"></div>
      ) : (
        <div className="flex items-center gap-2">Submit</div>
      )}
    </Button>
  );
}

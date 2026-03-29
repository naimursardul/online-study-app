"use client";

import { Button } from "../ui/button";

export default function SubmitBtn({
  btnName,
  className,
  loading,
}: {
  btnName?: string;
  className?: string;
  loading?: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={"cursor-pointer w-full" + " " + className}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[--text]"></div>
      ) : (
        <div className="flex items-center gap-2">
          {btnName ? btnName : "Submit"}
        </div>
      )}
    </Button>
  );
}

"use client";

import { PlusCircle } from "lucide-react";
import SubmitBtn from "../submit-btn";
import { Input } from "../ui/input";

export default function StudentClassUpload() {
  function handleFormSubmit(formData: FormData) {
    const { title, value } = Object.fromEntries(formData);
    console.log({ title, value });
  }

  return (
    <div className="mt-5 w-full max-w-[350px] space-y-8 bg-background px-6 py-8 rounded-xl">
      <h2 className="flex gap-2 items-center justify-center text-xl font-bold">
        <PlusCircle />
        <span>Create a Class</span>
      </h2>
      <form action={handleFormSubmit} className="space-y-2">
        <Input type="text" name="title" placeholder="Title" />
        <Input type="text" name="value" placeholder="Value" />
        <SubmitBtn className="w-full" />
      </form>
    </div>
  );
}

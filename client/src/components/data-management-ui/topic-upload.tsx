"use client";

import { PlusCircle } from "lucide-react";
import SubmitBtn from "../submit-btn";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function TopicUpload() {
  function handleFormSubmit(formData: FormData) {
    const { student_class, subject, chapter, title, value } =
      Object.fromEntries(formData);
    console.log({ student_class, subject, chapter, title, value });
  }
  function handleOnChangeClass(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    console.log(e.target.name, e.target.value);
  }
  function handleOnChangeSubject(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    console.log(e.target.name, e.target.value);
  }
  function handleOnChangeChapter(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    console.log(e.target.name, e.target.value);
  }

  return (
    <div className="mt-5 w-full max-w-[350px] space-y-8 bg-background px-6 py-8 rounded-xl">
      <h2 className="flex gap-2 items-center justify-center text-xl font-bold">
        <PlusCircle />
        <span>Create a Topic</span>
      </h2>
      <form action={handleFormSubmit} className="space-y-2">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue
              onChange={handleOnChangeClass}
              placeholder="Select Student class"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="hsc">HSC</SelectItem>
              <SelectItem value="ssc">SSC</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full">
            <SelectValue
              onChange={handleOnChangeSubject}
              placeholder="Select Subject"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="physics1">Physics 1st</SelectItem>
              <SelectItem value="chemistry2">Chemistry 2nd</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full">
            <SelectValue
              onChange={handleOnChangeChapter}
              placeholder="Select Chapter"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="1">Gravity & Gravitation</SelectItem>
              <SelectItem value="2">Thermodynamics</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input type="text" name="title" placeholder="Title" />
        <Input type="text" name="value" placeholder="Value" />
        <SubmitBtn className="w-full" />
      </form>
    </div>
  );
}

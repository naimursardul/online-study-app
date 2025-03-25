"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const templateForm: { type: string; placeholder: string; name: string }[] = [
  {
    type: "text",
    placeholder: "Class",
    name: "class",
  },
  {
    type: "text",
    placeholder: "Subject",
    name: "subject",
  },
  {
    type: "text",
    placeholder: "Paper",
    name: "paper",
  },
  {
    type: "text",
    placeholder: "Chapter",
    name: "chapter",
  },
  {
    type: "text",
    placeholder: "Topic",
    name: "topic",
  },
];

export default function QuestionUpload() {
  //
  //
  //
  //   HANDLE ADD QUESTION
  function handleAddQ(formData: FormData) {
    const { questionType } = Object.fromEntries(formData);
    console.log(questionType);
  }
  return (
    <>
      <form action={handleAddQ}>
        <h2 className="text-md font-semibold mb-5">Template</h2>
        <div className="grid grid-cols-3 gap-3">
          {templateForm.length > 0 &&
            templateForm.map((f, i) => (
              <Input
                key={i}
                type={f.type}
                name={f.name}
                placeholder={f.placeholder}
              />
            ))}
          <Select name="questionType">
            <SelectTrigger>
              <SelectValue placeholder="Select a question-type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Question-Type</SelectLabel>
                <SelectItem value="mcq">MCQ</SelectItem>
                <SelectItem value="cq">CQ</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <span>Add</span>
            <Plus />{" "}
          </Button>
        </div>
      </form>
    </>
  );
}

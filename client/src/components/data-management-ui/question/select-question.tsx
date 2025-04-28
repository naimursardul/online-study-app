"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import McqUpload from "./mcq-upload";
// import CqUpload from "./cq-upload";

export default function SelectQuestion() {
  const [qType, setQType] = useState<"MCQ" | "CQ">("MCQ");
  console.log(qType);
  return (
    <div className="w-full h-full space-y-5">
      {/* Question Type */}
      <div className="space-y-2">
        <Label htmlFor="studentClass">Question Type</Label>
        <Select
          defaultValue="MCQ"
          onValueChange={(value) => setQType(value as "MCQ" | "CQ")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="MCQ">MCQ</SelectItem>
              <SelectItem value="CQ">CQ</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {qType && <McqUpload qType={qType} />}
      {/* {qType === "CQ" && <CqUpload />} */}
    </div>
  );
}

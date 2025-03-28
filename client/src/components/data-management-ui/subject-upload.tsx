"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useState, FormEvent } from "react";
import SubmitBtn from "../submit-btn";
import { SubjectType } from "@/lib/type";

export default function SubjectUpload() {
  const [formData, setFormData] = useState<SubjectType>({
    studentClass: "",
    title: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Card className="max-w-md w-full mx-auto p-4 mt-10 shadow-md">
      <CardContent>
        <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
          <PlusCircle />
          <span>Create a Subject</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentClass">Student Class</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, studentClass: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Student Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="hsc">HSC</SelectItem>
                  <SelectItem value="ssc">SSC</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Subject title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter Title"
            />
          </div>

          <SubmitBtn />
        </form>
      </CardContent>
    </Card>
  );
}

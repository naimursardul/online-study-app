"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useState, FormEvent } from "react";
import SubmitBtn from "../submit-btn";
import { Textarea } from "../ui/textarea";
import { ClassType } from "@/lib/type";

export default function TopicUpload() {
  const [formData, setFormData] = useState<ClassType>({
    title: "",
    details: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Card className="max-w-md min-w-xs mx-auto p-4 mt-5 shadow-md">
      <CardContent>
        <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
          <PlusCircle />
          <span>Create a Class</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
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

          <div className="space-y-2">
            <Label htmlFor="value">Details</Label>
            <Textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Enter details about the class"
            />
          </div>

          <SubmitBtn />
        </form>
      </CardContent>
    </Card>
  );
}

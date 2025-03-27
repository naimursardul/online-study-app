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
import { useState, useEffect, FormEvent } from "react";
import SubmitBtn from "../submit-btn";
import { TopicType } from "@/lib/type";

export default function TopicUpload() {
  const [formData, setFormData] = useState<TopicType>({
    studentClass: "",
    subject: "",
    chapter: "",
    title: "",
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);

  useEffect(() => {
    if (formData.studentClass) {
      fetch(`/api/subjects?class=${formData.studentClass}`)
        .then((res) => res.json())
        .then((data) => setSubjects(data));
    } else {
      setSubjects([]);
    }
  }, [formData.studentClass]);

  useEffect(() => {
    if (formData.subject) {
      fetch(`/api/chapters?subject=${formData.subject}`)
        .then((res) => res.json())
        .then((data) => setChapters(data));
    } else {
      setChapters([]);
    }
  }, [formData.subject]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Card className="max-w-md min-w-xs mx-auto p-4 mt-5 shadow-md">
      <CardContent>
        <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
          <PlusCircle />
          <span>Create a Topic</span>
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
            <Label htmlFor="subject">Subject</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, subject: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      Select a class first
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter">Chapter</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, chapter: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <SelectItem key={chapter} value={chapter}>
                        {chapter}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      Select a subject first
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Topic title</Label>
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

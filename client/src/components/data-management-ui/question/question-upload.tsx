"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import React, { useState, FormEvent, useEffect } from "react";
import { IBaseQuestion, ICQ, IField, IMCQ } from "@/lib/type";
import SubmitBtn from "@/components/submit-btn";
import QuestionDataField from "./question-data-field";
import { createManualOptions } from "@/lib/utils";
import McqForm from "./mcq-form";
import CqForm from "./cq-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function QuestionUpload() {
  const [formData, setFormData] = useState<IBaseQuestion | IMCQ | ICQ>({
    questionType: "MCQ",
    level: "",
    levelId: "",
    background: [],
    backgroundId: [],
    subject: "",
    subjectId: "",
    chapter: "",
    chapterId: "",
    topic: "",
    topicId: "",
    record: [],
    recordId: [],
    marks: 0,
    timeRequired: 0,
    difficulty: "Medium",
  });

  const fields: IField[] = [
    {
      label: "Level",
      inputType: "select",
      name: "level",
    },
    {
      label: "Background",
      inputType: "checkbox",
      name: "background",
      dependencies: ["level"],
    },
    {
      label: "Subject",
      inputType: "select",
      name: "subject",
      dependencies: ["level", "background"],
    },
    {
      label: "Chapter",
      inputType: "select",
      name: "chapter",
      dependencies: ["level", "background", "subject"],
    },
    {
      label: "Topic",
      inputType: "select",
      name: "topic",
      dependencies: ["level", "background", "subject", "chapter"],
    },
    {
      label: "Record",
      inputType: "checkbox",
      name: "record",
    },
    {
      label: "Difficulty",
      inputType: "select",
      name: "difficulty",
      manualOptionData: true,
      optionData: createManualOptions(["Easy", "Medium", "Hard"]),
    },
    {
      label: "Time Required",
      inputType: "input",
      name: "timeRequired",
      type: "number",
      placeholder: "required time",
    },
    {
      label: "Marks",
      inputType: "input",
      name: "marks",
      type: "number",
    },
  ];

  const [updatedFields, setUpdatedFields] = useState<IField[]>(fields);
  const [qType, setQType] = useState<"MCQ" | "CQ">("MCQ");

  useEffect(() => {
    setFormData((prev) => {
      const baseInit: IBaseQuestion = {
        questionType: "MCQ",
        level: "",
        levelId: "",
        background: [],
        backgroundId: [],
        subject: "",
        subjectId: "",
        chapter: "",
        chapterId: "",
        topic: "",
        topicId: "",
        record: [],
        recordId: [],
        marks: 0,
        timeRequired: 0,
        difficulty: "Medium",
      };

      // create cleaned version of previous state
      const cleaned: IBaseQuestion = { ...baseInit } as IBaseQuestion;
      (Object.keys(baseInit) as (keyof IBaseQuestion)[]).forEach((key) => {
        if (prev[key] !== undefined) {
          cleaned[key] = prev[key];
        }
      });

      if (qType === "MCQ") {
        return {
          ...cleaned,
          questionType: "MCQ",
          question: "",
          options: [],
          correctAnswer: "",
          explanation: "",
        };
      }

      if (qType === "CQ") {
        return {
          ...cleaned,
          questionType: "CQ",
          statement: "",
          subQuestions: [
            {
              questionNo: "A",
              question: "",
              answer: "",
              topic: "",
              topicId: "",
            },
            {
              questionNo: "B",
              question: "",
              answer: "",
              topic: "",
              topicId: "",
            },
            {
              questionNo: "C",
              question: "",
              answer: "",
              topic: "",
              topicId: "",
            },
            {
              questionNo: "D",
              question: "",
              answer: "",
              topic: "",
              topicId: "",
            },
          ],
        };
      }

      return prev;
    });
  }, [qType]);

  useEffect(() => {
    setUpdatedFields((prevFields) => {
      const newFields = [...prevFields];

      (async () => {
        for (let i = 0; i < newFields.length; i++) {
          const field = newFields[i];

          if (field.manualOptionData) continue;

          if (["select", "checkbox"].includes(field.inputType)) {
            let isReady = true;
            const query: string[] = [];
            const deps = field.dependencies ?? [];

            // Handle dependencies
            for (const dep of deps) {
              const val = (formData as any)[dep];
              const valId = (formData as any)[dep + "Id"];

              if (!val || (Array.isArray(val) && val.length === 0)) {
                isReady = false;
                newFields[i] = { ...field, optionData: undefined };
                break;
              }

              if (Array.isArray(valId)) {
                valId.forEach((v: string) => query.push(`${dep}=${v}`));
              } else {
                query.push(`${dep}=${valId}`);
              }
            }

            if (!isReady) continue;

            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/${field.name}${
                  query.length ? `?${query.join("&")}` : ""
                }`
              );
              const data = await res.json();

              if (data.success) {
                const optionData =
                  field.name === "record"
                    ? data.data
                    : data.data.map((d: any) => ({ name: d.name, _id: d._id }));

                newFields[i] = { ...field, optionData };
              }
            } catch (error) {
              console.log(error);
            }
          }
        }

        // finally apply the new fields state
        setUpdatedFields(newFields);
      })();

      return prevFields; // temporary return value to avoid loop
    });
  }, [formData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/question/create`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      }
      toast.warning(data.message);
    } catch (error) {
      console.log(error);
      toast.error("Server error.");
    }
  };

  return (
    <div className="w-full h-full space-y-5">
      {/* Question Type */}
      <div className="space-y-2">
        <Label htmlFor="studentClass">Question Type</Label>
        <Select
          defaultValue="MCQ"
          onValueChange={(value: "MCQ" | "CQ") => setQType(value)}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="MCQ" className="cursor-pointer">
                MCQ
              </SelectItem>
              <SelectItem value="CQ" className="cursor-pointer">
                CQ
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Card className="w-full mx-auto md:p-4 mt-10 shadow-md">
        <CardContent>
          <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
            <PlusCircle />
            <span>Create a Question</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-row-reverse max-md:flex-col gap-8 ">
              <div className="space-y-4" style={{ width: qType ? "" : "100%" }}>
                {updatedFields?.length > 0 &&
                  updatedFields.map((field, i) => (
                    <QuestionDataField
                      key={i}
                      formData={formData}
                      setFormData={setFormData}
                      field={field}
                    />
                  ))}
              </div>
              <div className="space-y-4 w-full">
                {qType === "MCQ" && (
                  <McqForm
                    formData={formData as IMCQ}
                    setFormData={
                      setFormData as React.Dispatch<React.SetStateAction<IMCQ>>
                    }
                  />
                )}
                {qType === "CQ" && (
                  <CqForm
                    formData={formData as ICQ}
                    setFormData={
                      setFormData as React.Dispatch<React.SetStateAction<ICQ>>
                    }
                    defaultTopicId={formData?.topicId}
                  />
                )}
              </div>
            </div>

            <SubmitBtn />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

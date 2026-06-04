import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import QuestionDataField from "./question-forms/question-data-field";
import {
  client,
  createManualOptions,
  getQuestionDataOption,
} from "@/utils/utils";
import McqForm from "./question-forms/mcq-form";
import CqForm from "./question-forms/cq-form";
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
import type {
  IMCQ,
  IBaseQuestion,
  ICQ,
  IField,
  IMasterData,
} from "@/types/types";
import SubmitBtn from "@/components/submit-btn/submit-btn";

interface QuestionUploadProps {
  masterData: IMasterData;
}

export default function QuestionUpload({ masterData }: QuestionUploadProps) {
  const [formData, setFormData] = useState<IBaseQuestion | IMCQ | ICQ>({
    questionType: "MCQ",
    levelId: "",
    backgroundId: [],
    subjectId: "",
    chapterId: "",
    topicId: "",
    record: [],
    recordId: [],
    marks: 0,
    timeRequired: 0,
    difficulty: "Medium",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [qType, setQType] = useState<"MCQ" | "CQ">("MCQ");

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
    },
    {
      label: "Subject",
      inputType: "select",
      name: "subject",
    },
    {
      label: "Chapter",
      inputType: "select",
      name: "chapter",
    },
    {
      label: "Topic",
      inputType: "select",
      name: "topic",
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

  const filteredFields: IField[] = useMemo(
    () => getQuestionDataOption(formData, masterData, fields),
    [masterData, formData],
  );

  useEffect(() => {
    setFormData((prev) => {
      const baseInit: IBaseQuestion = {
        questionType: "MCQ",
        levelId: "",
        backgroundId: [],
        subjectId: "",
        chapterId: "",
        topicId: "",
        record: [],
        recordId: [],
        marks: 0,
        timeRequired: 0,
        difficulty: "Medium",
      };

      const cleaned: IBaseQuestion = { ...baseInit };

      (Object.keys(baseInit) as (keyof IBaseQuestion)[]).forEach((key) => {
        if (prev[key] !== undefined) {
          (cleaned as any)[key] = prev[key];
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
    });
  }, [qType]);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await client.post(`/question/create`, formData);

      const { data } = res;

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.warning(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full space-y-5">
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
            <div className="flex flex-row-reverse max-md:flex-col gap-8">
              <div className="space-y-4">
                {filteredFields.map((field, i) => (
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
                  />
                )}
              </div>
            </div>

            <SubmitBtn loading={loading} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

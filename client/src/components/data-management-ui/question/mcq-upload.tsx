"use client";

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { IField, IMCQ } from "@/lib/type";
import SubmitBtn from "@/components/submit-btn";
import QuestionDataField from "../question-data-field";
import { createManualOptions } from "@/lib/utils";
import McqForm from "./mcq-form";

export default function McqUpload({ qType }: { qType: "MCQ" | "CQ" }) {
  const [formData, setFormData] = useState<IMCQ>({
    questionType: qType,
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
    question: "",
    options: [],
    correctAnswer: "",
    explanation: "",
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

  // useEffect(() => {
  //   switch (formData?.questionType) {
  //     case "MCQ":
  //       setFormData({
  //         ...formData,
  //         question: "",
  //         options: [],
  //         correctAnswer: "",
  //         explanation: "",
  //       });
  //   }
  // }, []);

  useEffect(() => {
    async function getOptions() {
      for (const field of updatedFields) {
        if (field?.manualOptionData) return;
        const query = [];
        let isContinue: boolean = true;

        if (["select", "checkbox"].includes(field.inputType)) {
          if (field?.dependencies && field?.dependencies.length > 0) {
            for (const d of field.dependencies) {
              if (
                (typeof (formData as unknown as Record<string, string>)[d] ===
                  "string" &&
                  !(formData as unknown as Record<string, string>)[d]) ||
                (Array.isArray(
                  (formData as unknown as Record<string, string[]>)[d]
                ) &&
                  (formData as unknown as Record<string, string[]>)[d]
                    .length === 0)
              ) {
                isContinue = false;
                delete field.optionData;
                break;
              }
              if (
                Array.isArray(
                  (formData as unknown as Record<string, string[]>)[d]
                ) &&
                (formData as unknown as Record<string, string[]>)[d].length > 0
              ) {
                for (const qStr of (
                  formData as unknown as Record<string, string[]>
                )[d]) {
                  query.push(`${d}=${qStr}`);
                }
              } else
                query.push(
                  `${d}=${(formData as unknown as Record<string, string>)[d]}`
                );
            }
          }

          if (isContinue) {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/${field.name}${
                  query?.length > 0 ? "?" + query.join("&") : ""
                }`
              );
              const data = await res.json();

              if (data.success) {
                if (field?.name === "record") {
                  field.optionData = [...data.data];
                } else
                  field.optionData = data.data.map(
                    (d: Record<string, string>) => {
                      return { name: d?.name, _id: d?._id };
                    }
                  );
                setUpdatedFields((prev) =>
                  prev.map((f) => {
                    if (f?.name === field?.name) return field;
                    return f;
                  })
                );
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
    }

    getOptions();
  }, [formData]);

  console.log("Form Data Submitted:", formData);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Card className="w-full mx-auto md:p-4 mt-10 shadow-md">
      <CardContent>
        <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
          <PlusCircle />
          <span>Create a Question</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {updatedFields?.length > 0 &&
            updatedFields.map((field, i) => (
              <QuestionDataField
                key={i}
                formData={formData}
                setFormData={setFormData}
                field={field}
              />
            ))}
          <McqForm formData={formData} setFormData={setFormData} />
          <SubmitBtn />
        </form>
      </CardContent>
    </Card>
  );
}

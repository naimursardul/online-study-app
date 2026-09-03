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
import WrittenForm from "./question-forms/written-form";
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
  IWritten,
} from "@/types/types";
import SubmitBtn from "@/components/submit-btn/submit-btn";
import { useMasterData } from "@/lib/MasterData-context";
import {
  emptyShapeFor,
  familyOf,
  labelOf,
  typesForSubject,
  type QuestionTypeCode,
} from "@/utils/questionTypes";

// Base metadata fields — the same for every question type, so they live outside
// the component and keep a stable identity across renders.
const FIELDS: IField[] = [
  {
    label: "Level",
    inputType: "select",
    name: "levelId",
  },
  {
    label: "Background",
    inputType: "checkbox",
    name: "backgroundId",
  },
  {
    label: "Subject",
    inputType: "select",
    name: "subjectId",
  },
  {
    label: "Chapter",
    inputType: "select",
    name: "chapterId",
  },
  {
    label: "Topic",
    inputType: "select",
    name: "topicId",
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

export default function QuestionUpload() {
  const [formData, setFormData] = useState<
    IBaseQuestion | IMCQ | ICQ | IWritten
  >({
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
  const [qType, setQType] = useState<QuestionTypeCode>("MCQ");
  const { masterData } = useMasterData();
  const [isQuestionReady, setIsQuestionReady] = useState(false);

  const filteredFields: IField[] = useMemo(
    () => getQuestionDataOption(formData, masterData, FIELDS),
    [masterData, formData],
  );

  const selectedSubject = useMemo(
    () => masterData.subjects.find((s) => s._id === formData.subjectId),
    [masterData.subjects, formData.subjectId],
  );

  // The subject decides which types it offers; a subject with none configured
  // offers all of them, so subjects created before this feature keep working.
  const availableTypes = useMemo(
    () => typesForSubject(selectedSubject?.questionTypes),
    [selectedSubject],
  );

  const family = familyOf(qType);

  // Switching to a subject that does not offer the current type falls back to
  // that subject's first type, so the form can never sit on an unofferable one.
  useEffect(() => {
    if (availableTypes.some((t) => t.code === qType)) return;
    const fallback = availableTypes[0]?.code;
    if (fallback) setQType(fallback);
  }, [availableTypes, qType]);

  // Switching type keeps whatever base metadata the admin already filled in and
  // swaps in the new type's blank shape from the registry, so nothing here needs
  // to know which types exist.
  useEffect(() => {
    setFormData((prev) => {
      const baseInit: IBaseQuestion = {
        questionType: qType,
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
          Object.assign(cleaned, { [key]: prev[key] });
        }
      });

      return {
        ...cleaned,
        questionType: qType,
        ...emptyShapeFor(qType),
      } as IBaseQuestion | IMCQ | ICQ | IWritten;
    });
  }, [qType]);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (!isQuestionReady) {
      setIsQuestionReady(true);
      setLoading(false);
      return;
    }

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
      setIsQuestionReady(false);
    }
  };

  return (
    <div className="w-full h-full space-y-5">
      <div className="space-y-2">
        <Label htmlFor="questionType">Question Type</Label>
        <Select
          value={qType}
          onValueChange={(value) => setQType(value as QuestionTypeCode)}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {availableTypes.map((type) => (
                <SelectItem
                  key={type.code}
                  value={type.code}
                  className="cursor-pointer"
                >
                  {type.label}
                </SelectItem>
              ))}
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
                    formData={formData as IBaseQuestion}
                    setFormData={setFormData}
                    field={field}
                  />
                ))}
              </div>

              <div className="space-y-4 w-full">
                {family === "mcq" && (
                  <McqForm
                    isQuestionReady={isQuestionReady}
                    setIsQuestionReady={setIsQuestionReady}
                    formData={formData as IMCQ}
                    setFormData={
                      setFormData as React.Dispatch<React.SetStateAction<IMCQ>>
                    }
                  />
                )}

                {family === "cq" && (
                  <CqForm
                    isQuestionReady={isQuestionReady}
                    setIsQuestionReady={setIsQuestionReady}
                    formData={formData as ICQ}
                    setFormData={
                      setFormData as React.Dispatch<React.SetStateAction<ICQ>>
                    }
                  />
                )}

                {family === "simple" && (
                  <WrittenForm
                    typeLabel={labelOf(qType)}
                    isQuestionReady={isQuestionReady}
                    setIsQuestionReady={setIsQuestionReady}
                    formData={formData as IWritten}
                    setFormData={
                      setFormData as React.Dispatch<
                        React.SetStateAction<IWritten>
                      >
                    }
                  />
                )}
              </div>
            </div>

            <SubmitBtn
              loading={loading}
              btnName={isQuestionReady ? "Submit" : "Ready"}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

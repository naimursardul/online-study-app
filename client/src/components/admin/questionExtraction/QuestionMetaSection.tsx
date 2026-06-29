import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { createManualOptions, getQuestionDataOption } from "@/utils/utils";
import { useMasterData } from "@/lib/MasterData-context";
import type { IBaseQuestion, IField } from "@/types/types";
import { extractIdTo_ } from "@/utils/utils";
import QuestionDataField from "../question/question-forms/question-data-field";

interface QuestionMetaSectionProps {
  meta: IBaseQuestion;
  onChange: (updated: IBaseQuestion) => void;
  editMode: boolean;
}

const fields: IField[] = [
  { label: "Level", inputType: "select", name: "levelId" },
  { label: "Background", inputType: "checkbox", name: "backgroundId" },
  { label: "Subject", inputType: "select", name: "subjectId" },
  { label: "Chapter", inputType: "select", name: "chapterId" },
  { label: "Topic", inputType: "select", name: "topicId" },
  { label: "Record", inputType: "checkbox", name: "record" },
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

export default function QuestionMetaSection({
  meta,
  onChange,
  editMode,
}: QuestionMetaSectionProps) {
  const { masterData } = useMasterData();

  const filteredFields = useMemo(
    () => getQuestionDataOption(meta, masterData, fields),
    [meta, masterData],
  );

  // Resolve IDs to names for badges
  const levelName = extractIdTo_(masterData.levels, meta.levelId, "name");
  const subjectName = extractIdTo_(masterData.subjects, meta.subjectId, "name");
  const chapterName = extractIdTo_(masterData.chapters, meta.chapterId, "name");
  const topicName = extractIdTo_(masterData.topics, meta.topicId, "name");

  if (!editMode) {
    return (
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {meta.levelId && <Badge variant="secondary">Level: {levelName}</Badge>}
        {meta.subjectId && (
          <Badge variant="secondary">Subject: {subjectName}</Badge>
        )}
        {meta.chapterId && (
          <Badge variant="secondary">Chapter: {chapterName}</Badge>
        )}
        {meta.topicId && <Badge variant="secondary">Topic: {topicName}</Badge>}
        {meta.difficulty && (
          <Badge variant="secondary">{meta.difficulty}</Badge>
        )}
        {meta.marks > 0 && (
          <Badge variant="secondary">Marks: {meta.marks}</Badge>
        )}
        {meta.timeRequired > 0 && (
          <Badge variant="secondary">Time: {meta.timeRequired} min</Badge>
        )}
        {meta.record?.length > 0 &&
          meta.record.map((r, i) => (
            <Badge key={i} variant="outline">
              {r.institution} - {r.year}
            </Badge>
          ))}
      </div>
    );
  }

  return (
    <div className="pt-4 border-t space-y-4">
      <Label className="text-sm font-semibold">Metadata Override</Label>
      <div className="flex flex-row flex-wrap gap-4 ">
        {filteredFields.map((field, i) => (
          <QuestionDataField
            key={i}
            field={field}
            formData={meta}
            setFormData={(updated) => {
              const next =
                typeof updated === "function" ? updated(meta) : updated;

              // When metadata changes inside a CQ card,
              // cascade chapterId/topicId resets same as QuestionDataField does
              onChange(next);
            }}
          />
        ))}
      </div>
    </div>
  );
}

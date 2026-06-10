import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2, X } from "lucide-react";
import { createManualOptions, getQuestionDataOption } from "@/utils/utils";
import { useMasterData } from "@/lib/MasterData-context";
import type { IBaseQuestion, IField } from "@/types/types";
import QuestionDataField from "../question/question-forms/question-data-field";
import { Button } from "@/components/ui/button";

interface GlobalMetadataPanelProps {
  meta: IBaseQuestion;
  setMeta: React.Dispatch<React.SetStateAction<IBaseQuestion>>;
  onClear: () => void;
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

export default function GlobalMetadataPanel({
  meta,
  setMeta,
  onClear,
}: GlobalMetadataPanelProps) {
  const { masterData } = useMasterData();

  const filteredFields = useMemo(
    () => getQuestionDataOption(meta, masterData, fields),
    [meta, masterData],
  );

  return (
    <Card className="w-full shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings2 size={20} />
            <span>Global Metadata</span>
            <span className="text-sm font-normal text-muted-foreground ml-1">
              — applied to all extracted questions by default
            </span>
          </h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <X size={16} />
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFields.map((field, i) => (
            <QuestionDataField
              key={i}
              field={field}
              formData={meta}
              setFormData={setMeta}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

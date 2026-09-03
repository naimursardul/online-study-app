import TextEditor from "@/components/text-editor/TextEditor";
import { Label } from "@/components/ui/label";
import type { IWritten } from "@/types/types";
import React from "react";

// The `simple` family (SQ / EQ / WQ) — one question, one answer, both markdown.
// Only the heading changes between the three, so the label is injected.
export default function WrittenForm({
  isQuestionReady,
  setIsQuestionReady,
  formData,
  setFormData,
  typeLabel,
}: {
  isQuestionReady: boolean;
  setIsQuestionReady: React.Dispatch<React.SetStateAction<boolean>>;
  formData: IWritten;
  setFormData: React.Dispatch<React.SetStateAction<IWritten>>;
  typeLabel?: string;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>{typeLabel ? `${typeLabel} — Question` : "Question"}</Label>
        <TextEditor
          setIsFinished={setIsQuestionReady}
          isFinished={isQuestionReady}
          value={formData?.question || ""}
          onChangeFn={(val) =>
            setFormData((prev) => ({ ...prev, question: val }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Answer</Label>
        <TextEditor
          setIsFinished={setIsQuestionReady}
          isFinished={isQuestionReady}
          value={formData?.answer || ""}
          onChangeFn={(val) => setFormData((prev) => ({ ...prev, answer: val }))}
        />
      </div>
    </>
  );
}

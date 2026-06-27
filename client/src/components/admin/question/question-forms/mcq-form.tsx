import TextEditor from "@/components/text-editor/TextEditor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IMCQ } from "@/types/types";
import React from "react";

export default function McqForm({
  isQuestionReady,
  setIsQuestionReady,
  formData,
  setFormData,
}: {
  isQuestionReady: boolean;
  setIsQuestionReady: React.Dispatch<React.SetStateAction<boolean>>;
  formData: IMCQ;
  setFormData: React.Dispatch<React.SetStateAction<IMCQ>>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Question</Label>
        <TextEditor
          setIsFinished={setIsQuestionReady}
          isFinished={isQuestionReady}
          onChangeFn={function (val: string): void {
            setFormData((prev) => ({ ...prev, question: val }));
          }}
        />
      </div>

      <div className="space-y-4">
        <Label>Options</Label>
        {[1, 2, 3, 4].map((_o, i) => (
          <div key={i} className="space-y-2 ml-4">
            <Label className="text-sm font-light">Option-{_o}</Label>
            <TextEditor
              setIsFinished={setIsQuestionReady}
              isFinished={isQuestionReady}
              onChangeFn={(val) => {
                const _os = formData.options;
                _os[_o - 1] = val;
                return setFormData({ ...formData, options: _os });
              }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Correct Answer</Label>
        <Select
          name="correctAnswer"
          onValueChange={(value) =>
            setFormData({ ...formData, correctAnswer: value })
          }
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select answer" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {formData?.options?.length > 0 ? (
                [0, 1, 2, 3].map((_o, i) => (
                  <SelectItem
                    key={i}
                    value={String(_o)}
                    className="text-sm cursor-pointer"
                  >
                    <span>{`Option-${i + 1}`}</span>
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value={"No-data"}>
                  No options have been created.
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Explanation</Label>
        <TextEditor
          setIsFinished={setIsQuestionReady}
          isFinished={isQuestionReady}
          onChangeFn={(val) => setFormData({ ...formData, explanation: val })}
        />
      </div>
    </>
  );
}

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IMCQ } from "@/lib/type";
import React from "react";

export default function McqForm({
  formData,
  setFormData,
}: {
  formData: IMCQ;
  setFormData: React.Dispatch<React.SetStateAction<IMCQ>>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Question</Label>
        <Textarea
          placeholder="Enter Question"
          name="question"
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
        />
      </div>

      <div className="space-y-4">
        <Label>Options</Label>
        {[1, 2, 3, 4].map((_o, i) => (
          <div key={i} className="space-y-2 ml-4">
            <Label className="text-sm font-light">Option-{_o}</Label>
            <Textarea
              placeholder={`Enter option ${_o}`}
              name={`option${_o}`}
              onChange={(e) => {
                const _os = formData.options;
                _os[_o - 1] = e.target.value;
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
                formData?.options.map(
                  (_o, i) =>
                    _o && (
                      <SelectItem
                        key={i}
                        value={_o}
                        className="text-sm cursor-pointer"
                      >
                        <span>{`Option-${i + 1}: `}</span>
                        <span className="font-light">{_o}</span>
                      </SelectItem>
                    )
                )
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
        <Textarea
          placeholder="Enter explanation"
          name="explanation"
          onChange={(e) =>
            setFormData({ ...formData, explanation: e.target.value })
          }
        />
      </div>
    </>
  );
}

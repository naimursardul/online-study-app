import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import type {
  IBaseQuestion,
  ICQ,
  IQuestionDataFieldProps,
} from "@/types/types";
import ComboboxMulti from "@/components/comboboxMulti/ComboboxMulti";
import { Label } from "@/components/ui/label";

export default function QuestionDataField({
  formData,
  setFormData,
  field,
}: IQuestionDataFieldProps) {
  const fieldValue = formData[field.name as keyof IBaseQuestion];
  return (
    <div className="space-y-2 min-w-60">
      {field?.label && <Label>{field.label}</Label>}

      {/* Input */}
      {field?.inputType === "input" && (
        <Input
          type={field?.type || "text"}
          id={field?.name}
          name={field?.name}
          value={(fieldValue || "") as string}
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name]:
                field.type === "number"
                  ? Number(e.target.value)
                  : e.target.value,
            })
          }
          placeholder={`Enter ${field?.placeholder || field?.name}`}
        />
      )}

      {/* Textarea */}
      {field?.inputType === "textarea" && (
        <Textarea
          id={field?.name}
          name={field?.name}
          value={(fieldValue || "") as string}
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name]: e.target.value,
            })
          }
          placeholder={`Enter ${field?.placeholder || field?.name}`}
        />
      )}

      {/* Select */}
      {field?.inputType === "select" && (
        <Select
          value={
            (field.manualOptionData
              ? fieldValue || ""
              : fieldValue
                ? fieldValue
                : "") as string
          }
          onValueChange={(value) => {
            const dependentMap: Record<string, string[]> = {
              levelId: ["backgroundId", "subjectId", "chapterId", "topicId"],
              subjectId: ["chapterId", "topicId"],
              chapterId: ["topicId"],
            };

            // Build reset object for dependent fields
            const resetFields =
              dependentMap[field.name]?.reduce<Partial<IBaseQuestion>>(
                (acc, dep) => {
                  if (dep === "backgroundId") {
                    acc.backgroundId = [];
                  } else {
                    (acc as Record<string, string>)[dep] = "";
                  }
                  return acc;
                },
                {},
              ) ?? {};

            // Reset CQ subquestions if applicable
            let subQuestionsReset: Partial<ICQ> = {};
            if (dependentMap[field.name] && formData.questionType === "CQ") {
              subQuestionsReset = {
                subQuestions: (formData as ICQ).subQuestions?.map((sq) => ({
                  ...sq,
                  ...(sq.chapterId !== undefined ? { chapterId: "" } : {}),
                  ...(sq.topicId !== undefined ? { topicId: "" } : {}),
                })),
              };
            }

            setFormData({
              ...formData,
              [field.name]: value,
              ...resetFields,
              ...subQuestionsReset,
            });
          }}
          disabled={field?.optionData?.length === 0}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue
              placeholder={`Select ${field?.placeholder || field?.label?.toLocaleLowerCase()}`}
            />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {field?.optionData &&
                field?.optionData.length > 0 &&
                field.optionData.map((option) => {
                  if ("name" in option)
                    return (
                      <SelectItem
                        className="cursor-pointer"
                        key={option._id}
                        value={
                          field.manualOptionData ? option.name : option._id
                        }
                      >
                        {option.name}
                      </SelectItem>
                    );
                })}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* Checkbox */}
      {field?.inputType === "checkbox" &&
        (field?.optionData && field?.optionData.length > 0 ? (
          <ComboboxMulti
            field={field}
            formData={formData}
            setFormData={setFormData}
          />
        ) : (
          <p className="text-sm text-muted-foreground pl-1">
            No {field?.label ?? field?.name} available.
          </p>
        ))}
    </div>
  );
}

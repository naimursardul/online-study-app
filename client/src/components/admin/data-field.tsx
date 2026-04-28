import type { DataFieldProps } from "@/types/types";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

export default function DataField<T>({
  formData,
  setFormData,
  field,
  forAllDataPage,
}: DataFieldProps<T>) {
  const fieldValue = (formData as any)[field.name];

  return (
    <div className="space-y-2">
      {!forAllDataPage && field?.label && <Label>{field.label}</Label>}

      {/* Input */}
      {field?.inputType === "input" && (
        <Input
          type={field?.type || "text"}
          id={field?.name}
          name={field?.name}
          value={fieldValue || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name]:
                field.type === "number"
                  ? Number(e.target.value)
                  : e.target.value,
            })
          }
          placeholder={
            forAllDataPage
              ? `Search by ${field?.label}`
              : `Enter ${field?.placeholder || field?.label}`
          }
        />
      )}

      {/* Textarea */}
      {field?.inputType === "textarea" && (
        <Textarea
          id={field?.name}
          name={field?.name}
          value={fieldValue || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name]: e.target.value,
            })
          }
          placeholder={`Enter ${field?.placeholder || field?.label}`}
        />
      )}

      {/* Select */}
      {field?.inputType === "select" && (
        <Select
          value={fieldValue ? fieldValue : ""}
          onValueChange={(value) => {
            const obj: Record<string, any> = {};
            obj[field.name] = value;
            const dependentMap: Record<string, string[]> = {
              levelId: ["backgroundId", "subjectId", "chapterId", "topicId"],
              backgroundId: ["subjectId", "chapterId", "topicId"],
              subjectId: ["chapterId", "topicId"],
              chapterId: ["topicId"],
            };

            if (dependentMap[field.name]) {
              dependentMap[field.name].forEach((dep) => {
                obj[dep] = dep === "backgroundId" ? [] : "";
              });
            }

            setFormData({
              ...formData,
              ...obj,
            });
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue
              placeholder={`Select ${field?.placeholder || field?.label}`}
            />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {field?.optionData && field.optionData.length > 0 ? (
                field.optionData.map((option) => {
                  if ("name" in option)
                    return (
                      <SelectItem
                        className="cursor-pointer"
                        key={option._id}
                        value={option._id}
                      >
                        {option.name}
                      </SelectItem>
                    );
                })
              ) : (
                <SelectItem value="empty" disabled>
                  No {field.name} available
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* Checkbox */}
      {field?.inputType === "checkbox" &&
        (field?.optionData?.length ? (
          field.optionData.map((option) => {
            if ("name" in option)
              return (
                <div key={option._id} className="flex gap-2">
                  <Checkbox
                    className="cursor-pointer"
                    checked={(fieldValue || []).includes(option._id)}
                    onCheckedChange={(checked: boolean) => {
                      setFormData((prev) => {
                        const ids = [...((prev as any)[field.name] || [])];

                        if (checked) {
                          if (!ids.includes(option._id)) {
                            ids.push(option._id);
                          }
                        } else {
                          const idIndex = ids.indexOf(option._id);

                          if (idIndex > -1) ids.splice(idIndex, 1);
                        }

                        const updated: Record<string, any> = {
                          ...prev,
                          [field.name]: ids,
                        };

                        if (field.name === "backgroundId") {
                          updated.subjectId = "";
                          updated.chapterId = "";
                          updated.topicId = "";
                        }

                        return updated as T;
                      });
                    }}
                  />

                  <Label className="font-light">{option.name}</Label>
                </div>
              );
          })
        ) : (
          <small className="font-light pl-3">No {field?.name} available.</small>
        ))}
    </div>
  );
}

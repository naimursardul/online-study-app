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
import { Checkbox } from "../../../ui/checkbox";
import { Label } from "../../../ui/label";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { Button } from "../../../ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import type { IBaseQuestion, ICQ, IField } from "@/types/types";

// DATA FIELD PROPS TYPE
export interface DataFieldProps {
  formData: IBaseQuestion;
  setFormData: React.Dispatch<React.SetStateAction<IBaseQuestion>>;
  field: IField;
  forAllDataPage?: boolean;
}
export default function QuestionDataField({
  formData,
  setFormData,
  field,
}: DataFieldProps) {
  const [open, setOpen] = useState<boolean>(false);

  const fieldValue = (formData as any)[field.name];
  console.log(formData);
  return (
    <div className="space-y-2">
      {field?.label && <Label>{field.label}</Label>}

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
          placeholder={`Enter ${field?.placeholder || field?.name}`}
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
          placeholder={`Enter ${field?.placeholder || field?.name}`}
        />
      )}

      {/* Select */}
      {field?.inputType === "select" && (
        <Select
          value={
            field.manualOptionData
              ? fieldValue || ""
              : fieldValue
                ? fieldValue
                : ""
          }
          onValueChange={(value) => {
            const obj: Record<string, any> = {};

            obj[field.name] = value;

            const dependentMap: Record<string, string[]> = {
              levelId: ["backgroundId", "subjectId", "chapterId", "topicId"],
              // backgroundId: ["subjectId", "chapterId", "topicId"],
              subjectId: ["chapterId", "topicId"],
              chapterId: ["topicId"],
            };

            if (dependentMap[field.name]) {
              dependentMap[field.name].forEach((dep) => {
                obj[dep] = dep === "backgroundId" ? [] : "";
              });
              if (formData.questionType === "CQ") {
                obj.subQuestions = (formData as ICQ)?.subQuestions?.map(
                  (sq) => {
                    if (sq?.chapterId) sq.chapterId = "";
                    if (sq?.topicId) sq.topicId = "";
                  },
                );
              }
            }

            setFormData({
              ...formData,
              ...obj,
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
        (field?.optionData?.length ? (
          field.name !== "record" ? (
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

                            if (prev.questionType === "CQ") {
                              updated.subQuestions = (
                                prev as ICQ
                              )?.subQuestions?.map((sq) => {
                                if (sq?.chapterId) sq.chapterId = "";
                                if (sq?.topicId) sq.topicId = "";
                                return sq;
                              });
                            }
                          }
                          return updated as IBaseQuestion;
                        });
                      }}
                    />

                    <Label className="font-light">{option.name}</Label>
                  </div>
                );
            })
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {(formData as any).record?.map((r: any) => (
                  <div
                    key={r._id}
                    className="text-xs px-2 py-1 bg-sidebar border rounded-lg"
                  >
                    {r.institution} - {r.year}
                  </div>
                ))}
              </div>

              <div className="relative">
                <Command className="rounded-lg border">
                  <div className="relative">
                    <CommandInput
                      placeholder="Search record..."
                      onFocus={() => setOpen(true)}
                      className="pr-10"
                    />

                    {open && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className=" absolute right-1 top-1/2 -translate-y-1/2 z-10"
                        onClick={() => setOpen(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {open && (
                    <CommandList className="z-10 w-full max-h-40 px-3 py-4 overflow-auto absolute top-10 left-0 bg-background rounded-lg shadow">
                      <CommandGroup>
                        {field.optionData.map((_r: any) => (
                          <CommandItem key={_r._id}>
                            <div className="flex gap-2">
                              <Checkbox
                                checked={(formData as any).record?.some(
                                  (r: any) => r._id === _r._id,
                                )}
                                onCheckedChange={(checked) => {
                                  const record = [
                                    ...((formData as any).record || []),
                                  ];

                                  if (checked) {
                                    record.push(_r);
                                  } else {
                                    const filtered = record.filter(
                                      (r) => r._id !== _r._id,
                                    );

                                    return setFormData({
                                      ...formData,
                                      record: filtered,
                                      recordId: filtered.map((r) => r._id),
                                    });
                                  }

                                  setFormData({
                                    ...formData,
                                    record,
                                    recordId: record.map((r) => r._id),
                                  });
                                }}
                              />

                              <Label>
                                {_r.institution} - {_r.year}
                              </Label>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  )}
                </Command>
              </div>
            </div>
          )
        ) : (
          <small className="font-light pl-3">No {field?.name} available.</small>
        ))}
    </div>
  );
}

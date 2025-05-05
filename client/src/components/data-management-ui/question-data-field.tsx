"use client";

import { DataFieldProps, IRecord } from "@/lib/type";
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
import { Label } from "../ui/label";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useState } from "react";

export default function QuestionDataField<T>({
  formData,
  setFormData,
  field,
}: DataFieldProps<T>) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="space-y-2">
      {field?.label && <Label htmlFor="title">{field.label}</Label>}
      {field?.inputType === "input" && (
        <Input
          type={field?.type ? field?.type : "text"}
          id={field?.name}
          name={field?.name}
          defaultValue={
            (formData as unknown as Record<string, string>)[field?.name]
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name]: e.target.value,
            })
          }
          placeholder={`Enter ${
            field?.placeholder ? field?.placeholder : field?.name
          }`}
        />
      )}

      {field?.inputType === "textarea" && (
        <Textarea
          id={field?.name}
          name={field?.name}
          defaultValue={
            (formData as unknown as Record<string, string>)[field?.name]
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name]: e.target.value,
            })
          }
          placeholder={`Enter ${
            field?.placeholder ? field?.placeholder : field?.name
          }`}
        />
      )}

      {field?.inputType === "select" && (
        <Select
          defaultValue={
            (formData as unknown as Record<string, string>)[field?.name]
          }
          onValueChange={(value) => {
            const obj: Record<string, string> = {};
            if (field?.manualOptionData) {
              obj[field?.name] = value;
            } else {
              obj[field?.name + "Id"] = value.split(",")[0];
              obj[field?.name] = value.split(",")[1];
            }
            return setFormData({ ...formData, ...obj });
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue
              placeholder={`Select ${
                field?.placeholder ? field?.placeholder : field?.name
              }`}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {field?.optionData && field?.optionData.length > 0 ? (
                field.optionData.map((option) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={option?._id}
                    value={
                      field?.manualOptionData
                        ? option?.name
                        : option?._id + "," + option?.name
                    }
                  >
                    {option?.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="No-value" disabled>
                  No {field?.name} available
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {field?.inputType === "checkbox" &&
        (field?.optionData ? (
          field?.optionData.length > 0 &&
          (field?.name !== "record" ? (
            field.optionData.map((option) => (
              <div key={option?._id} className="flex gap-2">
                <Checkbox
                  className="cursor-pointer"
                  defaultChecked={(
                    (formData as unknown as Record<string, string>)[
                      field?.name
                    ] as unknown as string[]
                  )?.includes(option?._id)}
                  onCheckedChange={(change: boolean) =>
                    setFormData(() => {
                      const checkedArr = (
                        formData as unknown as Record<string, string>
                      )[field?.name] as unknown as string[];
                      const checkedArrId = (
                        formData as unknown as Record<string, string>
                      )[field?.name + "Id"] as unknown as string[];

                      if (change) {
                        if (
                          !checkedArrId.includes(option?._id) &&
                          !checkedArr.includes(option?.name)
                        ) {
                          checkedArrId.push(option?._id);
                          checkedArr.push(option?.name);
                        }
                      } else {
                        if (checkedArr.includes(option?._id)) {
                          const indexId = checkedArrId.indexOf(option?._id);
                          const index = checkedArr.indexOf(option?.name);
                          checkedArrId.splice(indexId, 1);
                          checkedArr.splice(index, 1);
                        }
                      }
                      return {
                        ...formData,
                        [field?.name]: checkedArr,
                        [field?.name + "Id"]: checkedArrId,
                      };
                    })
                  }
                />
                <Label className="font-light">{option.name}</Label>
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {(
                  formData as unknown as Record<
                    string,
                    (IRecord & {
                      _id: string;
                    })[]
                  >
                ).record.length > 0 &&
                  (
                    formData as unknown as Record<
                      string,
                      (IRecord & {
                        _id: string;
                      })[]
                    >
                  ).record.map((_r) => (
                    <div
                      key={_r?._id}
                      className="text-xs px-2 py-1 bg-sidebar border-1 rounded-lg"
                    >
                      {_r?.institution + " - " + _r?.year}
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
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-10"
                        onClick={() => setOpen(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {open && (
                    <CommandList className="z-10 w-full max-h-40 px-3 py-4 overflow-auto absolute top-10 left-0 bg-background rounded-lg rounded-t-none shadow">
                      <CommandGroup>
                        {field?.optionData &&
                          field?.optionData.length > 0 &&
                          field.optionData.map((_o) => {
                            const _r = _o as unknown as IRecord & {
                              _id: string;
                            };
                            return (
                              <CommandItem key={_r._id} className="flex gap-2">
                                <div className="flex gap-2">
                                  <Checkbox
                                    className="cursor-pointer"
                                    checked={(
                                      formData as unknown as Record<
                                        string,
                                        (IRecord & {
                                          _id: string;
                                        })[]
                                      >
                                    )?.record.some((r) => r?._id === _r?._id)}
                                    onCheckedChange={(checked: boolean) => {
                                      const { record } =
                                        formData as unknown as {
                                          record: IRecord & { _id: string }[];
                                        };
                                      if (
                                        checked &&
                                        !record.some((r) => r?._id === _r?._id)
                                      ) {
                                        record.push(_r);
                                      } else if (
                                        !checked &&
                                        record.some((r) => r?._id === _r?._id)
                                      ) {
                                        const index = record.indexOf(_r);
                                        record.splice(index, 1);
                                      }

                                      return setFormData({
                                        ...formData,
                                        record,
                                        recordId: record.map((_r) => _r?._id),
                                      });
                                    }}
                                  />
                                  <Label>
                                    {_r?.institution + " - " + _r?.year}
                                  </Label>
                                </div>
                              </CommandItem>
                            );
                          })}
                      </CommandGroup>
                    </CommandList>
                  )}
                </Command>
              </div>
            </div>
          ))
        ) : (
          <small className="font-light pl-3">No {field?.name} available.</small>
        ))}
    </div>
  );
}

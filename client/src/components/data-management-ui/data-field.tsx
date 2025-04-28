"use client";

import { DataFieldProps } from "@/lib/type";
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
import React from "react";

export default function DataField<T>({
  formData,
  setFormData,
  field,
}: DataFieldProps<T>) {
  return (
    <div className="space-y-2">
      {field?.label && <Label htmlFor="title">{field.label}</Label>}
      {field?.inputType === "input" && (
        <Input
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
          placeholder={`Enter ${field?.name}`}
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
          placeholder={`Enter ${field?.name}`}
        />
      )}

      {field?.inputType === "select" && (
        <Select
          defaultValue={
            (formData as unknown as Record<string, string>)[field?.name]
          }
          onValueChange={(value) =>
            setFormData({ ...formData, [field?.name]: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${field?.name}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {field?.optionData && field?.optionData.length > 0 ? (
                field.optionData.map((option) => (
                  <SelectItem
                    key={option?._id}
                    value={field?.manualOptionData ? option?.name : option?._id}
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
          field.optionData.map((option) => (
            <div key={option?._id} className="flex gap-2">
              <Checkbox
                defaultChecked={(
                  (formData as unknown as Record<string, string>)[
                    field?.name
                  ] as unknown as string[]
                ).includes(option?._id)}
                onCheckedChange={(change: boolean) =>
                  setFormData(() => {
                    if (change) {
                      if (
                        !(
                          (formData as unknown as Record<string, string>)[
                            field?.name
                          ] as unknown as string[]
                        ).includes(option?._id)
                      ) {
                        (
                          (formData as unknown as Record<string, string>)[
                            field?.name
                          ] as unknown as string[]
                        ).push(option?._id);
                      }
                    } else {
                      if (
                        (
                          (formData as unknown as Record<string, string>)[
                            field?.name
                          ] as unknown as string[]
                        ).includes(option?._id)
                      ) {
                        const index = (
                          (formData as unknown as Record<string, string>)[
                            field?.name
                          ] as unknown as string[]
                        ).indexOf(option?._id);
                        (
                          (formData as unknown as Record<string, string>)[
                            field?.name
                          ] as unknown as string[]
                        ).splice(index, 1);
                      }
                    }
                    return {
                      ...formData,
                    };
                  })
                }
              />
              <Label className="font-light">{option.name}</Label>
            </div>
          ))
        ) : (
          <small className="font-light pl-3">No {field?.name} available.</small>
        ))}
    </div>
  );
}

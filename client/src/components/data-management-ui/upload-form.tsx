"use client";

import SubmitBtn from "@/components/submit-btn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IField, IFormInfo } from "@/lib/type";
import { FormEvent, RefObject, useEffect, useState } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

export default function UploadForm({
  formInfo,
  closeRef,
}: {
  formInfo: IFormInfo;
  closeRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [formData, setFormData] = useState<Record<string, string>>(
    formInfo?.initData
  );
  const [updatedFields, setUpdatedFields] = useState<IField[]>(
    formInfo?.fields
  );

  //   Show toast on Response
  async function showToastOnRes(res: Response) {
    const data = await res.json();
    console.log(data);
    if (!data.success) {
      console.log(data.message);
      return toast.warning(data.message);
    }
    if (closeRef?.current) {
      closeRef.current.click();
      closeRef.current = null;
    }
    toast.success(data.message);
  }

  //   HANDLE SUBMIT
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("data", formData);

    for (const field of updatedFields) {
      if (!field?.req) field.req = true;

      if (field?.req && !formData[field?.name]) {
        return toast.warning(`${field?.name.toUpperCase()} must be filled in.`);
      }
    }
    console.log(formInfo);
    try {
      if (formInfo.method === "POST" || formInfo.method === "PUT") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}${formInfo?.route}`,
          {
            method: formInfo?.method,
            body: JSON.stringify(formData),
            headers: {
              "Content-type": "application/json",
            },
          }
        );
        showToastOnRes(res);
        return;
      }
      console.log(formInfo?.method);
    } catch (error) {
      console.log(error);
      toast.error("There is an error in server side.");
    }
  };

  useEffect(() => {
    // GET OPTIONS
    async function getOptions() {
      let deleteOptionData = false;
      const query: string[] = [];
      for (const field of updatedFields) {
        if (field.inputType === "select" || field.inputType === "checkbox") {
          if (deleteOptionData) {
            delete field.optionData;
            continue;
          }
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/${field.name}${
                query?.length > 0 ? "?" + query.join("&") : ""
              }`
            );
            const data = await res.json();
            if (data.success) {
              field.optionData = data.data.map((d: Record<string, string>) => {
                return { name: d?.name, _id: d?._id };
              });
              setUpdatedFields((prev) => {
                const i: number = prev.indexOf(field);
                prev.splice(i, 1, field);
                return [...prev];
              });

              if (
                (typeof formData[field?.name] === "string" &&
                  !formData[field?.name]) ||
                (Array.isArray(formData[field?.name]) &&
                  formData[field?.name].length <= 0)
              ) {
                deleteOptionData = true;
                continue;
              }
              if (
                Array.isArray(formData[field?.name]) &&
                formData[field?.name].length > 0
              ) {
                for (const qStr of formData[field?.name]) {
                  query.push(`${field?.name}=${qStr}`);
                }
              } else query.push(`${field?.name}=${formData[field?.name]}`);
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
    getOptions();
  }, [formData]);

  // console.log(updatedFields);
  // console.log(formData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {updatedFields?.length > 0 &&
        updatedFields.map((field: IField, i) => (
          <div key={i} className="space-y-2">
            {field?.label && <Label htmlFor="title">{field.label}</Label>}
            {field?.inputType === "input" && (
              <Input
                id={field?.name}
                name={field?.name}
                defaultValue={formData[field?.name]}
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
                defaultValue={formData[field?.name]}
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
                defaultValue={formData[field?.name]}
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
                        <SelectItem key={option?._id} value={option?._id}>
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
                        formData[field?.name] as unknown as string[]
                      ).includes(option?._id)}
                      onCheckedChange={(change: boolean) =>
                        setFormData(() => {
                          if (change) {
                            if (
                              !(
                                formData[field?.name] as unknown as string[]
                              ).includes(option?._id)
                            ) {
                              (
                                formData[field?.name] as unknown as string[]
                              ).push(option?._id);
                            }
                          } else {
                            if (
                              (
                                formData[field?.name] as unknown as string[]
                              ).includes(option?._id)
                            ) {
                              const index = (
                                formData[field?.name] as unknown as string[]
                              ).indexOf(option?._id);
                              (
                                formData[field?.name] as unknown as string[]
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
                <small className="font-light pl-3">
                  No {field?.name} available.
                </small>
              ))}
          </div>
        ))}
      <SubmitBtn />
    </form>
  );
}

"use client";

import { ArchiveX, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useRef } from "react";
import { IField } from "@/lib/type";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import UploadForm from "./upload-form";
import { createFormInfo, getQueryFormInitData } from "@/lib/utils";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";

export default function AllData({
  heading,
  route,
  fields,
}: {
  heading: string;
  route: string;
  fields: IField[];
}) {
  // console.log(fields);
  const [allData, setAllData] = useState<Record<string, string>[]>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [updatedFields, setUpdatedFields] = useState<IField[]>(fields);
  const [queryForm, setQueryForm] = useState<Record<string, string>>(
    getQueryFormInitData(fields)
  );
  const [allDataQueryString, setAllDataQueryString] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  // Simulate fetching class data from an API
  useEffect(() => {
    // You can replace this with an actual API call
    async function geAllData() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}${route}${allDataQueryString}`
        );

        const data = await res.json();
        if (data.success) {
          setAllData(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    geAllData();
  }, [route, allDataQueryString]);

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
              const newFields = [...fields];
              const i: number = newFields.indexOf(field);
              newFields.splice(i, 1, field);
              setUpdatedFields([...newFields]);

              if (
                (typeof queryForm[field?.name] === "string" &&
                  !queryForm[field?.name]) ||
                (Array.isArray(queryForm[field?.name]) &&
                  queryForm[field?.name].length <= 0)
              ) {
                deleteOptionData = true;
                continue;
              }

              if (
                Array.isArray(queryForm[field?.name]) &&
                queryForm[field?.name].length > 0
              ) {
                for (const qStr of queryForm[field?.name]) {
                  query.push(`${field?.name}=${qStr}`);
                }
              } else query.push(`${field?.name}=${queryForm[field?.name]}`);
            }
          } catch (error) {
            console.error(error);
          }
        }
      }

      if (query?.length > 0) {
        setAllDataQueryString("?" + query.join("&"));
      }
      return;
    }
    getOptions();
  }, [queryForm]);

  // DELETE
  async function deleteData(id: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}${route}/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        if (closeRef?.current) {
          closeRef.current.click();
          closeRef.current = null;
        }
        toast.success(data.message);

        return;
      }
      toast.error(data.message);
      return;
    } catch (err) {
      console.log(err);
      toast.error("Server Error!");
      return;
    }
  }

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All {heading}s</h2>
      <div className="flex gap-5">
        {updatedFields?.length > 0 &&
          updatedFields.map((field: IField, i) => (
            <div key={i}>
              {field?.inputType === "select" && (
                <Select
                  defaultValue={queryForm[field?.name]}
                  onValueChange={(value) =>
                    setQueryForm({ ...queryForm, [field?.name]: value })
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
              {field?.inputType === "checkbox" && (
                <div className="relative">
                  <Command>
                    <div className="relative">
                      <CommandInput
                        placeholder={`Search ${field?.label}`}
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
                      <CommandList className="z-50 w-full max-h-40 px-3 py-4 overflow-auto absolute top-10 left-0 bg-background rounded-lg rounded-t-none shadow">
                        <CommandGroup>
                          {field?.optionData && field?.optionData.length > 0 ? (
                            field.optionData.map((option) => (
                              <CommandItem key={option?._id}>
                                <div className="flex gap-2">
                                  <Checkbox
                                    defaultChecked={(
                                      queryForm[
                                        field?.name
                                      ] as unknown as string[]
                                    ).includes(option?._id)}
                                    onCheckedChange={(change: boolean) =>
                                      setQueryForm(() => {
                                        if (change) {
                                          if (
                                            !(
                                              queryForm[
                                                field?.name
                                              ] as unknown as string[]
                                            ).includes(option?._id)
                                          ) {
                                            (
                                              queryForm[
                                                field?.name
                                              ] as unknown as string[]
                                            ).push(option?._id);
                                          }
                                        } else {
                                          if (
                                            (
                                              queryForm[
                                                field?.name
                                              ] as unknown as string[]
                                            ).includes(option?._id)
                                          ) {
                                            const index = (
                                              queryForm[
                                                field?.name
                                              ] as unknown as string[]
                                            ).indexOf(option?._id);
                                            (
                                              queryForm[
                                                field?.name
                                              ] as unknown as string[]
                                            ).splice(index, 1);
                                          }
                                        }
                                        return {
                                          ...queryForm,
                                        };
                                      })
                                    }
                                  />
                                  <Label className="font-light">
                                    {option.name}
                                  </Label>
                                </div>
                              </CommandItem>
                            ))
                          ) : (
                            <small>No {field?.label} available</small>
                          )}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </div>
              )}
            </div>
          ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {fields.length > 0 &&
              fields.map((field, i) => (
                <TableHead key={i}>{field?.label}</TableHead>
              ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allData.length > 0 ? (
            allData.map((data, index) => (
              <TableRow className="space-x-8" key={index}>
                {fields.length > 0 &&
                  fields.map((field, i) => (
                    <TableCell className="whitespace-pre-wrap" key={i}>
                      {(() => {
                        const value = data[field?.name];
                        if (Array.isArray(value)) {
                          return (value as { name: string; _id: string }[])
                            .map((v) => v.name)
                            .join(" ,");
                        }
                        if (
                          typeof value === "object" &&
                          value !== null &&
                          "name" in value
                        ) {
                          return (value as { name: string }).name;
                        } else {
                          return value;
                        }
                      })()}
                    </TableCell>
                  ))}
                <TableCell className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        ref={closeRef}
                      >
                        <Edit />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update the {heading}</DialogTitle>
                        <DialogDescription>
                          Changes will reflect the Questions.
                        </DialogDescription>
                      </DialogHeader>
                      <UploadForm
                        formInfo={createFormInfo("PUT", route, fields, data)}
                        closeRef={closeRef}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        ref={closeRef}
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        <ArchiveX />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{`Are you sure want to delete the ${heading} '${data?.name}'?`}</DialogTitle>
                        <DialogDescription>
                          {"Once deleted, level won't be restored."}
                        </DialogDescription>
                      </DialogHeader>
                      <Button
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => deleteData(data?._id)}
                      >
                        Yes
                      </Button>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={fields?.length + 1} className=" text-center">
                No Data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-center space-x-2 py-4">
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

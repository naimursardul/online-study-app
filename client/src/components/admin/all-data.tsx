import { ArchiveX, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useRef, useMemo } from "react";
import type { IField, IMasterData, IQueryFormData } from "@/types/types";
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
import { client, createFormInfo, getQuestionDataOption } from "@/lib/utils";
import DataField from "./data-field";
import { useOutletContext } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState<boolean>(true);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  // const [allDataQueryString, setAllDataQueryString] = useState<string>("");
  const [queryFormData, setQueryFormData] = useState<IQueryFormData>({});
  const masterData = useOutletContext<IMasterData>();

  // Option data
  const updatedFields = useMemo(
    () => getQuestionDataOption(queryFormData, masterData, fields),
    [queryFormData, masterData]
  );

  // Simulate fetching class data from an API
  useEffect(() => {
    async function geAllData() {
      console.log(queryFormData);
      const query: string[] = [];
      for (const key in queryFormData) {
        const value = queryFormData[key as keyof IQueryFormData];
        if (key === "name") {
          query.push(`search=${value}`);
          continue;
        }

        if (Array.isArray(value) && value.length > 0) {
          value.forEach((v) => query.push(`${key}=${v}`));
        } else if (value) {
          query.push(`${key}=${value}`);
        }
      }
      const allDataQueryString: string = query.length
        ? "?" + query.join("&")
        : "";

      try {
        const res = await client.get(`${route}${allDataQueryString}`);

        const { data } = res;
        if (data.success) {
          setAllData(data.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    geAllData();
  }, [route, queryFormData]);

  console.log(loading);
  // DELETE
  async function deleteData(id: string) {
    try {
      const res = await client.delete(`${route}/${id}`, {
        method: "DELETE",
      });
      const { data } = res;
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
  console.log(queryFormData);

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All {heading}s</h2>
      <div className="flex gap-5">
        {updatedFields?.length > 0 &&
          updatedFields.map((field: IField, i) => {
            if (field.name !== "details")
              return (
                <DataField
                  key={i}
                  formData={queryFormData}
                  setFormData={setQueryFormData}
                  field={field}
                  forAllDataPage={true}
                />
              );
          })}
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
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={fields?.length + 1}>
                  <Skeleton className="h-6 w-full mb-2 bg-input" />
                </TableCell>
              </TableRow>
            ))
          ) : allData.length > 0 ? (
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
                    <DialogContent className="sm:max-w-106.25">
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
                    <DialogContent className="sm:max-w-106.25">
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

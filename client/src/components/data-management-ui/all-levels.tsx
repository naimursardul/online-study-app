"use client";

import { ArchiveX, Edit } from "lucide-react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState, useEffect, useRef } from "react";
import { ILevel } from "@/lib/type";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";
import UploadForm from "./upload-form";
import { toast } from "sonner";
import { createFormInfo } from "@/lib/utils";

export default function AllLevels() {
  const [levels, setLevels] = useState<(ILevel & { _id: string })[]>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Simulate fetching class data from an API
  useEffect(() => {
    // You can replace this with an actual API call
    async function geAllLevels() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/level`
        );

        const data = await res.json();
        console.log(data);
        if (data.success) {
          setLevels(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    geAllLevels();
  }, []);

  async function deleteData(id: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/level/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        if (closeRef?.current) {
          closeRef.current.click();
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

  const tableInfo: { title: string; dbTitle: string }[] = [
    {
      title: "Level",
      dbTitle: "name",
    },
    {
      title: "Details",
      dbTitle: "details",
    },
  ];

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All levels</h2>
      <Table>
        <TableHeader>
          <TableRow>
            {tableInfo.length > 0 &&
              tableInfo.map((ti, i) => (
                <TableHead key={i}>{ti?.title}</TableHead>
              ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels.length > 0 ? (
            levels.map((data, index) => (
              <TableRow className="space-x-8" key={index}>
                {tableInfo.length > 0 &&
                  tableInfo.map((ti, i) => (
                    <TableCell className="whitespace-pre-wrap " key={i}>
                      {(data as unknown as Record<string, string>)[ti?.dbTitle]}
                    </TableCell>
                  ))}
                <TableCell className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        <Edit />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update the data</DialogTitle>
                        <DialogDescription>
                          Changes will reflect the Questions.
                        </DialogDescription>
                      </DialogHeader>
                      <UploadForm
                        formInfo={createFormInfo(
                          "PUT",
                          `/api/level/`,
                          [
                            {
                              label: "Name",
                              inputType: "input",
                              name: "name",
                            },
                            {
                              label: "Details",
                              inputType: "textarea",
                              name: "details",
                            },
                          ],
                          { ...data }
                        )}
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
                        <DialogTitle>{`Are you sure want to delete the Level '${data?.name}'?`}</DialogTitle>
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
              <TableCell colSpan={2} className="text-center">
                No levels available.
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

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
import { useState, useEffect } from "react";
import { ClassType } from "@/lib/type";

export default function AllClasses() {
  const [classes, setClasses] = useState<ClassType[]>([]);

  // Simulate fetching class data from an API
  useEffect(() => {
    // You can replace this with an actual API call
    setClasses([]);
  }, []);

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All Classes</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.length > 0 ? (
            classes.map((student_class, index) => (
              <TableRow key={index}>
                <TableCell>{student_class?.title}</TableCell>
                <TableCell className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <Edit />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <ArchiveX />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                No classes available.
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

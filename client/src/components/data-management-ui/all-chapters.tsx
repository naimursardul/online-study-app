"use client";

import { ArchiveX, Edit } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState, useEffect } from "react";
import { ChapterType } from "@/lib/type";

export default function AllChapters() {
  const [filter, setFilter] = useState<{
    student_class?: string;
    subject?: string;
    chapter?: string;
  }>({});
  const [chapters, setChapters] = useState<ChapterType[]>([]);

  // Fetch chapters based on selected class and subject
  useEffect(() => {
    if (filter.student_class && filter.subject) {
      fetch(
        `/api/chapters?class=${filter.student_class}&subject=${filter.subject}`
      )
        .then((res) => res.json())
        .then((data) => setChapters(data));
    } else {
      setChapters([]);
    }
  }, [filter.student_class, filter.subject]);

  function handleOnChange(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  console.log(filter);

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All Chapters</h2>
      <div>
        <form onChange={handleOnChange} className="flex flex-wrap gap-3">
          <Select name="student_class">
            <SelectTrigger>
              <SelectValue placeholder="Select Student class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="hsc">HSC</SelectItem>
                <SelectItem value="ssc">SSC</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select name="subject">
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="physics1">Physics 1st</SelectItem>
                <SelectItem value="chemistry2">Chemistry 2nd</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>
      </div>

      {/* Table displaying chapters based on selected class and subject */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Chapter</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <TableRow key={chapter._id}>
                <TableCell>{filter.student_class?.toUpperCase()}</TableCell>
                <TableCell>{filter.subject}</TableCell>
                <TableCell>{chapter.title}</TableCell>
                <TableCell className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className=" cursor-pointer"
                  >
                    <Edit />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className=" cursor-pointer"
                  >
                    <ArchiveX />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No chapters available for the selected class and subject
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination (optional) */}
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

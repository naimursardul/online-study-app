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
import { SubjectType } from "@/lib/type";

export default function AllSubjects() {
  const [filter, setFilter] = useState<{
    student_class?: string;
  }>({});
  const [subjects, setSubjects] = useState<SubjectType[]>([]);

  // Fetch subjects based on selected student class
  useEffect(() => {
    if (filter.student_class) {
      fetch(`/api/subjects?class=${filter.student_class}`)
        .then((res) => res.json())
        .then((data) => setSubjects(data));
    } else {
      setSubjects([]);
    }
  }, [filter.student_class]);

  function handleOnChange(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  console.log(filter);

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All Subjects</h2>
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
        </form>
      </div>

      {/* Table displaying subjects based on the selected class */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{filter.student_class?.toUpperCase()}</TableCell>
                <TableCell>{subject.name}</TableCell>
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
              <TableCell colSpan={3} className="text-center">
                No subjects available for the selected class
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

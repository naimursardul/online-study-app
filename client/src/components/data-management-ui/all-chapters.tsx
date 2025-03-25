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
import { useState } from "react";

export default function AllChapter() {
  const [filter, setFilter] = useState<{
    student_class?: string;
    subject?: string;
    chapter?: string;
  }>({});

  function handleOnChange(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  console.log(filter);

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All Topics</h2>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Chapter</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>HSC</TableCell>
            <TableCell>Physics 1st</TableCell>
            <TableCell>Gravity & Gravitation</TableCell>
            <TableCell className="flex gap-3">
              <Button size="sm" variant="outline" className=" cursor-pointer">
                <Edit />
              </Button>
              <Button size="sm" variant="outline" className=" cursor-pointer">
                <ArchiveX />
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>HSC</TableCell>
            <TableCell>Physics 1st</TableCell>
            <TableCell>Gravity & Gravitation</TableCell>
            <TableCell className="flex gap-3">
              <Button size="sm" variant="outline" className=" cursor-pointer">
                <Edit />
              </Button>
              <Button size="sm" variant="outline" className=" cursor-pointer">
                <ArchiveX />
              </Button>
            </TableCell>
          </TableRow>
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

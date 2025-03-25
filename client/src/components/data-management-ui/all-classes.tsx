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

export default function AllClasses() {
  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All Topics</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>HSC</TableCell>
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

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
import { RecordType } from "@/lib/type";

export default function AllRecords() {
  const [recordType, setRecordType] = useState<string | undefined>(undefined);
  const [year, setYear] = useState<string | undefined>(undefined);
  const [records, setRecords] = useState<RecordType[]>([]);

  // Fetch records based on record type and/or year
  useEffect(() => {
    let url = "/api/records";
    const filters = [];

    if (recordType) filters.push(`record_type=${recordType}`);
    if (year) filters.push(`year=${year}`);

    if (filters.length > 0) {
      url += `?${filters.join("&")}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setRecords(data));
  }, [recordType, year]);

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All Records</h2>
      <div>
        <form className="flex flex-wrap gap-3">
          {/* Record Type Filter */}
          <Select
            onValueChange={(value) => setRecordType(value)}
            value={recordType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Record Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select onValueChange={(value) => setYear(value)} value={year}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>
      </div>

      {/* Display filtered records */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Record Type</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length > 0 ? (
            records.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{record.recordType}</TableCell>
                <TableCell>{record.institution}</TableCell>
                <TableCell>{record.year}</TableCell>
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
              <TableCell colSpan={4} className="text-center">
                No records available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
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

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
import { TopicType } from "@/lib/type";

export default function AllTopics() {
  const [filter, setFilter] = useState<{
    student_class?: string;
    subject?: string;
    chapter?: string;
  }>({});
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<TopicType[]>([]);

  // Fetch subjects based on the selected class
  useEffect(() => {
    if (filter.student_class) {
      fetch(`/api/subjects?class=${filter.student_class}`)
        .then((res) => res.json())
        .then((data) => setSubjects(data));
    } else {
      setSubjects([]);
    }
  }, [filter.student_class]);

  // Fetch chapters based on the selected subject
  useEffect(() => {
    if (filter.subject) {
      fetch(`/api/chapters?subject=${filter.subject}`)
        .then((res) => res.json())
        .then((data) => setChapters(data));
    } else {
      setChapters([]);
    }
  }, [filter.subject]);

  // Fetch topics based on class, subject, and chapter selections
  useEffect(() => {
    if (filter.student_class) {
      let url = `/api/topics?class=${filter.student_class}`;
      if (filter.subject) {
        url += `&subject=${filter.subject}`;
      }
      if (filter.chapter) {
        url += `&chapter=${filter.chapter}`;
      }

      fetch(url)
        .then((res) => res.json())
        .then((data) => setTopics(data));
    } else {
      setTopics([]);
    }
  }, [filter.student_class, filter.subject, filter.chapter]);

  function handleOnChange(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="w-full space-y-5">
      <h2 className="text-xl font-bold">All Topics</h2>
      <div>
        <form onChange={handleOnChange} className="flex flex-wrap gap-3">
          {/* Student Class Filter */}
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

          {/* Subject Filter */}
          <Select name="subject" disabled={!filter.student_class}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">
                    Select a class first
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Chapter Filter */}
          <Select name="chapter" disabled={!filter.subject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {chapters.length > 0 ? (
                  chapters.map((chapter) => (
                    <SelectItem key={chapter} value={chapter}>
                      {chapter}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">
                    Select a subject first
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>
      </div>

      {/* Display filtered topics */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Chapter</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.length > 0 ? (
            topics.map((topic) => (
              <TableRow key={topic._id}>
                <TableCell>{topic.studentClass}</TableCell>
                <TableCell>{topic.subject}</TableCell>
                <TableCell>{topic.chapter}</TableCell>
                <TableCell>{topic.title}</TableCell>
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
              <TableCell colSpan={5} className="text-center">
                No topics available
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

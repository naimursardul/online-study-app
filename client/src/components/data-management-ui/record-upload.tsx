"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState, ChangeEvent, FormEvent } from "react";
import SubmitBtn from "../submit-btn";
import { RecordType } from "@/lib/type";

export default function RecordForm() {
  const [formData, setFormData] = useState<RecordType>({
    recordType: "",
    institution: "",
    year: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Card className="max-w-md w-full mx-auto p-4 mt-10 shadow-md">
      <CardContent>
        <h2 className="text-xl font-semibold text-center mb-4">Record Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recordType">Record Type</Label>
            <Input
              id="recordType"
              name="recordType"
              value={formData.recordType}
              onChange={handleChange}
              placeholder="Enter record type"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Enter institution name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              placeholder="Enter year"
            />
          </div>
          <SubmitBtn />
        </form>
      </CardContent>
    </Card>
  );
}

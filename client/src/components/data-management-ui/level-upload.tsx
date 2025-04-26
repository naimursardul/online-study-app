"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { IFormInfo } from "@/lib/type";
import UploadForm from "./upload-form";
import { TFormInfo } from "@/lib/utils";

export default function LevelUpload() {
  const formInfo: IFormInfo = new TFormInfo("POST", `/api/level`, [
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
  ]);

  return (
    <Card className="max-w-md w-full mx-auto p-4 mt-10 shadow-md">
      <CardContent>
        <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
          <PlusCircle />
          <span>Create a Level</span>
        </h2>
        <UploadForm formInfo={formInfo} />
      </CardContent>
    </Card>
  );
}

{
  /* <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Details</Label>
            <Textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Enter details about the class"
            />
          </div>

          <SubmitBtn />
        </form> */
}

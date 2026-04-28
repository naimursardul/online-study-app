import AllData from "@/components/admin/all-data";
import UploadForm from "@/components/admin/upload-form";
import { Card, CardContent } from "@/components/ui/card";
import { createFormInfo } from "@/lib/utils";
import type { IField } from "@/types/types";
import { PlusCircle } from "lucide-react";

export default function Topic() {
  const fields: IField[] = [
    {
      label: "Level",
      inputType: "select",
      name: "levelId",
    },
    {
      label: "Background",
      inputType: "checkbox",
      name: "backgroundId",
    },
    {
      label: "Subject",
      inputType: "select",
      name: "subjectId",
    },
    {
      label: "Chapter",
      inputType: "select",
      name: "chapterId",
    },
    {
      label: "Name",
      inputType: "input",
      name: "name",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-10">
      <Card className="max-w-md w-full mx-auto p-4 mt-10 shadow-md">
        <CardContent>
          <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
            <PlusCircle />
            <span>Create a Topic</span>
          </h2>
          <UploadForm formInfo={createFormInfo("POST", `/topic`, fields)} />
        </CardContent>
      </Card>
      <AllData heading={"Topic"} route={`/topic`} fields={fields} />
    </div>
  );
}

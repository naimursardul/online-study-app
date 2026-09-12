import AllData from "@/components/admin/all-data";
import UploadForm from "@/components/admin/upload-form";
import { Card, CardContent } from "@/components/ui/card";
import type { IField } from "@/types/types";
import { createFormInfo } from "@/utils/utils";
import { PlusCircle } from "lucide-react";

export default function Year() {
  const fields: IField[] = [
    {
      label: "Level",
      inputType: "select",
      name: "levelId",
    },
    {
      label: "Year",
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
            <span>Create a Year</span>
          </h2>
          <UploadForm formInfo={createFormInfo("POST", `/year`, fields)} />
        </CardContent>
      </Card>
      <AllData heading={"Year"} route={`/year`} fields={fields} />
    </div>
  );
}

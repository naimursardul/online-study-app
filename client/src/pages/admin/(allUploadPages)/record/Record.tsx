import { Card, CardContent } from "@/components/ui/card";
import type { IField } from "@/types/types";
import { PlusCircle } from "lucide-react";
import AllData from "@/components/admin/all-data";
import UploadForm from "@/components/admin/upload-form";
import { createFormInfo } from "@/utils/utils";

export default function Record() {
  const fields: IField[] = [
    {
      label: "Type",
      inputType: "select",
      name: "recordType",
      manualOptionData: true,
      optionData: [
        { _id: "Board", name: "Board" },
        { _id: "Admission", name: "Admission" },
      ],
    },
    {
      label: "Institution",
      inputType: "input",
      name: "institution",
    },
    {
      label: "Year",
      inputType: "input",
      name: "year",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-10">
      <Card className="max-w-md w-full mx-auto p-4 mt-10 shadow-md">
        <CardContent>
          <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
            <PlusCircle />
            <span>Create a Record</span>
          </h2>
          <UploadForm formInfo={createFormInfo("POST", `/record`, fields)} />
        </CardContent>
      </Card>
      <AllData heading={"Record"} route={`/record`} fields={fields} />
    </div>
  );
}

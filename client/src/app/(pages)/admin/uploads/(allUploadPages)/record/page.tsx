import AllData from "@/components/data-management-ui/all-data";
import UploadForm from "@/components/data-management-ui/upload-form";
import { Card, CardContent } from "@/components/ui/card";
import { IField } from "@/lib/type";
import { createFormInfo } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export default function page() {
  const fields: IField[] = [
    {
      label: "Type",
      inputType: "select",
      name: "recordType",
      manualOptionData: true,
      optionData: [
        { _id: "1board", name: "Board" },
        { _id: "2admission", name: "Admission" },
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
          <UploadForm
            formInfo={createFormInfo("POST", `/api/record`, fields)}
          />
        </CardContent>
      </Card>
      <AllData heading={"Record"} route={`/api/record`} fields={fields} />
    </div>
  );
}

import AllData from "@/components/data-management-ui/all-data";
import UploadForm from "@/components/data-management-ui/upload-form";
import { Card, CardContent } from "@/components/ui/card";
import { IField } from "@/lib/type";
import { createFormInfo } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export default function page() {
  const fields: IField[] = [
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
  ];

  return (
    <div className="w-full flex flex-col items-center gap-10">
      <Card className="max-w-md w-full mx-auto p-4 mt-10 shadow-md">
        <CardContent>
          <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
            <PlusCircle />
            <span>Create a Level</span>
          </h2>
          <UploadForm formInfo={createFormInfo("POST", `/api/level`, fields)} />
        </CardContent>
      </Card>
      <AllData heading={"Level"} route={`/api/level`} fields={fields} />
    </div>
  );
}

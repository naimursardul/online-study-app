import AllData from "@/components/admin/all-data";
import UploadForm from "@/components/admin/upload-form";
import { Card, CardContent } from "@/components/ui/card";
import type { IField } from "@/types/types";
import { QUESTION_TYPE_OPTIONS } from "@/utils/questionTypes";
import { createFormInfo } from "@/utils/utils";
import { PlusCircle } from "lucide-react";

export default function Institution() {
  const fields: IField[] = [
    {
      label: "Level",
      inputType: "select",
      name: "levelId",
    },
    // Which subjects this institution covers. Options come from master data
    // (filtered by the chosen level); leaving it empty means every subject.
    {
      label: "Subject",
      inputType: "checkbox",
      name: "subjectId",
    },
    {
      label: "Name",
      inputType: "input",
      name: "name",
    },
    // Which question types this institution offers. The options are literal codes —
    // they are stored on the institution verbatim, not looked up in master data.
    // Leaving it empty means "every type", so existing institutions keep working.
    {
      label: "Question Types",
      inputType: "checkbox",
      name: "questionTypes",
      manualOptionData: true,
      optionData: QUESTION_TYPE_OPTIONS,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-10">
      <Card className="max-w-md w-full mx-auto p-4 mt-10 shadow-md">
        <CardContent>
          <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
            <PlusCircle />
            <span>Create an Institution</span>
          </h2>
          <UploadForm formInfo={createFormInfo("POST", `/institution`, fields)} />
        </CardContent>
      </Card>
      <AllData heading={"Institution"} route={`/institution`} fields={fields} />
    </div>
  );
}

import { useMemo, useState, type RefObject } from "react";
import { toast } from "sonner";
import type { IField, IFormInfo } from "@/types/types";
import { client, getQuestionDataOption } from "@/utils/utils";
import { useMasterData } from "@/lib/MasterData-context";
import SubmitBtn from "../submit-btn/submit-btn";
import DataField from "./data-field";

export default function UploadForm({
  formInfo,
  closeRef,
}: {
  formInfo: IFormInfo;
  closeRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [formData, setFormData] = useState<Record<string, string>>(
    formInfo?.initData
  );

  const { masterData } = useMasterData();

  //   Show toast on Responses
  function showToastOnRes(data: { success: boolean; message: string }) {
    console.log(data);
    if (!data.success) {
      console.log(data.message);
      return toast.warning(data.message);
    }
    if (closeRef?.current) {
      closeRef.current.click();
      closeRef.current = null;
    }
    toast.success(data.message);
  }

  console.log(formData);
  //   HANDLE SUBMIT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("data", formData);

    for (const field of updatedFields) {
      if (!field?.req) field.req = true;

      if (field?.req && !formData[field?.name]) {
        return toast.warning(`${field?.name.toUpperCase()} must be filled in.`);
      }
    }
    try {
      if (formInfo.method === "POST" || formInfo.method === "PUT") {
        const res = await client({
          url: formInfo?.route,
          method: formInfo.method,
          data: formData,
        });
        showToastOnRes(res.data);
      }
      return;
    } catch (error) {
      console.log(error);
      toast.error("There is an error in server side.");
      return;
    }
  };

  const updatedFields = useMemo(
    () => getQuestionDataOption(formData, masterData, formInfo.fields),
    [formData, masterData, formInfo.fields]
  );

  // console.log(formData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {updatedFields?.length > 0 &&
        updatedFields.map((field: IField, i) => (
          <DataField
            key={i}
            formData={formData}
            setFormData={setFormData}
            field={field}
          />
        ))}
      <SubmitBtn />
    </form>
  );
}

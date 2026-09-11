import { useMemo, useState, type RefObject } from "react";
import { toast } from "sonner";
import type { IField, IFormInfo } from "@/types/types";
import { client, getQuestionDataOption } from "@/utils/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import { useMasterData } from "@/lib/MasterData-context";
import SubmitBtn from "../submit-btn/submit-btn";
import DataField from "./data-field";

export default function UploadForm<T>({
  formInfo,
  closeRef,
}: {
  formInfo: IFormInfo<T>;
  closeRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [formData, setFormData] = useState<T>(formInfo?.initData);
  // Without this the submit button stays enabled and a second click creates
  // a duplicate taxonomy row while the first request is in flight.
  const [loading, setLoading] = useState(false);

  const { masterData } = useMasterData();

  // =========================================
  // Show toast on Responses
  // =========================================
  function showToastOnRes(data: { success: boolean; message: string }) {
    if (!data.success) {
      return toast.error(data.message);
    }
    if (closeRef?.current) {
      closeRef.current.click();
      closeRef.current = null;
    }
    toast.success(data.message);
  }

  // =========================================
  // HANDLE SUBMIT
  // =========================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    for (const field of updatedFields) {
      if (!field?.req) field.req = true;

      if (field?.req && !formData[field?.name as keyof T]) {
        return toast.warning(`${field?.name.toUpperCase()} must be filled in.`);
      }
    }
    setLoading(true);
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
      toast.error(getApiErrorMessage(error, "Something went wrong. Please try again."));
      return;
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UPDATED FIELDS
  // =========================================

  const updatedFields = useMemo(
    () => getQuestionDataOption(formData, masterData, formInfo.fields),
    [formData, masterData, formInfo.fields],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {updatedFields?.length > 0 &&
        updatedFields.map((field: IField, i: number) => (
          <DataField
            key={i}
            formData={formData}
            setFormData={setFormData}
            field={field}
          />
        ))}
      <SubmitBtn loading={loading} />
    </form>
  );
}

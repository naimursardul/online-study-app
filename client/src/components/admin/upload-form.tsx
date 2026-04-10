import { useEffect, useState, type RefObject } from "react";
import { toast } from "sonner";
import type { IField, IFormInfo, IOptionData } from "@/types/types";
import { client } from "@/lib/utils";
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
  const [updatedFields, setUpdatedFields] = useState<IField[]>(
    formInfo?.fields
  );

  //   Show toast on Response
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

  useEffect(() => {
    async function getOptions() {
      let deleteOptionData = false;
      const query: string[] = [];

      // Create a cloned copy up front
      const newFields = updatedFields.map((f) => ({ ...f }));

      for (const field of newFields) {
        if (field.inputType === "select" || field.inputType === "checkbox") {
          if (deleteOptionData) {
            delete field.optionData;
            continue;
          }

          // Only fetch if no manual options and no optionData yet
          if (!field.manualOptionData && !field.optionData) {
            try {
              const res = await client.get(
                `/${field.name}${query.length ? `?${query.join("&")}` : ""}`
              );
              const { data } = res;

              if (data.success) {
                field.optionData = data.data.map((d: IOptionData) => ({
                  name: d.name,
                  _id: d._id,
                }));
              }
            } catch (err) {
              console.error(err);
            }
          }

          const val = formData[field.name];

          // If value is empty → stop fetching later fields
          if (!val || (Array.isArray(val) && val.length === 0)) {
            deleteOptionData = true;
            continue;
          }

          // Build query parameters
          if (Array.isArray(val)) {
            val.forEach((v) => query.push(`${field.name}=${v}`));
          } else {
            query.push(`${field.name}=${val}`);
          }
        }
      }

      // ✅ Apply all changes together
      setUpdatedFields(newFields);
    }

    getOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // console.log(updatedFields);
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

import { client } from "@/utils/utils";
import axios from "axios";

export const uploadTempImage = async (file: File): Promise<string> => {
  // Request a signed upload URL for the temp folder
  const extension = file?.name?.split(".").pop()?.toLowerCase();

  console.log(extension);
  if (!extension) throw Error("No extension found!");
  const res = await client.post("/img-upload/generate-upload-url", {
    folder: "temp",
    extension,
  });
  console.log(res.data);
  const { uploadUrl, key } = res.data.data;

  // Upload original file (no compression)
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });

  // Return the public URL that Nano Banana can access
  return import.meta.env.VITE_CDN_BASE_URL + "/" + key;
};

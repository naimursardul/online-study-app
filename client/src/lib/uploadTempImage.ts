import { client } from "@/utils/utils";
import axios from "axios";

export const uploadTempImage = async (file: File): Promise<string> => {
  // Request a signed upload URL for the temp folder
  const extension = file?.name?.split(".").pop()?.toLowerCase();

  if (!extension) throw Error("No extension found!");
  const res = await client.post("/img-upload/generate-upload-url", {
    folder: "temp",
    extension,
  });

  // Keep-both-paths: read the envelope before destructuring it, so a
  // failure body can't become an "uploadUrl" of undefined.
  if (!res.data?.success || !res.data?.data?.uploadUrl) {
    throw new Error(res.data?.message || "Could not get an upload URL.");
  }
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

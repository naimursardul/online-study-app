import axios from "axios";
import imageCompression from "browser-image-compression";
import { client } from "../utils/utils";
import { getApiErrorMessage } from "./api-error";
import { uploadTempImage } from "./uploadTempImage";
import { enhanceImage } from "./enhanceImage";

type UploadImagePayload = {
  isEnhanched: boolean;
  file: File;
  folder?: string;
};

export const uploadImage = async ({
  isEnhanched,
  file,
  folder = "questions",
}: UploadImagePayload) => {
  let fileToCompress = file;
  try {
    if (isEnhanched) {
      const tempUrl = await uploadTempImage(file);
      fileToCompress = await enhanceImage(tempUrl);
    }
    // Compress + convert to webp
    const compressedFile = await imageCompression(fileToCompress, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/webp",
    });

    // Get upload URL
    const uploadRes = await client.post(`/img-upload/generate-upload-url`, {
      folder,
      extension: "webp",
    });

    if (!uploadRes.data.success) {
      throw new Error(uploadRes.data.message);
    }
    const { key, uploadUrl } = uploadRes.data.data;

    // Upload to R2
    await axios.put(uploadUrl, compressedFile, {
      headers: {
        "Content-Type": compressedFile.type,
      },
    });

    return {
      key,
      mimeType: "image/webp",
      size: compressedFile.size,
    };
  } catch (error) {
    console.error(error);
    // Keep the specific cause (too large, quota, auth, R2 outage) instead of
    // collapsing every failure into one string. Errors thrown by our own
    // helpers already carry the server's message; axios errors get the
    // status-mapped wording.
    if (axios.isAxiosError(error)) {
      throw new Error(getApiErrorMessage(error, "Image upload failed."));
    }
    throw error;
  }
};

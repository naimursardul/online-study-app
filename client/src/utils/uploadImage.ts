import axios from "axios";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { client } from "./utils";

type UploadImagePayload = {
  file: File;
  folder?: string;
};

export const uploadImage = async ({
  file,
  folder = "questions",
}: UploadImagePayload) => {
  try {
    // Compress + convert to webp
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/webp",
    });

    console.log(compressedFile);
    // Get upload URL
    const uploadRes = await client.post(`/img-upload/generate-upload-url`, {
      folder,
      extension: "webp",
    });

    if (!uploadRes.data.success) {
      throw new Error(uploadRes.data.message);
    }
    const { key, uploadUrl } = uploadRes.data.data;

    console.log(uploadRes.data.data);

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
    throw new Error("Image upload failed.");
  }
};

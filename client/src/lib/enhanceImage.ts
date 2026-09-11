import axios from "axios";
import { client } from "@/utils/utils";

export const enhanceImage = async (imageUrl: string): Promise<File> => {
  let res;
  try {
    res = await client.post(
      "/img-upload/enhance",
      {
        imageUrl,
      },
      {
        responseType: "blob",
      },
    );
  } catch (error) {
    // With responseType: "blob" a failed enhance arrives as a JSON *blob*.
    // Read it so the server's own message (e.g. "File is too large.")
    // survives instead of becoming an opaque axios error.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      let message = "";
      try {
        const body = JSON.parse(await error.response.data.text());
        message = body?.message || "";
      } catch {
        // Not JSON either — fall through to the generic message.
      }
      throw new Error(message || "Image enhancement failed.");
    }
    throw error;
  }

  // A 2xx that is not an image is an error body, not a picture: wrapping it
  // in a File used to produce a corrupt "enhanced.png" instead of an error.
  const type = res.data?.type ?? "";
  if (!type.startsWith("image/")) {
    let message = "Image enhancement failed.";
    try {
      const body = JSON.parse(await res.data.text());
      message = body?.message || message;
    } catch {
      // Keep the default.
    }
    throw new Error(message);
  }

  return new File([res.data], "enhanced.png", {
    type,
  });
};

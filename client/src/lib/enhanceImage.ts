import { client } from "@/utils/utils";

export const enhanceImage = async (imageUrl: string): Promise<File> => {
  const res = await client.post(
    "/img-upload/enhance",
    {
      imageUrl,
    },
    {
      responseType: "blob",
    },
  );

  return new File([res.data], "enhanced.png", {
    type: res.data.type || "image/png",
  });
};

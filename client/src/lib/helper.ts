import { client } from "./utils";

type ApiResponse<T> = {
  message: string;
  success: boolean;
  data: T[];
};

async function getDataForOptions<T>(tag: string): Promise<T[]> {
  try {
    const res = await client.get<ApiResponse<T>>(`/${tag}`);

    if (!res.data.success) {
      console.error(res.data.message);
      return [];
    }

    return res.data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export { getDataForOptions };

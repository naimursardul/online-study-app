import { client } from "../utils/utils";

type ApiResponse<T> = {
  message: string;
  success: boolean;
  data: T[];
};

// Throws on failure. It used to return [] for both the !success path and the
// throw path, which made its caller's catch unreachable — a failed load
// rendered empty dropdowns as if it had succeeded.
export async function getDataForOptions<T>(tag: string): Promise<T[]> {
  const res = await client.get<ApiResponse<T>>(`/${tag}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load data.");
  }
  return res.data.data;
}

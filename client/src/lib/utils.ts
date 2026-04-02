import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const client = axios.create({
  baseURL:
    import.meta.env.VITE_NODE_ENV === "production"
      ? `${import.meta.env.VITE_PRODUCTION_API}/api`
      : `${import.meta.env.VITE_DEVELOPMENT_API}/api`,
  withCredentials: true,
});
export { client };

/// GET BOARD QUESTION DETAILS from slug
export const getBoardQusetonDetails = (slug: string) => {
  // HSC_Physics-1st_mcq_dhaka_2024
  const obj: {
    level?: string;
    subject?: string;
    questionType?: string;
    institution?: string;
    year?: string;
  } = {};
  if (!slug) return obj;
  const arr = slug.split("_");
  if (arr[0]) obj.level = arr[0] || "";
  if (arr[1]) obj.subject = arr[1] || "";
  if (arr[2]) obj.questionType = arr[2] || "";
  if (arr[3]) obj.institution = arr[3] || "";
  if (arr[4]) obj.year = arr[4] || "";

  return obj;
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBoardQusetonDetails = (slug: string[]) => {
  // board-hsc-science-physics-1-mcq-dhaka-2024
  if (Array.isArray(slug) && slug.length === 2) {
    const text = slug.join("-");
    const arr = text.split("-");
    const record: string[] = [arr[6], arr[7]];
    const obj = {
      standard: arr[0] || "",
      class: arr[1] || "",
      faculty: arr[2] || "",
      subject: arr[3] || "",
      paper: arr[4] || "",
      questionType: arr[5] || "",
      record: [...record] || "",
    };
    return obj;
  }
};

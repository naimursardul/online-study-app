import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBoardQusetonDetails = (slug: string[]) => {
  // board-hsc-science-physics-1-mcq-dhaka-2024
  if (Array.isArray(slug) && slug.length > 0) {
    const text = slug.join("-");
    const arr = text.split("-");
    const obj = {
      standard: arr[0] || "",
      class: arr[1] || "",
      faculty: arr[2] || "",
      subject: arr[3] || "",
      paper: arr[4] || "",
      questionType: arr[5] || "",
      record: [""],
    };
    if (arr[6] && arr[7]) {
      obj.record = [arr[6], arr[7]];
    }

    return obj;
  }
};

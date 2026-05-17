import type {
  IBoardQusetonDetails,
  IField,
  IFormInfo,
  IMasterData,
  IOptionData,
} from "@/types/types";
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

export function createFormInfo(
  method: string,
  route: string,
  fields: IField[],
  data?: Record<string, string>
): IFormInfo {
  function getRoute(route: string, data?: Record<string, string>) {
    if (method === "PUT" && data) {
      return `${route}/${data?._id}`;
    } else return `${route}/create`;
  }
  function getInitData(data?: Record<string, string>) {
    const obj = {};
    for (const field of fields) {
      if (method === "PUT" && data) {
        if (field?.name === "name") {
          (obj as unknown as Record<string, string>)[field.name] = data?.name;
        } else if (field?.inputType === "checkbox") {
          (obj as unknown as Record<string, string[]>)[field.name] = (
            data[field.name] as unknown as { _id: string }[]
          )?.map((d) => d?._id);
        } else
          (obj as unknown as Record<string, string>)[field.name] = (
            data[field.name] as unknown as { _id: string }
          )?._id;
      } else {
        if (field?.inputType === "checkbox") {
          (obj as unknown as Record<string, string[]>)[field.name] = [];
        } else (obj as unknown as Record<string, string>)[field.name] = "";
      }
    }
    return { ...obj };
  }

  return {
    method,
    route: getRoute(route, data),
    fields,
    initData: getInitData(data),
  };
}

/// GET BOARD QUESTION DETAILS from slug
export const getBoardQusetonDetails = (slug: string) => {
  // HSC_Physics-1st_mcq_dhaka_2024
  const obj: IBoardQusetonDetails = {};
  if (!slug) return obj;
  const arr = slug.split("_");
  console.log(arr);
  if (arr[0]) obj.level = arr[0];
  if (arr[1]) obj.subject = arr[1];
  if (arr[2]) obj.questionType = arr[2];
  if (arr[3]) obj.institution = arr[3];
  if (arr[4]) obj.year = arr[4];

  console.log(obj);
  return obj;
};

// QUERY FORM INIT DATA
export function getQueryFormInitData(fields: IField[]) {
  const obj = {};
  for (const field of fields) {
    if (field?.inputType === "checkbox") {
      (obj as unknown as Record<string, string[]>)[field.name] = [];
    } else (obj as unknown as Record<string, string>)[field.name] = "";
  }
  return { ...obj };
}

// CREATE MANUAL OPTIONS
export function createManualOptions(arr: string[]): IOptionData[] {
  if (!Array.isArray(arr)) {
    throw new Error("Input must be an array.");
  }
  return arr.map((_o, i) => {
    return { _id: `${i + 1000}`, name: _o };
  });
}

// GET QUESTION DATA
export function getQuestionDataOption(
  formData: {
    levelId?: string;
    backgroundId?: string[];
    subjectId?: string;
    chapterId?: string;
  },
  masterData: IMasterData,
  fields: IField[]
): IField[] {
  {
    console.log(masterData);
    return fields.map((field) => {
      const fieldName = field.name.endsWith("Id")
        ? field.name.replace("Id", "")
        : field.name;

      switch (fieldName) {
        case "level":
          return {
            ...field,
            optionData: masterData.levels,
          };

        case "background":
          return {
            ...field,
            optionData: masterData.backgrounds?.filter(
              (bg: any) => bg.levelId === formData.levelId
            ),
          };

        case "subject":
          return {
            ...field,
            optionData: masterData.subjects?.filter(
              (sub: any) =>
                String(sub.levelId) === String(formData.levelId) &&
                sub.backgroundId?.some((bgId: string) =>
                  formData.backgroundId?.includes(bgId)
                )
            ),
          };

        case "chapter":
          return {
            ...field,
            optionData: masterData.chapters?.filter(
              (ch: any) => ch.subjectId === formData.subjectId
            ),
          };

        case "topic":
          return {
            ...field,
            optionData: masterData.topics?.filter(
              (topic: any) => topic.chapterId === formData.chapterId
            ),
          };

        case "record":
          return {
            ...field,
            optionData: masterData.records,
          };

        default:
          return field;
      }
    });
  }
}

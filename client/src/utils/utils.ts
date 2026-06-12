import type {
  IField,
  IFormInfo,
  IMasterData,
  IOptionData,
  IqDetails,
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

export function createFormInfo<T extends { _id: string }>(
  method: string,
  route: string,
  fields: IField[],
  data?: T,
): IFormInfo<T> {
  function getRoute() {
    if (method === "PUT" && data?._id) {
      return `${route}/${data._id}`;
    } else return `${route}/create`;
  }
  function getInitData() {
    const obj = {} as T;
    for (const field of fields) {
      const fieldName = field.name as keyof T;
      if (method === "PUT" && data) {
        if (field?.name === "name") {
          obj["name" as keyof T] = data["name" as keyof T];
        } else if (
          field?.inputType === "checkbox" &&
          Array.isArray(data[fieldName])
        ) {
          obj[fieldName] = data[fieldName]?.map((d) => d?._id) as T[keyof T];
        } else {
          obj[fieldName] = (data[fieldName]
            ? (data[fieldName] as { _id?: string })?._id
            : undefined) as unknown as T[keyof T];
        }
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
    route: getRoute(),
    fields,
    initData: getInitData() as T,
  };
}

/// GET BOARD QUESTION DETAILS from slug
export const getBoardQusetonDetails = (
  masterData: IMasterData,
  slug: string,
): IqDetails => {
  // HSC_Physics-1st_mcq_dhaka_2024
  const obj: Record<string, string | undefined> = {};
  if (!slug) return {} as IqDetails;
  const arr = slug.split("_");
  if (arr[0]) obj.level = arr[0];
  if (arr[1]) obj.subject = arr[1];
  if (arr[2]) obj.questionType = arr[2];
  if (arr[3]) obj.institution = arr[3];
  if (arr[4]) obj.year = arr[4];

  const update = { ...obj };
  if (update?.level) {
    update.levelId = masterData.levels.find((l) => l.name === obj.level)?._id;
    if (update.levelId) delete update.level;
  }
  if (update.subject) {
    update.subjectId = masterData.subjects.find((s) =>
      update.levelId
        ? s.levelId === update?.levelId && s.name === obj.subject
        : s.name === obj.subject,
    )?._id;
    if (update.subjectId) delete update.subject;
  }
  return { withName: obj, withId: update };
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
export function getQuestionDataOption<T>(
  formData: T,
  masterData: IMasterData,
  fields: IField[],
): IField[] {
  {
    return fields.map((field) => {
      const fieldName = field.name;

      switch (fieldName) {
        case "levelId":
          return {
            ...field,
            optionData: masterData.levels,
          };

        case "backgroundId":
          return {
            ...field,
            optionData: masterData.backgrounds?.filter(
              (bg) => bg.levelId === formData["levelId" as keyof T],
            ),
          };

        case "subjectId":
          return {
            ...field,
            optionData: masterData.subjects?.filter(
              (sub) =>
                String(sub.levelId) ===
                  String(formData["levelId" as keyof T]) &&
                sub.backgroundId?.some((bgId: string) =>
                  (formData["backgroundId" as keyof T] as string[])?.includes(
                    bgId,
                  ),
                ),
            ),
          };

        case "chapterId":
          return {
            ...field,
            optionData: masterData.chapters?.filter(
              (ch) => ch.subjectId === formData["subjectId" as keyof T],
            ),
          };

        case "topicId":
          return {
            ...field,
            optionData: masterData.topics?.filter(
              (topic) => topic.chapterId === formData["chapterId" as keyof T],
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

// =========================================
// EXTRACT
// =========================================
export const extractIdTo_ = (
  data: IMasterData[keyof IMasterData],
  dataId: string,
  to: string,
) => {
  if (!data || !dataId) return dataId;
  const item = data?.find((item) => item._id === dataId) as Record<
    string,
    string
  >;
  if (item && item[to]) return item[to];
  return dataId;
};

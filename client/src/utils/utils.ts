import type {
  IField,
  IFormInfo,
  IMasterData,
  IOptionData,
  IqDetails,
  IRecordPair,
  IRecordPairOption,
} from "@/types/types";
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseBoardSlug } from "./board-slug";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const client = axios.create({
  baseURL:
    import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_PRODUCTION_API
      : import.meta.env.VITE_DEVELOPMENT_API,
  withCredentials: true,
  // Render's free tier sleeps; a cold start can take tens of seconds, and
  // without a timeout a hung request never resolves at all.
  timeout: 30000,
});

// Registered by AuthProvider (see Auth-context.tsx): the interceptor lives at
// module scope where hooks are unavailable, so the provider injects the
// "session died, log in" behaviour from React-land.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

// These legitimately answer 401 and handle it themselves — a global logout
// redirect on top of their own handling would bounce a user mid-login.
const AUTH_401_ALLOWLIST = [
  "/auth/check-auth",
  "/auth/login-with-phone",
  "/auth/send-otp",
  "/auth/verify-otp",
  "/auth/create-user",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/verify-reset-otp",
  "/auth/reset-password",
];

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      if (unauthorizedHandler && !AUTH_401_ALLOWLIST.includes(url)) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  },
);

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
          // A multi-select holds ids. Populated master-data rows arrive as
          // objects and collapse to their _id; a field with manual options
          // (subject.questionTypes) already holds plain codes, so keep those.
          obj[fieldName] = (data[fieldName] as unknown[]).map((d) =>
            typeof d === "string" ? d : (d as { _id?: string })?._id,
          ) as T[keyof T];
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

// =========================================
// GET BOARD QUESTION DETAILS from slug
// =========================================
export const getBoardQusetonDetails = (
  masterData: IMasterData,
  slug: string,
): IqDetails => {
  if (!slug) return {} as IqDetails;
  // HSC_Physics-1st_mcq_dhaka_2024 — the grammar lives in board-slug.ts so the
  // SEO resolver can share it without importing this axios-bearing module.
  const obj = parseBoardSlug(slug);

  const update: Record<string, string | string[]> = {};
  if (obj?.level) {
    update.levelId =
      masterData.levels.find((l) => l.name === obj.level)?._id || "";
  }
  if (obj.subject) {
    update.subjectId =
      masterData.subjects.find((s) =>
        update.levelId
          ? s.levelId === update?.levelId && s.name === obj.subject
          : s.name === obj.subject,
      )?._id || "";
  }
  if (obj?.institution && obj?.level) {
    update.institutionId =
      masterData.institutions.find(
        (i) => i.name === obj.institution && i.levelId === update.levelId,
      )?._id || "";
  }
  if (obj?.year && obj?.level) {
    update.yearId =
      masterData.years.find(
        (y) => y.name === obj.year && y.levelId === update.levelId,
      )?._id || "";
  }
  return {
    withName: obj,
    withId: {
      ...update,
      questionType: obj?.questionType || "",
    },
  };
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
            optionData: masterData.subjects?.filter((sub) => {
              return (
                String(sub.levelId) ===
                  String(formData["levelId" as keyof T]) &&
                sub.backgroundId.length ===
                  (formData["backgroundId" as keyof T] as string[]).length &&
                sub.backgroundId.every((bgI) =>
                  (formData["backgroundId" as keyof T] as string[]).includes(
                    bgI,
                  ),
                )
              );
            }),
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

        case "recordId": {
          // One option per institution × year combination for the chosen
          // level ("Dhaka-2024"); picking one stores the pair's ids.
          const levelId = formData["levelId" as keyof T];
          const institutions = masterData.institutions?.filter(
            (i) => i.levelId === levelId,
          );
          const years = masterData.years?.filter((y) => y.levelId === levelId);
          const pairOptions: IRecordPairOption[] = (institutions ?? []).flatMap(
            (inst) =>
              (years ?? []).map((yr) => ({
                _id: `${inst._id}_${yr._id}`,
                name: `${inst.name}-${yr.name}`,
                institutionId: inst._id,
                yearId: yr._id,
              })),
          );
          return {
            ...field,
            optionData: pairOptions,
          };
        }

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

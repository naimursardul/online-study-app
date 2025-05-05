import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IField, IFormInfo, IOptionData } from "./type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBoardQusetonDetails = (slug: string[]) => {
  // HSC_Physics-1st_mcq_dhaka_2024
  if (Array.isArray(slug) && slug.length > 0) {
    const text = slug.join("_");
    const arr = text.split("_");
    const obj = {
      level: arr[0] || "",
      subject: arr[1] || "",
      questionType: arr[2] || "",
      institution: arr[3] || "",
      year: arr[4] || "",
    };

    return obj;
  }
};

// export class TFormInfo {
//   method: string;
//   route: string;
//   initData: Record<string, string>;
//   fields: IField[];

//   constructor(
//     method: string,
//     route: string,
//     fields: IField[],
//     data?: Record<string, string>
//   ) {
//     this.method = method;
//     this.route = this.getRoute(route, data);
//     this.fields = fields;
//     this.initData = this.getInitData(data);
//   }

//   private getRoute(route: string, data?: Record<string, string>) {
//     if (this.method === "PUT" && data) {
//       return `${route}/${data?._id}`;
//     } else return `${route}/create`;
//   }

//   private getInitData(data?: Record<string, string>) {
//     const obj = {};
//     for (const field of this.fields) {
//       if (this.method === "PUT" && data) {
//         (obj as unknown as Record<string, string>)[field.name] =
//           data[field.name];
//       } else (obj as unknown as Record<string, string>)[field.name] = "";
//     }
//     return { ...obj };
//   }
// }

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

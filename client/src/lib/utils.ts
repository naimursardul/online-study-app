import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IField, IFormInfo } from "./type";

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

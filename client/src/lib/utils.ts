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

import axios from "axios";
import { toast } from "sonner";

/**
 * Shared extraction of a user-facing message from any error thrown by `client`.
 *
 * The server's error envelope is `{ success: false, message, errors? }`. When
 * it returns a real 4xx/5xx status (which it does since Part A), axios throws
 * and the message must come out of the catch block. This helper replaces the
 * five competing extraction idioms that existed before — the safe
 * axios.isAxiosError block, optional chaining on `error.response`, inline
 * structural casts, and file-local errorMessage helpers.
 */

interface ApiErrorBody {
  message?: string;
  errors?: { path: string; message: string }[];
}

// Status-specific defaults: the server never sends its own text for these
// classes, so the wording is owned here, once.
function statusDefault(status: number): string | undefined {
  switch (true) {
    case status === 401:
      return "Please log in again.";
    case status === 403:
      return "You do not have permission to perform this action.";
    case status === 404:
      return "Not found.";
    case status === 413:
      return "That file is too large.";
    case status === 429:
      return "Too many requests. Please try again shortly.";
    case status >= 500:
      return "Something went wrong on our end.";
    default:
      return undefined;
  }
}

/**
 * The message to show the user: the server's own message when present, a
 * status-specific default, then `fallback`. Distinguishes "no response"
 * (network drop, timeout, cold start) from an answered error.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    // Network failure, timeout (axios puts "timeout of Nms exceeded" here) or
    // a cold-starting server that never answered.
    return "Could not reach the server.";
  }

  const body = error.response.data as ApiErrorBody | undefined;
  return (
    body?.message ||
    statusDefault(error.response.status) ||
    fallback
  );
}

/**
 * The server's field-level issues (`errors: [{ path, message }]`), so forms
 * can map them onto their inputs with setError instead of showing one toast
 * reading "Validation failed". Empty when the error carries no field data.
 */
export function getApiFieldErrors(
  error: unknown,
): { path: string; message: string }[] {
  if (!axios.isAxiosError(error) || !error.response) {
    return [];
  }
  const body = error.response.data as ApiErrorBody | undefined;
  if (!Array.isArray(body?.errors)) {
    return [];
  }
  return body.errors;
}

/**
 * Map the server's field-level issues onto a react-hook-form form. Each issue
 * whose `path` is one of `fieldNames` becomes `setError(path, …)` so the
 * message lands under its input; the rest (paths the form does not have) are
 * reported via `toast.error` so they are not silently dropped.
 *
 * Returns true when at least one issue was mapped onto a field — the caller
 * then skips its generic toast, since the errors are already visible.
 */
export function applyApiFieldErrors(
  error: unknown,
  fieldNames: readonly string[],
  // RHF's setError is generic over the form's field names; accepting the
  // loose `(name: string, …)` shape lets every form pass its typed instance.
  setError: (path: never, issue: { message: string }) => void,
): boolean {
  let matched = false;
  for (const issue of getApiFieldErrors(error)) {
    if (fieldNames.includes(issue.path)) {
      (setError as (path: string, issue: { message: string }) => void)(
        issue.path,
        { message: issue.message },
      );
      matched = true;
    } else {
      toast.error(issue.message);
    }
  }
  return matched;
}

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

// The shared "the request failed" state. Rendered wherever a failed fetch used
// to fall through to the empty state, making "you have no data" and "we could
// not load your data" indistinguishable (A6.3).
export default function ApiErrorState({
  error,
  onRetry,
  message,
}: {
  // Prefer passing the caught error; the message is extracted with the shared
  // helper so status-specific wording and network-vs-server distinction apply.
  error?: unknown;
  // Fallback when there is no error object (e.g. a fetch returned success:false).
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>Could not load this</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-3">
        <span>
          {error !== undefined
            ? getApiErrorMessage(error, message)
            : (message ?? "Something went wrong. Please try again.")}
        </span>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={onRetry}
          >
            <RefreshCw className="size-3.5" /> Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

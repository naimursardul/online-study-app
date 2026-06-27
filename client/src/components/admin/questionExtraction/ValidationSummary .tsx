import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/alert";
import type { IQuestionValidationResult } from "@/utils/validateQuestion";

interface ValidationSummaryProps {
  result: IQuestionValidationResult;
}

export default function ValidationSummary({ result }: ValidationSummaryProps) {
  if (result?.valid) {
    return (
      <div className="flex items-center gap-2 text-green-500 text-sm pt-2">
        <CheckCircle2 size={16} />
        <span>Ready to upload</span>
      </div>
    );
  }

  return (
    <Alert variant="destructive" className="mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc pl-4 space-y-1">
          {result?.errors.map((err, i) => (
            <li key={i} className="text-sm">
              {err.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

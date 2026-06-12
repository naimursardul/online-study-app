import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface BulkUploadButtonProps {
  allValid: boolean;
  loading: boolean;
  total: number;
  onUpload: () => void;
}

export default function BulkUploadButton({
  allValid,
  loading,
  total,
  onUpload,
}: BulkUploadButtonProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      {!allValid && (
        <p className="text-sm text-destructive">
          Fix all errors before uploading.
        </p>
      )}

      <Button
        onClick={onUpload}
        disabled={!allValid || loading || total === 0}
        className="gap-2 min-w-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={16} />
            Upload All ({total})
          </>
        )}
      </Button>
    </div>
  );
}

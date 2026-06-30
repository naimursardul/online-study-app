import { UploadCloud } from "lucide-react";

interface Props {
  files: File[] | null;
  setFiles: (files: File[]) => void;
}

export function FileUploader({ files, setFiles }: Props) {
  return (
    <label
      className="
      flex
      flex-col
      items-center
      justify-center
      border-2
      border-dashed
      rounded-xl
      p-12
      cursor-pointer
      bg-card
      hover:border-primary
      transition"
    >
      <UploadCloud className="h-10 w-10 mb-3 text-primary" />

      <p className="font-medium">Upload Image or PDF</p>

      <p className="text-sm text-muted-foreground">JPEG, PNG, WEBP, PDF</p>

      <input
        hidden
        type="file"
        accept=".pdf,image/*"
        multiple
        onChange={(e) => {
          const selected = e.target.files;
          if (selected) setFiles(Array.from(selected));
        }}
      />

      {files?.length &&
        files.map((file) => <div className="mt-4 text-sm">{file.name}</div>)}
    </label>
  );
}

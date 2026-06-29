import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Textarea } from "../ui/textarea";
import ReactMarkdownRender from "./ReactMarkdownRender";

export default function TextEditor({
  isFinished = false,
  setIsFinished,
  onChangeFn,
  value = "",
  label,
}: {
  isFinished: boolean;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
  onChangeFn: (val: string) => void;
  value?: string;
  label?: string;
}) {
  const [internalText, setInternalText] = useState(value || "");
  const [previewText, setPreviewText] = useState(value || "");
  const [isRendering, setIsRendering] = useState(false);

  // Debounce markdown rendering
  useEffect(() => {
    if (internalText === previewText) return;

    function setRenderingState() {
      setIsRendering(true);
    }
    setRenderingState();

    const timer = setTimeout(() => {
      setPreviewText(internalText);
      setIsRendering(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [internalText, previewText]);

  // Save when finished
  useEffect(() => {
    if (isFinished) {
      console.log("first");
      console.log(internalText);
      onChangeFn(internalText);
    }
  }, [isFinished]);

  console.log(isFinished);
  return (
    <div className="space-y-1">
      {label && (
        <span className="text-sm font-medium leading-none">{label}</span>
      )}

      <div className="flex max-md:flex-col-reverse gap-6 md:max-h-64">
        {/* Editor */}
        <Textarea
          className="flex-1 resize-none max-md:min-h-52 max-md:max-h-52"
          placeholder="Write markdown..."
          value={internalText}
          onChange={(e) => {
            if (isFinished) setIsFinished(false);
            setInternalText(e.target.value);
          }}
        />

        {/* Preview */}
        <div className="flex-1 border rounded-lg p-2 overflow-auto max-md:min-h-48 max-md:max-h-48">
          {isRendering ? (
            <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Rendering preview...</span>
            </div>
          ) : (
            <ReactMarkdownRender text={previewText} />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Textarea } from "../ui/textarea";
import ReactMarkdownRender from "./ReactMarkdownRender";

export default function TextEditor({
  onChangeFn,
}: {
  onChangeFn: (val: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="flex max-md:flex-col-reverse gap-6 md:max-h-64">
      {/* Editor */}
      <Textarea
        className="flex-1 resize-none max-md:min-h-52 max-md:max-h-52"
        placeholder="Write markdown..."
        onChange={(e) => {
          setText(e.target.value);
          onChangeFn(e.target.value);
        }}
      />

      {/* Preview */}
      <div className="flex-1 border rounded-lg p-2 overflow-auto max-md:min-h-48 max-md:max-h-48">
        <ReactMarkdownRender text={text} />
      </div>
    </div>
  );
}

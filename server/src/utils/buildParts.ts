interface BuildPartsOptions {
  systemPrompt: string;
  userText: string;
  pdfFile?: Express.Multer.File;
  imageFiles?: Express.Multer.File[];
}

export function buildParts({
  systemPrompt,
  userText,
  pdfFile,
  imageFiles = [],
}: BuildPartsOptions) {
  const parts: any[] = [
    {
      text: `${systemPrompt}\n\n${userText}`,
    },
  ];

  // PDF
  if (pdfFile) {
    parts.push({
      inline_data: {
        mime_type: "application/pdf",
        data: pdfFile.buffer.toString("base64"),
      },
    });

    return parts;
  }

  // Images
  imageFiles.forEach((file) => {
    parts.push({
      inline_data: {
        mime_type: file.mimetype,
        data: file.buffer.toString("base64"),
      },
    });
  });

  return parts;
}

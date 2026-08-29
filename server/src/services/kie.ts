import axios from "axios";

const KIE_API_URL =
  "https://api.kie.ai/gemini/v1/models/gemini-3-7-flash:streamGenerateContent";

interface GenerateContentOptions {
  parts: any[];
}

export async function generateContent({ parts }: GenerateContentOptions) {
  const response = await axios.post(
    KIE_API_URL,
    {
      stream: false,

      contents: [
        {
          role: "user",
          parts,
        },
      ],

      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.KIE_API_KEY}`,
        "Content-Type": "application/json",
      },

      timeout: 300000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    },
  );

  const text =
    response.data?.candidates?.[0]?.content?.parts?.find(
      (part: any) => typeof part.text === "string",
    )?.text ?? "{}";

  return {
    raw: response.data,
    text,
  };
}

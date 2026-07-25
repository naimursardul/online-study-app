import axios from "axios";

const BASE_URL = "https://api.kie.ai";

const PROMPT = `
You are an image enhancement engine.

Your only task is to recreate the uploaded image with higher quality.

Preserve every element exactly as it appears, including:
- all text
- mathematical expressions
- diagrams
- arrows
- tables
- labels
- symbols
- colours
- spacing
- layout
- orientation

Improve only:
- resolution
- sharpness
- readability
- noise reduction
- lighting
- perspective correction (if needed)

Do NOT:
- add anything
- remove anything
- correct spelling
- translate text
- infer missing content
- redesign the diagram
- simplify shapes
- modify colours
- crop the image
- change the aspect ratio

Return ONLY the final enhanced image.
`;

export class NanoBananaService {
  private api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${process.env.KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  async enhance(imageUrl: string): Promise<Buffer> {
    const taskId = await this.createTask(imageUrl);

    const resultUrl = await this.waitForResult(taskId);

    return this.downloadImage(resultUrl);
  }

  private async createTask(imageUrl: string): Promise<string> {
    const { data } = await this.api.post("/api/v1/jobs/createTask", {
      model: "nano-banana-2-lite",
      input: {
        image_urls: [imageUrl],
        prompt: PROMPT,
        aspect_ratio: "auto",
      },
    });

    if (!data?.data?.taskId) {
      throw new Error("Failed to create Nano Banana task");
    }

    return data.data.taskId;
  }

  private async waitForResult(taskId: string): Promise<string> {
    const MAX_RETRY = 120;

    for (let i = 0; i < MAX_RETRY; i++) {
      const { data } = await this.api.get("/api/v1/jobs/recordInfo", {
        params: {
          taskId,
        },
      });

      const task = data.data;

      switch (task.state) {
        case "success": {
          const result = JSON.parse(task.resultJson);

          return result.resultUrls[0];
        }

        case "fail":
          throw new Error(task.failMsg || "Nano Banana failed.");

        case "waiting":
        case "queuing":
        case "generating":
          await new Promise((r) => setTimeout(r, 2000));
          break;

        default:
          throw new Error(`Unknown state ${task.state}`);
      }
    }

    throw new Error("Nano Banana timeout.");
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
    });

    return Buffer.from(res.data);
  }
}

export default new NanoBananaService();

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileQuestion } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { client } from "@/utils/utils";
import { toast } from "sonner";
import MCQCard from "./MCQCard";
import CQCard from "./CQCard";
import type {
  IExtractedCQQuestion,
  IExtractedMcqQuestion,
} from "@/types/types";

const data = {
  questionType: "CQ",
  questions: [
    {
      statement:
        "[Figure: River with boat velocities and angles]\n\n$4\text{ kmh}^{-1}$ বেগে প্রবাহিত স্রোতের নদীতে স্রোতের সাথে $8\text{ kmh}^{-1}$ বেগে AB বরাবর নৌকা চালানো শুরু করল। 10 মিনিটে নদীর প্রস্থ AD বরাবর D বিন্দুতে পৌঁছে। কিন্তু কোনো একদিন AD বরাবর $10\text{ kmh}^{-1}$ বেগে নৌকা চালানো শুরু করে AC বরাবর C বিন্দুতে পৌঁছে।",
      subQuestions: [
        {
          questionNo: "2",
          question:
            "নৌকাটির লব্ধি বেগ ও স্রোতের বেগের মধ্যবর্তী কোণের মান নির্ণয় কর।",
          answer:
            "দেওয়া আছে, স্রোতের বেগ, $u = 4\text{ kmh}^{-1}$\nনৌকার বেগ, $v = 8\text{ kmh}^{-1}$\nধরি, স্রোতের বেগ ও নৌকার বেগের মধ্যবর্তী কোণ $\alpha$\nনৌকাটি AB বরাবর যাত্রা করে প্রস্থ AD বরাবর D বিন্দুতে পৌঁছায়।\nসুতরাং, স্রোতের দিকে অতিক্রান্ত দূরত্ব শূন্য। স্রোতের দিকে নৌকার বেগের উপাংশ,\n$v\cos\alpha$\nএখন, $(u + v\cos\alpha) \times t = 0$\n$\Rightarrow \alpha = \cos^{-1}\left(-\frac{u}{v}\right) = \cos^{-1}\left(-\frac{4}{8}\right) = 120^\circ$\n$\therefore$ নৌকা ও স্রোতের বেগের লব্ধি বেগের মান\n$R = \sqrt{u^2 + v^2 + 2uv\cos\alpha}$\n$= \sqrt{4^2 + 8^2 + 2 \times 4 \times 8 \times \cos(120^\circ)}$\n$= 4\sqrt{3}\text{ kmh}^{-1}$",
        },
        {
          questionNo: "3",
          question:
            "নদীর প্রস্থ AD ও স্রোতের দৈর্ঘ্য বরাবর অতিক্রান্ত দূরত্ব DC সমান হবে কি-না? গাণিতিক বিশ্লেষণপূর্বক মতামত দাও।",
          answer:
            "উদ্দীপক হতে পাই, ১ম ক্ষেত্রে স্রোত ও নৌকার বেগের মধ্যবর্তী কোণ, $\alpha = 120^\circ$\nAD বরাবর D বিন্দুতে পৌঁছাতে প্রয়োজনীয় সময়,\n$t = 10\text{ min} = \frac{10}{60}\text{ hr} = \frac{1}{6}\text{ hr}$\nনৌকার বেগ, $v = 8\text{ kmh}^{-1}$\nআমরা জানি, $t = \frac{d}{v\sin\alpha} = \frac{\text{AD}}{v\sin\alpha}$\n$\Rightarrow \text{AD} = t \times v \times \sin\alpha = \frac{1}{6} \times 8 \times \sin(120^\circ) = \frac{2}{\sqrt{3}}\text{ km}$\n\n২য় ক্ষেত্রে, নৌকার বেগ, $v = 10\text{ kmh}^{-1}$\nস্রোতের বেগ, $u = 4\text{ kmh}^{-1}$\nনৌকা ও স্রোতের বেগের মধ্যবর্তী কোণ, $\theta = 90^\circ$\nনদীর অপর পাড়ে পৌঁছাতে প্রয়োজনীয় সময়,\n$t' = \frac{\text{AD}}{v\sin\theta} = \frac{\frac{2}{\sqrt{3}}}{10 \times \sin 90^\circ} = \frac{\sqrt{3}}{15}\text{ hr}$\nএখন, নদীর দৈর্ঘ্য বরাবর অতিক্রান্ত দূরত্ব,\n$\text{DC} = (u + v\cos\theta) \times t' = (4 + 10\cos 90^\circ) \times \frac{\sqrt{3}}{15}$\n$= \frac{4\sqrt{3}}{15}\text{ km}$\nএখানে, $\text{AD} \neq \text{DC}$\nসুতরাং, AD ও DC বরাবর অতিক্রান্ত দূরত্ব সমান হবে না।",
        },
      ],
    },
    {
      statement:
        "AB বরাবর সুমনের নৌকার বেগ = $6\text{ ms}^{-1}$\nAC বরাবর শাকিলের নৌকার বেগ = $5.5\text{ ms}^{-1}$\nCB বরাবর স্রোতের বেগ = $1.2\text{ ms}^{-1}$\nনদীর প্রস্থ, AB = $400\text{ m}$\n\n[Figure: River with width AB and paths AC, BC showing angle 120 degrees]",
      subQuestions: [
        {
          questionNo: "3",
          question:
            "সুমন ও শাকিলের মধ্যে কে আগে অপর পাড়ে পৌঁছাবে? গাণিতিক বিশ্লেষণসহ মতামত দাও।",
          answer:
            "দেওয়া আছে, AB বরাবর সুমনের নৌকার বেগ, $v_1 = 6\text{ ms}^{-1}$\nসুমনের নৌকা ও স্রোতের বেগের মধ্যবর্তী কোণ, $\alpha_1 = 90^\circ$\nআবার, AC বরাবর শাকিলের নৌকার বেগ, $v_2 = 5.5\text{ ms}^{-1}$\nশাকিলের নৌকা ও স্রোতের বেগের মধ্যবর্তী কোণ, $\alpha_2 = 120^\circ$\nনদীর প্রস্থ, $d = \text{AB} = 400\text{ m}$\nসুমনের অপর পাড়ে পৌঁছাতে প্রয়োজনীয় সময়, $t_1 = ?$\nশাকিলের অপর পাড়ে পৌঁছাতে প্রয়োজনীয় সময়, $t_2 = ?$\nআমরা জানি, নদীর অপর পাড়ে পৌঁছাতে প্রয়োজনীয় সময়,\n$t = \frac{d}{v\sin\alpha}$\n$\therefore t_1 = \frac{d}{v_1\sin\alpha_1} = \frac{400}{6\sin(90^\circ)}$\n$\therefore t_1 = 66.67\text{ sec}$\nআবার, $t_2 = \frac{d}{v_2\sin\alpha_2} = \frac{400}{5.5\sin(120^\circ)} = 83.978\text{ sec}$\nযেহেতু, $t_1 < t_2$; সেহেতু, সুমন আগে অপর পাড়ে পৌঁছাবে।",
        },
      ],
    },
  ],
};
export default function QuestionExtractor() {
  const [file, setFile] = useState<File | null>(null);

  const [questionType, setQuestionType] = useState("MCQ");
  const [extractedQuestionType, setExtractedQuestionType] = useState(
    data.questionType,
  );

  const [extractAll, setExtractAll] = useState(false);

  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<
    (IExtractedMcqQuestion | IExtractedCQQuestion)[]
  >(data.questions);

  async function handleExtract() {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();

      console.log(file);
      formData.append("file", file);
      formData.append("questionType", questionType);
      formData.append("extractAll", String(extractAll));

      const res = await client.post("/extraction/extract-questions", formData);

      console.log(res.data);
      if (!res.data.success) {
        toast.error(res.data.message || "Failed to extract questions");
        return;
      }
      setQuestions(res.data.questions);
      setExtractedQuestionType(res.data.questionType);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to extract questions");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <FileQuestion className="text-primary" size={34} />

        <div>
          <h1 className="text-3xl font-bold">Question Extractor</h1>

          <p className="text-muted-foreground">
            Extract MCQ & CQ from images and PDFs
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <FileUploader file={file} onFileChange={setFile} />

        <div className="grid md:grid-cols-2 gap-4">
          <Select value={questionType} onValueChange={setQuestionType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="MCQ">MCQ</SelectItem>

              <SelectItem value="CQ">CQ</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(extractAll)}
            onValueChange={(v) => setExtractAll(v === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="false">Single Question</SelectItem>

              <SelectItem value="true">Extract All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExtract}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            "Extract Questions"
          )}
        </Button>
      </Card>

      <div className="mt-8 space-y-6">
        {questions &&
          questions.length > 0 &&
          questions.map((q, i) =>
            extractedQuestionType === "MCQ" ? (
              <MCQCard key={i} question={q as IExtractedMcqQuestion} />
            ) : (
              <CQCard key={i} question={q as IExtractedCQQuestion} />
            ),
          )}
      </div>
    </div>
  );
}

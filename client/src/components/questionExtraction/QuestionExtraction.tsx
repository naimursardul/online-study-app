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
import { MCQCard } from "./McqCard";
import { CQCard } from "./CQCard";
import { client } from "@/utils/utils";
import { toast } from "sonner";

export default function QuestionExtractor() {
  const [file, setFile] = useState<File | null>(null);

  const [questionType, setQuestionType] = useState("MCQ");

  const [extractAll, setExtractAll] = useState(false);

  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);

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
            q.questionType === "MCQ" ? (
              <MCQCard key={i} question={q} />
            ) : (
              <CQCard key={i} question={q} />
            ),
          )}
      </div>
    </div>
  );
}

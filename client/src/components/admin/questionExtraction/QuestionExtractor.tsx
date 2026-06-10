import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileQuestion, Pencil, Check } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { client } from "@/utils/utils";
import { toast } from "sonner";
import MCQCard from "./MCQCard";
import CQCard from "./CQCard";
import GlobalMetadataPanel from "./GlobalMetadataPanel";
import type {
  IBaseQuestion,
  ICQWithMeta,
  IExtractionResponse,
  IMCQWithMeta,
  IQuestionWithMeta,
} from "@/types/types";
import { validateAll } from "@/utils/validateQuestion";

// -------------------------
// Default meta state
// -------------------------
const defaultMeta: IBaseQuestion = {
  questionType: "MCQ",
  levelId: "",
  backgroundId: [],
  subjectId: "",
  chapterId: "",
  topicId: "",
  record: [],
  recordId: [],
  marks: 0,
  timeRequired: 0,
  difficulty: "Medium",
};

// -------------------------
// Map raw API response → IQuestionWithMeta[]
// -------------------------
function enrichQuestions(
  response: IExtractionResponse,
  meta: IBaseQuestion,
): IQuestionWithMeta[] {
  if (response.questionType === "MCQ") {
    return (response.questions as IExtractionResponse["questions"]).map(
      (q) => ({
        ...(q as IMCQWithMeta),
        ...meta,
        questionType: "MCQ" as const,
      }),
    );
  }

  return (response.questions as IExtractionResponse["questions"]).map((q) => {
    const cq = q as ICQWithMeta;
    return {
      ...cq,
      ...meta,
      questionType: "CQ" as const,
      subQuestions: cq.subQuestions.map((sq) => ({
        ...sq,
        chapterId: meta.chapterId ?? "",
        topicId: meta.topicId ?? "",
      })),
    };
  });
}

export default function QuestionExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState("MCQ");
  const [extractAll, setExtractAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Global metadata state
  const [meta, setMeta] = useState<IBaseQuestion>(defaultMeta);

  // Enriched questions state
  const [questions, setQuestions] = useState<IQuestionWithMeta[]>([]);

  // Extracted question type — drives which card to render
  const [extractedQuestionType, setExtractedQuestionType] =
    useState<IBaseQuestion["questionType"]>("MCQ");

  // -------------------------
  // Update a single question in state
  // -------------------------
  function handleQuestionChange(index: number, updated: IQuestionWithMeta) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)));
  }

  // -------------------------
  // Propagate global meta changes to all questions
  // -------------------------
  function handleMetaChange(updatedMeta: IBaseQuestion) {
    setMeta(updatedMeta);
    setQuestions((prev) =>
      prev.map(
        (q) =>
          ({
            ...q,
            ...updatedMeta,
            questionType: q.questionType,
            // preserve CQ subQuestions chapter/topic overrides
            ...(q.questionType === "CQ" && {
              subQuestions: (q as ICQWithMeta).subQuestions.map((sq) => ({
                ...sq,
                chapterId: updatedMeta.chapterId || sq.chapterId,
                topicId: updatedMeta.topicId || sq.topicId,
              })),
            }),
          }) as IQuestionWithMeta,
      ),
    );
  }

  // -------------------------
  // Extract handler
  // -------------------------
  async function handleExtract() {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("questionType", questionType);
      formData.append("extractAll", String(extractAll));

      const res = await client.post("/extraction/extract-questions", formData);

      console.log(res);
      if (!res.data.success) {
        toast.error(res.data.message || "Failed to extract questions");
        return;
      }

      const response: IExtractionResponse = res.data;
      setExtractedQuestionType(response.questionType);
      setQuestions(enrichQuestions(response, meta));
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.error || "Failed to extract questions");
    } finally {
      setLoading(false);
    }
  }

  // inside QuestionExtractor, above return:
  const validationResults = useMemo(() => validateAll(questions), [questions]);

  const allValid = validationResults.every((r) => r.valid);
  return (
    <div className="container mx-auto py-10 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileQuestion className="text-primary" size={34} />
        <div>
          <h1 className="text-3xl font-bold">Question Extractor</h1>
          <p className="text-muted-foreground">
            Extract MCQ & CQ from images and PDFs
          </p>
        </div>
      </div>

      {/* File + options */}
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

      {/* Global metadata — only shown after extraction */}
      {questions.length > 0 && (
        <>
          <GlobalMetadataPanel
            meta={meta}
            setMeta={(updated) => handleMetaChange(updated as IBaseQuestion)}
          />

          {/* Edit All toggle */}
          <div className="flex justify-end">
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode((prev) => !prev)}
              className="gap-2"
            >
              {editMode ? (
                <>
                  <Check size={16} />
                  Done Editing
                </>
              ) : (
                <>
                  <Pencil size={16} />
                  Edit All
                </>
              )}
            </Button>
          </div>

          {/* Question cards */}
          <div className="space-y-6">
            {questions.map((q, i) =>
              extractedQuestionType === "MCQ" ? (
                <MCQCard
                  key={i}
                  question={q as IMCQWithMeta}
                  editMode={editMode}
                  onChange={(updated) => handleQuestionChange(i, updated)}
                  validationResult={validationResults[i]}
                />
              ) : (
                <CQCard
                  key={i}
                  question={q as ICQWithMeta}
                  editMode={editMode}
                  onChange={(updated) => handleQuestionChange(i, updated)}
                  validationResult={validationResults[i]}
                />
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
